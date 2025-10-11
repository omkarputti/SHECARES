import datetime
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import pandas as pd
import joblib

# --- Local imports ---
from food_analysis import router as food_router
from chat_ai import router as chat_router

load_dotenv()

# --- FastAPI App Initialization ---
app = FastAPI(
    title="SheCares AI API",
    description="An integrated API for cycle prediction, pregnancy tools, and AI-powered health assistance.",
    version="3.2.0"
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load ML Model ---
try:
    period_model_pipeline = joblib.load("period_predictor_model.pkl")
except FileNotFoundError:
    print("⚠️ Warning: 'period_predictor_model.pkl' not found.")
    period_model_pipeline = None

# --- Request Models ---
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

# --- Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the SheCares AI API"}

# --- Due Date Calculator ---
@app.post("/calculate-due-date")
def calculate_due_date(request: DueDateRequest):
    due_date = request.lmp_date + datetime.timedelta(days=280)
    return {"estimated_due_date": due_date.strftime("%Y-%m-%d")}

# --- Period Prediction (Advanced) ---
@app.post("/predict-ovulation/advanced")
def predict_ovulation_advanced(request: AdvancedPeriodRequest):
    if period_model_pipeline is None:
        raise HTTPException(status_code=503, detail="Machine Learning model unavailable.")

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

# --- Include Separate Routers ---
app.include_router(food_router)
app.include_router(chat_router)
