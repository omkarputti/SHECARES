import os
import datetime
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY not found in .env file")

genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Advanced Period & Ovulation Chat Assistant")

# Allow frontend/backend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory chat store
chat_sessions = {}

# Dummy ML model (replace with your actual trained model)
period_model_pipeline = None


# Request models
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


# --- Step 1: Initial Prediction + Gemini First Question ---
@app.post("/predict-ovulation/advanced")
def predict_ovulation_advanced(request: AdvancedPeriodRequest):
    if period_model_pipeline is None:
        predicted_cycle_length = 28  # mock for now
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
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model prediction failed: {e}")

    next_period_date = request.last_period_date + datetime.timedelta(days=predicted_cycle_length)
    ovulation_date = next_period_date - datetime.timedelta(days=14)
    fertile_window_start = ovulation_date - datetime.timedelta(days=5)

    model_result = {
        "predicted_cycle_length_days": predicted_cycle_length,
        "next_period_predicted_date": next_period_date.strftime("%Y-%m-%d"),
        "approximate_ovulation_date": ovulation_date.strftime("%Y-%m-%d"),
        "fertile_window_start": fertile_window_start.strftime("%Y-%m-%d"),
        "fertile_window_end": ovulation_date.strftime("%Y-%m-%d")
    }

    # Summarize input for Gemini
    user_data_summary = f"""
    Age: {request.age}, BMI: {request.bmi}, Stress Level: {request.stress_level},
    Exercise Freq: {request.exercise_freq} times/week, Sleep: {request.sleep_hours} hrs/day,
    Diet: {request.diet}, Period Length: {request.period_length} days, Symptoms: {request.symptoms}.
    Last Period: {request.last_period_date}.
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


# --- Step 2: Continue Chat + Final Result ---
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
