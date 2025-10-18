import os
import json
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

# ---------------- Logging Setup ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FoodAnalysis")

# ---------------- FastAPI App ----------------
app = FastAPI(title="Food Analysis API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Load Gemini API Key ----------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.error("❌ GEMINI_API_KEY missing in environment variables.")
    gemini_model = None
else:
    logger.info("✅ Gemini API key loaded successfully.")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.0-flash")

# ---------------- Helper Function ----------------
def extract_json_from_text(text: str):
    """Extract JSON object from text that might contain code fences or extra text."""
    try:
        # Remove markdown code fences and clean up
        cleaned = text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception:
        logger.warning("⚠️ Could not parse JSON, returning raw text.")
        return None

# ---------------- Main Route ----------------
@app.post("/analyse")
async def analyse_food(file: UploadFile = File(...)):
    """
    Analyze uploaded food image for pregnancy safety and nutritional value.
    """
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Upload an image.")

    try:
        image_data = await file.read()

        prompt = """
        You are a diet and health expert AI.
        Analyze this food image and return a JSON response ONLY in this format:
        {
          "food_name": "string",
          "calories": "string",
          "protein": "string",
          "carbs": "string",
          "fats": "string",
          "fiber": "string",
          "pregnancy_safe": true or false,
          "period_friendly": true or false,
          "recommendations": "string",
          "suggested_foods": ["food1", "food2", "food3"]
        }

        The output must be pure JSON, no markdown, no extra text.
        """

        response = gemini_model.generate_content(
            contents=[prompt, {"mime_type": file.content_type, "data": image_data}],
            generation_config={
                "temperature": 0.2,
                "top_p": 0.8,
                "max_output_tokens": 512
            },
        )

        response.resolve()
        result_text = response.text.strip() if response.text else None

        if not result_text:
            raise ValueError("Empty analysis response from Gemini API")

        parsed_data = extract_json_from_text(result_text)

        if not parsed_data:
            logger.warning(f"Raw Gemini output: {result_text}")
            parsed_data = {
                "food_name": "Unknown",
                "calories": "N/A",
                "protein": "N/A",
                "carbs": "N/A",
                "fats": "N/A",
                "fiber": "N/A",
                "pregnancy_safe": False,
                "period_friendly": False,
                "recommendations": "Could not analyze the food image properly.",
                "suggested_foods": []
            }

        return {
            "success": True,
            "source": "Gemini",
            "report": parsed_data
        }

    except Exception as e:
        logger.error(f"❌ Error analyzing food image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Food analysis failed: {str(e)}")
