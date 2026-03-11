import os
import re
import time
import json
import datetime
from typing import Dict, Any

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
#backend for food suggestions and period tracking

# Load environment variables
load_dotenv()

# API key check
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is required in the .env file")

# Port and allowed origins
PORT = int(os.getenv("PORT", 8001))
_env_allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8080")
if not _env_allowed or _env_allowed.strip() == "*":
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [o.strip() for o in _env_allowed.split(",") if o.strip()]

# Configure Gemini SDK
genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI
app = FastAPI(title="Combined Health Assistant API")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# FOOD SUGGESTIONS MODULE (UNCHANGED)
# =====================================================================

class SuggestRequest(BaseModel):
    medicineName: str

class SuggestResponse(BaseModel):
    before: list[str]
    after: list[str]

# In-memory cache for food suggestions
_food_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SEC = 60 * 30  # 30 minutes

def cache_result(key: str, value: Dict[str, Any]):
    _food_cache[key] = {"ts": time.time(), "value": value}

def get_cached(key: str):
    v = _food_cache.get(key)
    if not v:
        return None
    if time.time() - v["ts"] > CACHE_TTL_SEC:
        del _food_cache[key]
        return None
    return v["value"]

def sanitize_input(s: str) -> str:
    s = str(s or "").strip()
    s = re.sub(r"\s+", " ", s)
    return s[:120]

def extract_json_object(text: str):
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except Exception:
        return None

@app.post("/api/food-suggestions", response_model=SuggestResponse)
async def food_suggestions(req: SuggestRequest):
    name_raw = req.medicineName
    if not isinstance(name_raw, str) or not name_raw.strip():
        raise HTTPException(status_code=400, detail="medicineName is required")

    name = sanitize_input(name_raw)
    cache_key = f"food:{name.lower()}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    prompt = (
        f"You are a helpful assistant. Given the medicine name below, return a strict JSON object "
        f"with two arrays: {{ \"before\": [...], \"after\": [...] }}.\n\n"
        f"Each array should list short food items (1–4 words each) that are appropriate to eat "
        f"BEFORE or AFTER taking the medicine to help absorption or reduce side effects. "
        f"Return only JSON, no extra commentary. If unknown, return empty arrays.\n\n"
        f'Medicine: "{name}"\n\nOutput ONLY valid JSON.'
    )

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        raw_text = response.text.strip() if response.text else ""
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI request failed: {str(e)}")

    parsed = extract_json_object(raw_text)
    if parsed is None:
        parsed = {"before": [], "after": []}

    before = [str(x).strip() for x in parsed.get("before", [])][:12]
    after = [str(x).strip() for x in parsed.get("after", [])][:12]

    result = {"before": before, "after": after}
    cache_result(cache_key, result)
    return result

# =====================================================================
# PERIOD TRACKING MODULE (UPDATED WITH DATE RANGES)
# =====================================================================

class AdvancedPeriodRequest(BaseModel):
    age: int
    bmi: float
    stress_level: int
    exercise_freq: int
    sleep_hours: float
    diet: str
    period_length: int
    symptoms: str
    last_period_date: datetime.date

class ChatRequest(BaseModel):
    session_id: str
    user_message: str

# In-memory chat store
chat_sessions = {}

# Dummy ML model (replace with your actual trained model)
period_model_pipeline = None

def format_date_range(start_date, end_date):
    """Format dates as DD-MM-YYYY to DD-MM-YYYY"""
    return f"{start_date.strftime('%d-%m-%Y')} to {end_date.strftime('%d-%m-%Y')}"

def format_single_date(date):
    """Format single date as DD-MM-YYYY"""
    return date.strftime('%d-%m-%Y')

