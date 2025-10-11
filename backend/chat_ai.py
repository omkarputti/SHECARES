import os
from fastapi import APIRouter, Form, HTTPException
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi.responses import JSONResponse

load_dotenv()

router = APIRouter(prefix="/chat", tags=["Chat AI"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("❌ CRITICAL: GEMINI_API_KEY not set in chat_ai.py")
    gemini_model = None
else:
    print("✅ GEMINI_API_KEY loaded successfully (chat_ai)")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.5-flash")  # <-- define it here


@router.post("/text")
async def chat_text(message: str = Form(...)):
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")
    try:
        prompt = f"You are an empathetic AI assistant for women's health mainly as a mental health therapist. User asks: '{message}' and you respond helpfully. Make sure to keep responses concise and relevant. Chat history is retained for context. Also keep it short, sweet and chat like."
        response = gemini_model.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
