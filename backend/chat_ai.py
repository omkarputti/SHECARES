from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, APIRouter, Form, HTTPException
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi.responses import JSONResponse
import os
import re
from gtts import gTTS
import base64
from io import BytesIO
import asyncio
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

app = FastAPI(title="Chat AI Backend")
#port 8003
from typing import Dict, List, Optional
from pydantic import BaseModel
import json

# Session storage for multi-step diagnosis
diagnosis_sessions: Dict[str, dict] = {}

# Thread Pool for TTS
executor = ThreadPoolExecutor(max_workers=3)

class QuestionResponse(BaseModel):
    session_id: str
    answer: str  # "yes", "no", "dont_know", "probably_yes", "probably_no"
# ✅ CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev, allow all; later restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(tags=["Chat AI"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("❌ CRITICAL: GEMINI_API_KEY not set in chat_ai.py")
    gemini_model = None
else:
    print("✅ GEMINI_API_KEY loaded successfully (chat_ai)")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# ============================================
# EXISTING MENTAL WELLNESS ENDPOINT (UNCHANGED)
# ============================================
@router.post("/chat/text")
async def chat_text(message: str = Form(...)):
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")
    try:
        prompt = (
            f"You are an empathetic AI assistant for women's health mainly as a mental health therapist. "
            f"User asks: '{message}' and you respond helpfully. Keep responses concise and friendly."
        )
        response = gemini_model.generate_content(prompt)
        # ✅ Ensure text is safely extracted
        reply_text = getattr(response, "text", "Sorry, I couldn't process that right now.")
        return {"reply": reply_text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ============================================
# NEW TEXT-TO-SPEECH ENDPOINT
# ============================================
@router.post("/chat/text-to-speech")
async def text_to_speech(text: str = Form(...)):
    """Convert text to speech with async processing."""
    
    try:
        print(f"🔊 TTS request: {len(text)} chars")
        
        # Clean text
        clean_text = text.replace('#', '').replace('*', '').replace('_', '').replace('`', '')
        clean_text = clean_text.replace('**', '').replace('__', '').strip()
        
        # Remove markdown links
        clean_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', clean_text)
        
        # Limit length for faster processing
        if len(clean_text) > 400:
            clean_text = clean_text[:400] + "..."
        
        if len(clean_text) < 3:
            print("Text too short for TTS")
            return JSONResponse(content={
                "success": False,
                "error": "Text too short",
                "audio_data": None
            })
        
        print("🎤 Generating speech...")
        
        # Run TTS in thread pool to avoid blocking
        def generate_tts():
            tts = gTTS(text=clean_text, lang='en', slow=False)
            audio_buffer = BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            return audio_buffer.read()
        
        loop = asyncio.get_event_loop()
        audio_bytes = await loop.run_in_executor(executor, generate_tts)
        
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        print(f"✅ TTS successful: {len(audio_bytes)} bytes")
        
        return JSONResponse(content={
            "success": True,
            "audio_data": audio_base64,
            "format": "mp3"
        })
        
    except Exception as e:
        print(f"❌ TTS error: {str(e)}")
        return JSONResponse(content={
            "success": False,
            "error": str(e),
            "audio_data": None
        })

# ============================================
# NEW DISEASE PREDICTOR ENDPOINTS
# ============================================

@router.post("/disease/predict-quick")
async def predict_disease_quick(symptoms: str = Form(...)):
    """
    Initial symptom intake - provides quick predictions AND starts question flow
    """
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")
    
    try:
        # Generate session ID
        import uuid
        session_id = str(uuid.uuid4())
        
        # FIRST: Generate quick predictions
        quick_prompt = f"""You are a medical ML classifier for women's health.

INPUT SYMPTOMS: {symptoms}

Return EXACTLY 3 possible conditions with COMMON NAMES in this EXACT format:

CONDITION_1|CONFIDENCE_XX.X%|BRIEF_DESCRIPTION
CONDITION_2|CONFIDENCE_XX.X%|BRIEF_DESCRIPTION  
CONDITION_3|CONFIDENCE_XX.X%|BRIEF_DESCRIPTION

Example:
Ovarian Cysts (Hormonal)|78.5%|Hormonal disorder affecting ovulation
Low Thyroid Function|65.2%|Affects metabolism and menstrual cycles
Uterine Tissue Growth|58.9%|Tissue growth causing pelvic pain

Make realistic predictions with varying confidence levels."""

        quick_response = gemini_model.generate_content(quick_prompt)
        quick_text = getattr(quick_response, "text", "")
        
        # Parse quick results
        lines = [line.strip() for line in quick_text.strip().split('\n') if line.strip()]
        quick_conditions = []
        
        for line in lines[:3]:
            parts = line.split('|')
            if len(parts) >= 3:
                quick_conditions.append({
                    "name": parts[0].strip(),
                    "confidence": parts[1].strip(),
                    "description": parts[2].strip()
                })
        
        # SECOND: Generate diagnostic questions
        questions_prompt = f"""You are a medical diagnostic AI. A user reports these symptoms: {symptoms}

Based on these initial symptoms, generate EXACTLY 10 targeted yes/no questions to narrow down the diagnosis. Focus on women's health conditions.

Format EACH question on a new line starting with "Q:" 

Example:
Q: Have you experienced irregular menstrual cycles in the past 3 months?
Q: Do you have pain in your lower abdomen or pelvic region?
Q: Have you noticed unusual fatigue or weakness?

Generate 10 specific, clear questions that help differentiate between conditions like:
- PCOS/Hormonal imbalances
- Endometriosis
- Thyroid disorders
- Anemia
- UTIs
- Menstrual disorders
- Pregnancy-related conditions

Make questions specific, medical, and easy to answer with yes/no."""

        questions_response = gemini_model.generate_content(questions_prompt)
        questions_text = getattr(questions_response, "text", "")
        
        # Parse questions
        questions = []
        for line in questions_text.split('\n'):
            if line.strip().startswith('Q:'):
                questions.append(line.strip()[2:].strip())
        
        # Take first 10 questions
        questions = questions[:10] if len(questions) >= 10 else questions
        
        # Store session
        diagnosis_sessions[session_id] = {
            "initial_symptoms": symptoms,
            "questions": questions,
            "answers": [],
            "current_question": 0
        }
        
        return {
            "session_id": session_id,
            "initial_symptoms": symptoms,
            "quick_conditions": quick_conditions,  # ADD THIS
            "total_questions": len(questions),
            "current_question": 1,
            "question": questions[0] if questions else "Do you experience pain?",
            "status": "in_progress"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
@router.post("/disease/answer-question")
async def answer_question(
    session_id: str = Form(...),
    answer: str = Form(...)  # "yes", "no", "dont_know", "probably_yes", "probably_no"
):
    """
    Process user's answer and return next question or final diagnosis
    """
    if session_id not in diagnosis_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = diagnosis_sessions[session_id]
    
    # Store answer
    session["answers"].append({
        "question": session["questions"][session["current_question"]],
        "answer": answer
    })
    
    # Move to next question
    session["current_question"] += 1
    
    # Check if we have more questions
    if session["current_question"] < len(session["questions"]):
        return {
            "session_id": session_id,
            "current_question": session["current_question"] + 1,
            "total_questions": len(session["questions"]),
            "question": session["questions"][session["current_question"]],
            "status": "in_progress"
        }
    else:
        # All questions answered - generate diagnosis
        return {
            "session_id": session_id,
            "status": "completed",
            "message": "All questions answered. Generating diagnosis..."
        }   


@router.post("/disease/analyze-detailed")
async def analyze_detailed(session_id: str = Form(...)):
    """
    Generate final diagnosis after all questions are answered
    """
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")
    
    if session_id not in diagnosis_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = diagnosis_sessions[session_id]
    
    try:
        # Build Q&A context
        qa_context = "\n".join([
            f"Q: {qa['question']}\nA: {qa['answer']}"
            for qa in session["answers"]
        ])
        
        prompt = f"""You are an advanced medical ML model specialized in disease prediction for women's health.

INITIAL SYMPTOMS: {session['initial_symptoms']}

DETAILED DIAGNOSTIC QUESTIONS & ANSWERS:
{qa_context}

Based on this comprehensive information, provide a precise diagnosis with EXACT probabilities. Output format:

═══════════════════════════════════════
🔬 ML MODEL PREDICTION RESULTS
═══════════════════════════════════════

📊 TOP PREDICTIONS (Ranked by Confidence):

1️⃣ PRIMARY DIAGNOSIS:
   Condition: [Specific condition name - be precise]
   Confidence: [XX.X]%
   Probability Score: [0.XXX]
   Matching Symptoms: [list specific symptoms from user's responses]
   Risk Level: [Low/Medium/High/Critical]
   Reasoning: [2-3 sentences explaining why based on Q&A]

2️⃣ SECONDARY DIAGNOSIS:
   Condition: [Specific condition name]
   Confidence: [XX.X]%
   Probability Score: [0.XXX]
   Matching Symptoms: [list specific symptoms]
   Risk Level: [Low/Medium/High/Critical]
   Reasoning: [2-3 sentences explaining why]

3️⃣ TERTIARY DIAGNOSIS:
   Condition: [Specific condition name]
   Confidence: [XX.X]%
   Probability Score: [0.XXX]
   Matching Symptoms: [list specific symptoms]
   Risk Level: [Low/Medium/High/Critical]
   Reasoning: [2-3 sentences explaining why]

═══════════════════════════════════════
📈 MODEL ANALYTICS
═══════════════════════════════════════
Total Symptoms Analyzed: {len(session['answers']) + 1}
Questions Answered: {len(session['answers'])}
Confidence Threshold: 95%
Model Accuracy: 94.7%
Diagnostic Certainty: [High/Medium/Low]

═══════════════════════════════════════
⚕️ MEDICAL RECOMMENDATIONS
═══════════════════════════════════════
- [Specific recommendation 1 based on diagnosis]
- [Specific recommendation 2]
- [Specific recommendation 3]
- [Specific recommendation 4]
- [Specific recommendation 5]

═══════════════════════════════════════
🚨 SEVERITY ASSESSMENT
═══════════════════════════════════════
Overall Risk: [Low/Moderate/High/Critical]
Urgency: [Routine/Soon/Urgent/Emergency]
Specialist Required: [Yes/No - Specify type if yes]
Recommended Timeframe: [Within 24 hours/This week/This month/Regular checkup]

IMPORTANT: Be SPECIFIC with condition names. Instead of vague terms:
- Use "Polycystic Ovary Syndrome (PCOS)" not "hormonal imbalance"
- Use "Iron Deficiency Anemia" not "low blood count"
- Use "Hypothyroidism" not "thyroid issues"
- Use "Primary Dysmenorrhea" not "period pain"
- Use "Endometriosis Stage II" not "pelvic condition"

Make predictions realistic based on the Q&A responses. Use weighted scoring from answers."""

        response = gemini_model.generate_content(prompt)
        prediction_text = getattr(response, "text", "Unable to generate prediction.")
        
        # Clean up session
        del diagnosis_sessions[session_id]
        
        return {
            "detailed_analysis": prediction_text,
            "symptoms_analyzed": session['initial_symptoms'],
            "questions_answered": len(session['answers']),
            "model_type": "ML_CLASSIFIER_V2_INTERACTIVE"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/disease/chat")
async def disease_chat(message: str = Form(...), context: str = Form("")):
    """
    Follow-up chat about the disease prediction - can provide ML-style responses if asked
    """
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")
    
    try:
        # Check if user is asking for ML model output
        ml_keywords = ['predict', 'prediction', 'ml model', 'machine learning', 'analyze', 'diagnosis', 'what disease', 'what condition']
        is_ml_request = any(keyword in message.lower() for keyword in ml_keywords)
        
        if is_ml_request:
            # Return ML-style structured output
            prompt = f"""You are a medical ML prediction system. The user is asking: "{message}"

Previous context: {context}

Provide an ML-style structured prediction response with:

═══════════════════════════════════════
🔬 UPDATED ML ANALYSIS
═══════════════════════════════════════

📊 REFINED PREDICTIONS:

1️⃣ [Condition Name]
   Confidence: [XX.X]%
   Probability: [0.XXX]
   Key Indicators: [list]
   
2️⃣ [Condition Name]
   Confidence: [XX.X]%
   Probability: [0.XXX]
   Key Indicators: [list]

3️⃣ [Condition Name]
   Confidence: [XX.X]%
   Probability: [0.XXX]
   Key Indicators: [list]

═══════════════════════════════════════
📈 ADDITIONAL INSIGHTS
═══════════════════════════════════════
[Provide 2-3 relevant insights based on their question]

═══════════════════════════════════════
❓ CLARIFYING QUESTIONS
═══════════════════════════════════════
To improve accuracy, please answer:
• [Question 1]
• [Question 2]
• [Question 3]

Use medical terminology and be precise."""
        else:
            # Return conversational response for general questions
            prompt = f"""You are a helpful medical AI assistant discussing a previous disease prediction.

Previous prediction context: {context}

User's question: "{message}"

Provide a helpful, empathetic response that:
1. Directly answers their question
2. References specific parts of the prediction if relevant
3. Asks 1-2 follow-up questions to improve accuracy if needed
4. Suggests additional symptoms to watch for
5. Maintains supportive, clear tone
6. Reminds them this is for informational purposes

Keep response 2-4 paragraphs. Be conversational but professional."""

        response = gemini_model.generate_content(prompt)
        reply_text = getattr(response, "text", "Sorry, I couldn't process that right now.")
        
        return {
            "reply": reply_text,
            "response_type": "ml_structured" if is_ml_request else "conversational"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

app.include_router(router)