@app.post("/predict-ovulation/advanced")
def predict_ovulation_advanced(request: AdvancedPeriodRequest):
    # Calculate cycle length with some variance
    if period_model_pipeline is None:
        # Base cycle length
        base_cycle = 28
        
        # Add variance based on factors
        stress_variance = (request.stress_level - 5) * 0.5  # ±2.5 days
        bmi_variance = 0
        if request.bmi < 18.5:
            bmi_variance = 2
        elif request.bmi > 25:
            bmi_variance = 1
            
        predicted_cycle_length = int(round(base_cycle + stress_variance + bmi_variance))
        # Ensure cycle is within realistic range
        predicted_cycle_length = max(21, min(35, predicted_cycle_length))
    else:
        try:
            df_data = {
                'Last Period': [request.last_period_date],
                'Age': [request.age],
                'BMI': [request.bmi],
                'Stress Level': [request.stress_level],
                'Exercise Frequency': [request.exercise_freq],
                'Sleep Hours': [request.sleep_hours],
                'Diet': [request.diet],
                'Period Length': [request.period_length],
                'Symptoms': [request.symptoms]
            }
            input_df = pd.DataFrame(df_data)
            predicted_cycle_length = int(round(period_model_pipeline.predict(input_df)[0]))
            predicted_cycle_length = max(21, min(35, predicted_cycle_length))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model prediction failed: {e}")

    # Calculate date ranges instead of exact dates
    # Period can vary by ±3 days typically
    cycle_variance = 3
    
    # Next period date range
    next_period_earliest = request.last_period_date + datetime.timedelta(days=predicted_cycle_length - cycle_variance)
    next_period_latest = request.last_period_date + datetime.timedelta(days=predicted_cycle_length + cycle_variance)
    
    # Ovulation typically occurs 14 days before next period
    ovulation_earliest = next_period_earliest - datetime.timedelta(days=14)
    ovulation_latest = next_period_latest - datetime.timedelta(days=14)
    
    # Fertile window is typically 5 days before ovulation to 1 day after
    fertile_window_start = ovulation_earliest - datetime.timedelta(days=5)
    fertile_window_end = ovulation_latest + datetime.timedelta(days=1)

    model_result = {
        "predicted_cycle_length_days": f"{predicted_cycle_length - cycle_variance} to {predicted_cycle_length + cycle_variance}",
        "next_period_date_range": format_date_range(next_period_earliest, next_period_latest),
        "ovulation_date_range": format_date_range(ovulation_earliest, ovulation_latest),
        "fertile_window": format_date_range(fertile_window_start, fertile_window_end),
        "last_period_date": format_single_date(request.last_period_date)
    }

    # Summarize input for Gemini
    user_data_summary = f"""
    Age: {request.age}, BMI: {request.bmi}, Stress Level: {request.stress_level},
    Exercise Freq: {request.exercise_freq} times/week, Sleep: {request.sleep_hours} hrs/day,
    Diet: {request.diet}, Period Length: {request.period_length} days, Symptoms: {request.symptoms}.
    Last Period: {format_single_date(request.last_period_date)}.
    """

    # Create a new chat session with context
    session_id = f"session_{datetime.datetime.now().timestamp()}"
    chat_sessions[session_id] = [
        {"role": "system", "content": "You are a kind and medically aware assistant focused on menstrual health."},
        {"role": "assistant", "content": f"Initial model results: {model_result}. User Data: {user_data_summary}"}
    ]

    # Gemini: ask the first relevant question
    first_prompt = f"""
    You are a women's health assistant. The ML model has provided period predictions.
    Based on the following data, ask **one short and important follow-up question** to improve prediction accuracy.
    Examples of good questions include:
    - "Are you married?"
    - "Have you ever been pregnant?"
    - "Do you have any irregular cycles or hormonal conditions like PCOS?"
    Only ask **one** question now.
    
    Data: {user_data_summary}
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        gemini_response = model.generate_content(first_prompt)
        first_question = gemini_response.text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini failed: {e}")

    chat_sessions[session_id].append({"role": "assistant", "content": first_question})

    return {
        "session_id": session_id,
        "model_results": model_result,
        "first_question": first_question
    }

@app.post("/chat")
def continue_chat(request: ChatRequest):
    session_id = request.session_id
    user_message = request.user_message.strip()

    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found or expired.")

    # Add user message
    chat_sessions[session_id].append({"role": "user", "content": user_message})

    # Build context summary
    history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in chat_sessions[session_id]])

    prompt = f"""
    Continue the conversation as a menstrual health chatbot. 
    The chat so far:
    {history_text}

    If the user has now answered enough key questions (like marital status, pregnancy history, hormonal issues, etc.),
    then:
    - Conclude the conversation politely.
    - Summarize the health insights.
    - Provide an **enhanced final analysis** and **accuracy percentage (0–100%)**.

    Otherwise:
    - Ask **one more short and relevant question**.
    Keep your message brief and natural.
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        reply = response.text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini chat failed: {e}")

    chat_sessions[session_id].append({"role": "assistant", "content": reply})

    return {
        "session_id": session_id,
        "reply": reply
    }

# =====================================================================
# HEALTH CHECK
# =====================================================================

@app.get("/ping")
async def ping():
    return {"ok": True, "message": "Combined Health Assistant API is running"}

@app.get("/")
async def root():
    return {
        "message": "Combined Health Assistant API",
        "endpoints": {
            "food_suggestions": "/api/food-suggestions",
            "period_prediction": "/predict-ovulation/advanced",
            "chat": "/chat",
            "health_check": "/ping"
        }
    }

# Run with: uvicorn combine:app --host 0.0.0.0 --port 8001 --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)