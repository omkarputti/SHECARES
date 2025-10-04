import datetime
import os
import json
import tempfile
from io import BytesIO

# Core FastAPI & Pydantic
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from dotenv import load_dotenv

# Machine Learning & Data Handling
import pandas as pd
import joblib

# Google Generative AI
import google.generativeai as genai
from PIL import Image

# Speech Recognition & Synthesis
import speech_recognition as sr
from gtts import gTTS

load_dotenv()

# --- 1. App & Services Initialization ---
app = FastAPI(
    title="SheCares AI API",
    description="An integrated API for cycle prediction, pregnancy tools, and AI-powered health assistance.",
    version="3.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://she-cares-oscorp.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health AI Model Loading ---
try:
    # Path is relative to the project root, where Vercel runs the function.
    model_path = os.path.join(os.path.dirname(__file__), "period_predictor_model.pkl")
    period_model_pipeline = joblib.load(model_path)
except FileNotFoundError:
    # Fallback for environments where the CWD is the project root
    try:
        period_model_pipeline = joblib.load("api/period_predictor_model.pkl")
    except FileNotFoundError:
        print("Warning: period_predictor_model.pkl not found. Advanced prediction endpoints will fail.")
        period_model_pipeline = None

# --- Gemini AI Configuration ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("CRITICAL: GEMINI_API_KEY environment variable not set. Gemini endpoints will fail.")
    gemini_model = None
else:
    genai.configure(api_key=api_key)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")

# --- 2. Pydantic Request Models ---
class DueDateRequest(BaseModel):
    lmp_date: datetime.date = Field(..., example="2025-01-01")

class AdvancedPeriodRequest(BaseModel):
    last_period_date: datetime.date
    age: int
    bmi: float
    stress_level: int
    sleep_hours: float
    period_length: int
    exercise_freq: str
    diet: str
    symptoms: str

class ChatbotRequest(BaseModel):
    user_input: str = Field(..., min_length=3)

# --- 3. API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the SheCares AI API"}

@app.post("/calculate-due-date")
def calculate_due_date(request: DueDateRequest):
    due_date = request.lmp_date + datetime.timedelta(days=280)
    return {"estimated_due_date": due_date.strftime("%Y-%m-%d")}

@app.post("/predict-ovulation/advanced")
def predict_ovulation_advanced(request: AdvancedPeriodRequest):
    if period_model_pipeline is None:
        raise HTTPException(status_code=503, detail="Machine Learning model is not available.")

    df_data = {
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
    next_period_date = request.last_period_date + datetime.timedelta(days=predicted_cycle_length)
    ovulation_date = next_period_date - datetime.timedelta(days=14)
    fertile_window_start = ovulation_date - datetime.timedelta(days=5)

    return {
        "predicted_cycle_length_days": predicted_cycle_length,
        "next_period_predicted_date": next_period_date.strftime("%Y-%m-%d"),
        "approximate_ovulation_date": ovulation_date.strftime("%Y-%m-%d"),
        "fertile_window_start": fertile_window_start.strftime("%Y-%m-%d"),
        "fertile_window_end": ovulation_date.strftime("%Y-%m-%d")
    }

@app.post("/chatbot")
def get_simple_chatbot_response(request: ChatbotRequest):
    """Provides a simple, rule-based response for common questions."""
    responses = {
        "pregnancy": "For a healthy pregnancy, focus on a balanced diet rich in iron and folate, stay hydrated, and engage in light exercise like walking. Always consult your doctor for personalized advice.",
        "period": "To alleviate period cramps, you can try using a hot water bag, doing gentle yoga stretches, or some mild exercise. If pain is severe, please see a doctor.",
        "mental": "For mental well-being, practicing mindfulness can be helpful. Take a few deep breaths, consider journaling your thoughts, or try a guided meditation for 5-10 minutes."
    }
    user_input_lower = request.user_input.lower()
    for keyword, response in responses.items():
        if keyword in user_input_lower:
            return {"bot_response": response}
    return {"bot_response": "I'm here to help! Please ask a question about pregnancy, periods, or mental health."}

@app.post("/analyse-food")
async def analyse_food(file: UploadFile = File(...)):
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI model is not configured.")
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        prompt = (
            "Analyse this food image in the context of women's health with respect pregnancy as a context!"
            "Return a clean JSON object (no markdown) with fields: "
            "'items' (list of strings), 'safe_to_eat' (boolean), "
            "'confidence_score' (float 0-1), 'pros' (list of strings), 'cons' (list of strings)."
        )
        response = gemini_model.generate_content([prompt, image])
        clean_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_text)
    except json.JSONDecodeError:
        return {"analysis_text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/text")
async def chat_text(message: str = Form(...)):
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI model is not configured.")
    try:
        contextual_message = f"You are a helpful, empathetic AI assistant for women's health. A user asks: '{message}'"
        response = gemini_model.generate_content(contextual_message)
        return {"reply": response.text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/chat/voice")
async def chat_voice(file: UploadFile = File(...), return_audio: bool = Form(False)):
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI model is not configured.")
    
    # Create a temporary file to store the uploaded audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio_in:
        contents = await file.read()
        temp_audio_in.write(contents)
        audio_in_path = temp_audio_in.name
    
    try:
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_in_path) as source:
            audio_data = recognizer.record(source)
            user_text = recognizer.recognize_google(audio_data)
        
        contextual_message = f"You are a helpful AI assistant for women's health. User asks: '{user_text}'"
        gemini_response = gemini_model.generate_content(contextual_message).text
        
        if not return_audio:
            return {"user_text": user_text, "reply": gemini_response}
        
        # If audio response is requested, generate TTS
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio_out:
            tts = gTTS(text=gemini_response, lang='en')
            tts.save(temp_audio_out.name)
            return FileResponse(temp_audio_out.name, media_type="audio/mpeg", filename="response.mp3")
            
    except sr.UnknownValueError:
        raise HTTPException(status_code=400, detail="Could not understand the audio.")
    except sr.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Speech recognition service error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the temporary input audio file
        if os.path.exists(audio_in_path):
            os.remove(audio_in_path)
