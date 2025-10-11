import os
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FoodAnalysis")

load_dotenv()

router = APIRouter(prefix="/food", tags=["Food Analysis"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.error("❌ GEMINI_API_KEY missing in environment variables.")
    gemini_model = None
else:
    logger.info("✅ Gemini API key loaded successfully.")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.0-flash")

@router.post("/analyse")
async def analyse_food(file: UploadFile = File(...)):
    """
    Analyze uploaded food image for pregnancy safety and nutritional value.
    """
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured on the server.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    try:
        image_data = await file.read()
        prompt = (
            "Analyze this food image for pregnancy safety and nutrition:\n"
            "1. Identify the food items.\n"
            "2. Rate pregnancy safety (Safe / Use with caution / Avoid).\n"
            "3. List nutritional benefits.\n"
            "4. Mention potential risks (if any).\n"
            "5. Provide a concise recommendation with confidence level.\n"
            "Keep it short, structured, and easy to read. Use bullet points where appropriate. and make it short and sweet with calories info if possible. Make it even more concise. Keep it under 100 words. also at the end suggest few more food items that are good for pregnancy. as per the image identified to burn of their craving"
        )

        response = gemini_model.generate_content(
            contents=[prompt, {"mime_type": file.content_type, "data": image_data}],
            generation_config={
                "temperature": 0.3,
                "top_p": 0.8,
                "max_output_tokens": 512
            },
        )

        response.resolve()
        result_text = response.text.strip() if response.text else None

        if not result_text:
            raise ValueError("Empty analysis response from Gemini API")

        return {"analysis_text": result_text}

    except Exception as e:
        logger.error(f"Error analyzing food image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Food analysis failed: {str(e)}")
