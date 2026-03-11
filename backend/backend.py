import os
import json
import logging
import time
import hashlib
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from typing import Optional
import google.generativeai as genai
from PIL import Image
import io
from gtts import gTTS
import base64
from io import BytesIO
import asyncio
from concurrent.futures import ThreadPoolExecutor

# ---------------- Load Environment ----------------
load_dotenv()

# ---------------- Logging Setup ----------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("WellnessAPI")

# ---------------- FastAPI App ----------------
app = FastAPI(title="Women's Wellness Backend", version="3.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Response Cache ----------------
response_cache = {}
CACHE_DURATION = 3600  # 1 hour cache

def get_cache_key(text: str) -> str:
    """Generate cache key from text."""
    return hashlib.md5(text.lower().strip().encode()).hexdigest()

def get_cached_response(query: str) -> str | None:
    """Get cached response if available and not expired."""
    key = get_cache_key(query)
    if key in response_cache:
        cached_data = response_cache[key]
        if time.time() - cached_data['timestamp'] < CACHE_DURATION:
            logger.info(f"✅ Cache HIT - Saved API call!")
            return cached_data['response']
        else:
            del response_cache[key]
    return None

def cache_response(query: str, response: str):
    """Cache a response."""
    key = get_cache_key(query)
    response_cache[key] = {
        'response': response,
        'timestamp': time.time()
    }
    logger.info(f"💾 Response cached (total: {len(response_cache)})")

# ---------------- Thread Pool for TTS ----------------
executor = ThreadPoolExecutor(max_workers=3)

# ---------------- Load Gemini API Key ----------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.error("❌ CRITICAL: GEMINI_API_KEY not set")
    gemini_model = None
else:
    logger.info("✅ GEMINI_API_KEY loaded successfully")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# ---------------- Rate Limiting ----------------
last_request_time = 0
MIN_REQUEST_INTERVAL = 1.5

def check_rate_limit():
    """Simple rate limiting to avoid quota issues."""
    global last_request_time
    current_time = time.time()
    time_since_last = current_time - last_request_time
    
    if time_since_last < MIN_REQUEST_INTERVAL:
        wait_time = MIN_REQUEST_INTERVAL - time_since_last
        logger.info(f"⏱️ Rate limiting: waiting {wait_time:.1f}s...")
        time.sleep(wait_time)
    
    last_request_time = time.time()

# ---------------- Helper Functions ----------------
def extract_json_from_text(text: str) -> dict:
    """Extract JSON object from text."""
    try:
        cleaned = text.replace("```json", "").replace("```", "").strip()
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}") + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = cleaned[start_idx:end_idx]
            return json.loads(json_str)
        
        return json.loads(cleaned)
    except Exception as e:
        logger.warning(f"⚠️ Could not parse JSON: {str(e)}")
        return None

# ---------------- API Endpoints ----------------

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Women's Wellness API v3.0",
        "gemini_configured": gemini_model is not None,
        "cached_responses": len(response_cache),
        "features": ["chat", "tips", "affirmation", "text-to-speech", "caching"],
        "endpoints": {
            "food_analysis": "/analyse",
            "pregnancy_chat": "/pregnancy/chat",
            "pregnancy_tips": "/pregnancy/tips",
            "pregnancy_affirmation": "/pregnancy/affirmation",
            "text_to_speech": "/pregnancy/text-to-speech"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "gemini": "configured" if gemini_model else "not configured",
        "cache_size": len(response_cache),
        "timestamp": time.time()
    }
# ============== FOOD ANALYZER ENDPOINT ==============

@app.post("/analyse")
async def analyse_food(
    file: Optional[UploadFile] = File(None),
    food_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    allergies: Optional[str] = Form(None)
):
    """Analyze food for nutritional content and health info."""
    
    # Add this logging here
    logger.info(f"Ã°Å¸â€œâ€¹ Received allergies input: '{allergies}'")
    
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")

    try:
        check_rate_limit()
        
        prompt = """
You are an expert nutritionist and food safety specialist providing accurate wellness information about food.

Analyze this food and return JSON ONLY (no markdown, no extra text):
{
  "food_name": "actual name of the food",
  "calories": 250,
  "protein": 15,
  "carbs": 30,
  "fats": 10,
  "fiber": 5,
  "pregnancy_safe": false,
  "period_friendly": true,
  "recommendations": "detailed safety and wellness advice about this specific food",
  "suggested_foods": ["healthier alternative 1", "healthier alternative 2", "healthier alternative 3"]
}
ALLERGY CHECKING:
- User allergies provided: {allergies if allergies and allergies.strip() else "NONE"}
- If allergies ARE provided and NOT empty:
  * Carefully check if the food contains ANY of the listed allergens
  * Common allergen sources: 
    - Peanuts: peanut butter, peanut oil, satay sauce, some chocolates, many Asian dishes
    - Tree nuts: almonds, walnuts, cashews, pecans, pistachios
    - Dairy: milk, cheese, butter, yogurt, cream, whey, casein
    - Eggs: mayonnaise, baked goods, pasta
    - Soy: tofu, soy sauce, edamame, many processed foods
    - Wheat/Gluten: bread, pasta, cereals, baked goods
    - Shellfish: shrimp, crab, lobster
    - Fish: salmon, tuna, etc.
    - Sesame: tahini, some breads
  * If food CONTAINS any listed allergen:
    - Set "contains_allergens": true
    - Set "pregnancy_safe": false
    - Set "period_friendly": false  
    - Set "allergy_warning": " ALLERGEN ALERT: This food contains [specific allergen name]. DANGEROUS if you have [allergen] allergy. DO NOT CONSUME. May cause severe allergic reactions including anaphylaxis. Avoid immediately."
    - Set "recommendations": Start with " DANGER: Contains [allergen]. DO NOT consume if you have [allergen] allergy..." followed by other health info
  * If food DOES NOT contain listed allergens:
    - Set "contains_allergens": false
    - Set "allergy_warning": "Ã¢Å“â€¦ Safe for your allergies: This food does not contain [list the allergens user mentioned]. However, always check labels for cross-contamination."
- If NO allergies provided (empty or null):
  * Set "contains_allergens": false
  * Set "allergy_warning": " No allergy information provided. If you have food allergies, please specify them for personalized safety analysis."
CRITICAL SAFETY RULES - BE EXTREMELY ACCURATE:
1. pregnancy_safe should be FALSE for:
   - Ajinomoto/MSG (monosodium glutamate) - neurotoxin concerns
   - Raw/undercooked meats, eggs, fish
   - Unpasteurized dairy products
   - High-mercury fish (tuna, shark, swordfish)
   - Alcohol in any form
   - Raw sprouts
   - Processed foods with artificial additives
   - Foods with high sodium content (>500mg per serving)
   - Artificial sweeteners
   - Energy drinks
   - Excessive caffeine
   - Soft cheeses (feta, brie, blue cheese if unpasteurized)
   - Deli meats (unless heated until steaming)
   - Raw cookie dough or cake batter

2. period_friendly should be FALSE for:
   - Ajinomoto/MSG - can worsen cramps and bloating
   - High-sodium foods - cause water retention and bloating
   - Caffeine/energy drinks - worsen cramps and mood swings
   - Processed/junk foods - increase inflammation
   - Spicy foods - can aggravate digestive issues
   - Alcohol - affects hormones and hydration
   - High-sugar foods - cause energy crashes and mood swings
   - Fried/greasy foods - worsen digestive discomfort

3. period_friendly should be TRUE for:
   - Iron-rich foods (spinach, lentils, red meat)
   - Magnesium-rich foods (dark chocolate, nuts, bananas)
   - Omega-3 foods (salmon, walnuts, flaxseeds)
   - Vitamin B6 foods (chickpeas, tuna, potatoes)
   - Fresh fruits (especially berries, oranges)
   - Herbal teas (ginger, chamomile)
   - Whole grains (oats, quinoa, brown rice)

4. For harmful foods like Ajinomoto/MSG:
   - Set pregnancy_safe: false
   - Set period_friendly: false
   - recommendations MUST include clear warning: " NOT RECOMMENDED during pregnancy or menstruation. Contains MSG/additives that may cause headaches, increase blood pressure, worsen cramps and bloating. Avoid consumption."
   
5. For processed/junk foods:
   - Be honest about low nutritional value
   - Mark pregnancy_safe as false if it contains harmful additives
   - Mark period_friendly as false if high in sodium, sugar, or causes inflammation
   - Provide healthier alternatives in suggested_foods

ACCURACY REQUIREMENTS:
1. Return ONLY valid JSON, no markdown code blocks
2. All nutritional values must be NUMBERS ONLY (not strings like "15g", just 15)
3. Use REALISTIC nutritional data based on actual food composition databases
4. food_name must be the actual food name identified
5. No "g" suffix in numbers - frontend adds units
6. Be honest about food safety - do NOT mark unsafe foods as safe
7. Be accurate about period-friendliness - foods that cause bloating, cramps, or inflammation should be marked FALSE
8. recommendations should be specific to the food being analyzed

Example for "Ajinomoto" or "MSG":
{
  "food_name": "Ajinomoto (MSG)",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fats": 0,
  "fiber": 0,
  "pregnancy_safe": false,
  "period_friendly": false,
  "recommendations": " NOT RECOMMENDED during pregnancy or menstruation. Ajinomoto (MSG) is a flavor enhancer that may cause headaches, nausea, increased blood pressure, and worsen period cramps and bloating. Studies suggest potential risks to fetal brain development. Avoid during pregnancy and menstruation - use natural herbs and spices for flavoring instead.",
  "suggested_foods": ["Sea salt", "Black pepper", "Garlic powder", "Herbs (basil, oregano)", "Lemon juice"]
}

Example for "Dark Chocolate":
{
  "food_name": "Dark Chocolate (70% cacao)",
  "calories": 170,
  "protein": 2,
  "carbs": 13,
  "fats": 12,
  "fiber": 3,
  "pregnancy_safe": true,
  "period_friendly": true,
  "recommendations": "Ã¢Å“â€¦ Great choice for periods! Dark chocolate is rich in magnesium which helps reduce cramps and improves mood. It also contains iron and antioxidants. Limit to 1-2 small squares during pregnancy due to caffeine content. Choose 70%+ cacao for maximum benefits.",
  "suggested_foods": ["Bananas", "Almonds", "Spinach", "Salmon", "Berries"]
}

Example for "Apple":
{
  "food_name": "Apple",
  "calories": 95,
  "protein": 0.5,
  "carbs": 25,
  "fats": 0.3,
  "fiber": 4,
  "pregnancy_safe": true,
  "period_friendly": true,
  "recommendations": "Ã¢Å“â€¦ Excellent choice! Apples are rich in fiber, vitamin C, and antioxidants. They help with digestion, boost immunity, and provide natural energy. Wash thoroughly before eating to remove pesticide residue.",
  "suggested_foods": ["Pear", "Orange", "Banana", "Berries"]
}

Example for "Instant Noodles":
{
  "food_name": "Instant Noodles",
  "calories": 380,
  "protein": 8,
  "carbs": 55,
  "fats": 14,
  "fiber": 2,
  "pregnancy_safe": false,
  "period_friendly": false,
  "recommendations": " NOT RECOMMENDED during pregnancy or menstruation. High in sodium (1500-2000mg per serving) which causes water retention, bloating, and worsens period cramps. Contains preservatives like TBHQ and has minimal nutritional value. The high sodium can cause increased blood pressure. Choose whole grain alternatives instead.",
  "suggested_foods": ["Whole wheat pasta", "Brown rice noodles", "Vegetable soup", "Quinoa"]
}

Example for "Spinach":
{
  "food_name": "Spinach",
  "calories": 23,
  "protein": 3,
  "carbs": 4,
  "fats": 0.4,
  "fiber": 2,
  "pregnancy_safe": true,
  "period_friendly": true,
  "recommendations": "Ã¢Å“â€¦ Excellent choice! Spinach is rich in iron which helps replenish blood loss during periods and prevents anemia during pregnancy. High in folate (essential for fetal development), magnesium (reduces cramps), and vitamins A, C, K. Cook lightly to maximize nutrient absorption.",
  "suggested_foods": ["Kale", "Swiss chard", "Broccoli", "Lentils", "Pumpkin seeds"]
}
{
  "food_name": "actual name of the food",
  "calories": 250,
  "protein": 15,
  "carbs": 30,
  "fats": 10,
  "fiber": 5,
  "pregnancy_safe": false,
  "period_friendly": true,
  "recommendations": "detailed safety and wellness advice about this specific food",
  "suggested_foods": ["healthier alternative 1", "healthier alternative 2", "healthier alternative 3"],
  "contains_allergens": false,
  "allergy_warning": "allergy safety information"
}
Now analyze the provided food with complete accuracy and honesty.
"""

        content_parts = [prompt]
        
        # Handle image upload
        if file and file.filename:
            if not file.content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail="Invalid file type.")
            
            image_data = await file.read()
            
            try:
                image = Image.open(io.BytesIO(image_data))
                image.verify()
                logger.info(f"Ã¢Å“â€¦ Image uploaded: {file.filename}")
            except:
                raise HTTPException(status_code=400, detail="Invalid image file.")
            
            content_parts.append({
                "mime_type": file.content_type,
                "data": image_data
            })
            content_parts.append(text_input)
            logger.info(f"Ã°Å¸â€œÂ Text input with allergies: {text_input}")
        elif food_name:
            text_input = f"Food: {food_name}"
            if description:
                text_input += f"\nDetails: {description}"
            if allergies and allergies.strip():
                text_input += f"\n\nUSER HAS ALLERGIES: {allergies}"
                text_input += f"\nCRITICAL: You MUST check if '{food_name}' contains ANY of these allergens: {allergies}"
                text_input += f"\nIf it contains any allergen, set contains_allergens=true, pregnancy_safe=false, period_friendly=false"
    
            content_parts.append(text_input)
            logger.info(f"Ã°Å¸â€œÂ Analyzing food: {food_name}")
            if allergies and allergies.strip():
                logger.info(f"Ã°Å¸Å¡Â¨ User allergies: {allergies}")
        else:
            raise HTTPException(status_code=400, detail="Provide image or food name.")

        logger.info("Ã°Å¸Â¤â€“ Calling Gemini for food analysis...")
        logger.info(f"Ã°Å¸â€œÂ¤ Content parts: {len(content_parts)} items")
        if food_name:
            logger.info(f"Ã°Å¸ÂÂ½ Food name: {food_name}")
        
        try:
            response = gemini_model.generate_content(
                contents=content_parts,
                generation_config={
                    "temperature": 0.2,  # Lower temperature for more accurate/factual responses
                    "top_p": 0.8,
                    "max_output_tokens": 1024,
                },
                safety_settings=[
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                ]
            )
            logger.info("Ã¢Å“â€¦ Gemini API call completed")
        except Exception as api_error:
            logger.error(f"Ã¢ÂÅ’ Gemini API call failed: {str(api_error)}")
            logger.error(f"Error type: {type(api_error).__name__}")
            raise

        reply_text = None
        try:
            reply_text = response.text.strip()
            logger.info(f"Ã¢Å“â€¦ Got response text, length: {len(reply_text)}")
        except Exception as e:
            logger.warning(f" Could not get response.text: {str(e)}")
            logger.warning(f"Exception type: {type(e).__name__}")
            
            if hasattr(response, 'candidates') and response.candidates:
                logger.info(f"Number of candidates: {len(response.candidates)}")
                candidate = response.candidates[0]
                finish_reason = getattr(candidate, 'finish_reason', None)
                safety_ratings = getattr(candidate, 'safety_ratings', None)
                
                logger.warning(f"Finish reason: {finish_reason}")
                logger.warning(f"Safety ratings: {safety_ratings}")
                
                if finish_reason == 2:  # SAFETY
                    logger.info("Ã°Å¸â€â€ž Response blocked by safety - Retrying with simpler prompt...")
                    simple_prompt = f"Provide basic nutritional information for: {food_name or 'this food'}. Return ONLY valid JSON with these fields: food_name (string), calories (number), protein (number), carbs (number), fats (number), fiber (number), pregnancy_safe (boolean), period_friendly (boolean), recommendations (string), suggested_foods (array of strings). Be honest about food safety. Numbers must be plain integers or floats without any units."
                    try:
                        retry_response = gemini_model.generate_content(
                            simple_prompt,
                            generation_config={"temperature": 0.2, "max_output_tokens": 800},
                            safety_settings=[
                                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                            ]
                        )
                        reply_text = retry_response.text.strip()
                        logger.info("Ã¢Å“â€¦ Retry successful")
                    except Exception as retry_error:
                        logger.error(f"Ã¢ÂÅ’ Retry also failed: {str(retry_error)}")
            else:
                logger.error("Ã¢ÂÅ’ No candidates in response")
        
        if not reply_text:
            logger.warning(" Empty response from Gemini, using fallback")
        else:
            logger.info(f"Ã°Å¸â€œâ€ž Gemini raw response (first 200 chars): {reply_text[:200]}")

        parsed_data = extract_json_from_text(reply_text) if reply_text else None
        
        if parsed_data:
            logger.info(f"Ã¢Å“â€¦ Successfully parsed JSON: {json.dumps(parsed_data, indent=2)[:300]}")
        else:
            logger.warning(" Failed to parse JSON from response")

        # Enhanced fallback logic with safety checks
        if not parsed_data:
            logger.info("Ã°Å¸â€œÅ  Using fallback nutrition data")
            food_display = food_name or "Unknown Food"
            food_lower = food_display.lower()
            
            # Check if it's a known unsafe food
            unsafe_keywords = ['ajinomoto', 'msg', 'monosodium glutamate', 'instant noodles', 
                             'energy drink', 'alcohol', 'raw meat', 'raw fish', 'sushi']
            
            is_unsafe = any(keyword in food_lower for keyword in unsafe_keywords)
            
            if is_unsafe:
                parsed_data = {
                    "food_name": food_display,
                    "calories": 0,
                    "protein": 0,
                    "carbs": 0,
                    "fats": 0,
                    "fiber": 0,
                    "pregnancy_safe": False,
                    "period_friendly": False,
                    "recommendations": f" {food_display} is NOT RECOMMENDED during pregnancy or menstruation due to potential health risks. This food may contain harmful additives, high sodium, or other substances that could affect your health. Please consult your healthcare provider and choose healthier alternatives.",
                    "suggested_foods": ["Fresh fruits", "Vegetables", "Whole grains", "Lean proteins", "Nuts"]
                }
            else:
                parsed_data = {
                    "food_name": food_display,
                    "calories": 150,
                    "protein": 10,
                    "carbs": 20,
                    "fats": 5,
                    "fiber": 3,
                    "pregnancy_safe": True,
                    "period_friendly": True,
                    "recommendations": f"General wellness tip: {food_display} can be part of a balanced diet when consumed in moderation. Focus on variety, whole foods, and listening to your body's needs. Always wash fresh produce thoroughly and ensure proper food handling. Consult your healthcare provider for personalized nutrition advice.",
                    "suggested_foods": ["Fresh fruits", "Vegetables", "Whole grains", "Lean proteins", "Legumes"]
                }

        # Ensure all fields exist and convert to proper types
        defaults = {
    "food_name": "Unknown",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "fiber": 0,
    "pregnancy_safe": False,
    "period_friendly": False,
    "recommendations": "",
    "suggested_foods": [],
    "contains_allergens": False,
    "allergy_warning": " No allergy information provided. If you have food allergies, please consult a healthcare professional for personalized advice."
}
        
        for key, default_val in defaults.items():
            if key not in parsed_data:
                parsed_data[key] = default_val
        
        # Clean up any "g" suffixes from numbers
        for key in ["protein", "carbs", "fats", "fiber"]:
            val = parsed_data.get(key, 0)
            if isinstance(val, str):
                val = val.replace("g", "").strip()
                try:
                    parsed_data[key] = float(val) if "." in val else int(val)
                except:
                    parsed_data[key] = 0
        
        # Ensure calories is a number
        cal = parsed_data.get("calories", 0)
        if isinstance(cal, str):
            try:
                parsed_data["calories"] = int(cal.replace("kcal", "").replace("cal", "").strip())
            except:
                parsed_data["calories"] = 0

        logger.info(f"Ã¢Å“â€¦ Food analyzed: {parsed_data.get('food_name')}")

        return JSONResponse(content={
            "success": True,
            "source": "Gemini",
            "report": parsed_data
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ã¢ÂÅ’ Food analysis error: {str(e)}")
        
        food_display = food_name if food_name else "Unknown Food"
        food_lower = food_display.lower() if food_display else ""
        
        # Safety check in fallback too
        unsafe_keywords = ['ajinomoto', 'msg', 'monosodium glutamate', 'instant noodles']
        is_unsafe = any(keyword in food_lower for keyword in unsafe_keywords)
        
        if is_unsafe:
            fallback_data = {
                "food_name": food_display,
                "calories": 0,
                "protein": 0,
                "carbs": 0,
                "fats": 0,
                "fiber": 0,
                "pregnancy_safe": False,
                "period_friendly": False,
                "recommendations": f" {food_display} is NOT RECOMMENDED during pregnancy. This product may contain harmful additives or high sodium levels. Please avoid consumption and choose natural, whole food alternatives. Consult your healthcare provider for safe food choices.",
                "suggested_foods": ["Sea salt", "Herbs", "Spices", "Natural seasonings"],
                "contains_allergens": False,
                "allergy_warning": " No allergy information provided. Consult your healthcare provider if you have food allergies.",
            }
        else:
            fallback_data = {
                "food_name": food_display,
                "calories": 150,
                "protein": 10,
                "carbs": 20,
                "fats": 5,
                "fiber": 3,
                "pregnancy_safe": True,
                "period_friendly": True,
                "recommendations": f"We're having trouble analyzing this food right now. For safety, please verify the ingredients and consult your healthcare provider before consuming {food_display} during pregnancy. Focus on whole, unprocessed foods for optimal nutrition.",
                "suggested_foods": ["Fresh fruits", "Vegetables", "Whole grains", "Lean proteins"],
                "contains_allergens": False,
                "allergy_warning": " No allergy information provided. Consult your healthcare provider if you have food allergies.",
            }
        
        return JSONResponse(content={
            "success": True,
            "source": "Fallback",
            "report": fallback_data,
            "note": "Using safety-focused guidance due to temporary service issue"
        })


# ============== PREGNANCY CARE ENDPOINTS ==============

@app.post("/pregnancy/chat")
async def pregnancy_chat(message: str = Form(...)):
    """Chat endpoint with intelligent caching."""
    
    logger.info(f"💬 Chat request: {message[:80]}...")
    
    # Check cache first - saves API quota!
    cached = get_cached_response(message)
    if cached:
        return JSONResponse(content={
            "success": True,
            "reply": cached,
            "source": "cache"
        })
    
    if not gemini_model:
        logger.error("❌ Gemini not configured")
        return JSONResponse(content={
            "success": False,
            "reply": "AI service is currently unavailable. Please check your API configuration."
        })

    try:
        check_rate_limit()
        
        prompt = (
            f"You are a supportive wellness guide specializing in pregnancy wellness and lifestyle. "
            f"Share general wellness information, healthy lifestyle tips, and supportive advice. "
            f"Question: {message}\n\n"
            f"Provide warm, helpful lifestyle and wellness guidance in 2-3 paragraphs. Format in markdown. "
            f"Always remind users to consult their healthcare provider for personalized medical advice."
        )
        
        logger.info("🤖 Calling Gemini API...")
        
        response = gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
                "max_output_tokens": 3000,  # Reduced for faster responses
            },
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"}
            ]
        )
        
        reply_text = None
        try:
            reply_text = response.text.strip()
        except Exception as e:
            logger.warning(f"⚠️ Could not get response.text: {str(e)}")
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                finish_reason = getattr(candidate, 'finish_reason', None)
                
                if finish_reason == 2:  # SAFETY
                    logger.info("🔄 Safety block - trying simpler prompt...")
                    simple_prompt = f"Share 3 wellness tips about: {message}. Be brief and supportive."
                    try:
                        retry_response = gemini_model.generate_content(
                            simple_prompt,
                            generation_config={"temperature": 0.5, "max_output_tokens": 400}
                        )
                        reply_text = retry_response.text.strip()
                    except:
                        pass
        
        if not reply_text:
            reply_text = (
                "Here are some general wellness tips:\n\n"
                "- Eat a variety of nutritious whole foods including fruits, vegetables, and lean proteins\n"
                "- Stay well hydrated by drinking plenty of water throughout the day\n"
                "- Get adequate rest and listen to your body\n"
                "- Engage in gentle, approved physical activity\n\n"
                "Please consult your healthcare provider for personalized medical advice."
            )
        
        # Cache the response for future use
        cache_response(message, reply_text)
        
        logger.info("✅ Chat response generated and cached")
        
        return JSONResponse(content={
            "success": True,
            "reply": reply_text,
            "source": "ai"
        })
        
    except Exception as e:
        error_str = str(e).lower()
        logger.error(f"❌ Chat error: {str(e)}")
        
        # Check for quota error
        if "quota" in error_str or "resource_exhausted" in error_str:
            fallback = (
                "I'm experiencing high demand right now. Here are some helpful tips:\n\n"
                "- Focus on eating nutritious, whole foods\n"
                "- Stay hydrated throughout the day\n"
                "- Get plenty of rest\n"
                "- Practice gentle movement when comfortable\n\n"
                "Please try again in a few minutes, or consult your healthcare provider."
            )
        else:
            fallback = (
                "I'm having trouble processing that request. Could you try rephrasing your question? "
                "In the meantime, remember to prioritize rest, nutrition, and hydration. "
                "Always consult your healthcare provider for personalized advice."
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "reply": fallback,
                "source": "fallback"
            }
        )

@app.post("/pregnancy/text-to-speech")
async def text_to_speech(text: str = Form(...)):
    """Convert text to speech with async processing."""
    
    try:
        logger.info(f"🔊 TTS request: {len(text)} chars")
        
        # Clean text
        clean_text = text.replace('#', '').replace('*', '').replace('_', '').replace('`', '')
        clean_text = clean_text.replace('**', '').replace('__', '').strip()
        
        # Remove markdown links
        import re
        clean_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', clean_text)
        
        # Limit length for faster processing
        if len(clean_text) > 400:
            clean_text = clean_text[:400] + "..."
        
        if len(clean_text) < 3:
            logger.warning("Text too short for TTS")
            return JSONResponse(content={
                "success": False,
                "error": "Text too short",
                "audio_data": None
            })
        
        logger.info("🎤 Generating speech...")
        
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
        
        logger.info(f"✅ TTS successful: {len(audio_bytes)} bytes")
        
        return JSONResponse(content={
            "success": True,
            "audio_data": audio_base64,
            "format": "mp3"
        })
        
    except Exception as e:
        logger.error(f"❌ TTS error: {str(e)}")
        return JSONResponse(content={
            "success": False,
            "error": str(e),
            "audio_data": None
        })

@app.post("/pregnancy/tips")
async def pregnancy_tips(topic: str = Form(...)):
    """Get tips with caching."""
    
    logger.info(f"💡 Tips request: {topic}")
    
    # Check cache
    cache_key = f"tips_{topic}"
    cached = get_cached_response(cache_key)
    if cached:
        return JSONResponse(content={
            "success": True,
            "tips": cached,
            "source": "cache"
        })
    
    if not gemini_model:
        logger.error("❌ Gemini not configured")
        return JSONResponse(content={
            "success": True,
            "tips": "## General Tips\n\n- Stay hydrated\n- Eat nutritious foods\n- Get adequate rest\n- Practice gentle movement",
            "source": "fallback"
        })

    try:
        check_rate_limit()
        
        topic_prompts = {
            "general": "wellness and self-care during pregnancy",
            "nutrition": "healthy eating and nutrition during pregnancy",
            "exercise": "staying active and fit during pregnancy",
            "mental-health": "emotional wellness and stress relief during pregnancy",
            "trimester1": "wellness tips for early pregnancy (weeks 1-12)",
            "trimester2": "wellness tips for mid pregnancy (weeks 13-26)",
            "trimester3": "wellness tips for late pregnancy (weeks 27-40)",
        }

        topic_desc = topic_prompts.get(topic, "general pregnancy wellness")

        prompt = (
            f"Share 5 practical lifestyle tips about {topic_desc}. "
            f"Format as a numbered markdown list. Be concise and supportive. "
            f"Focus on healthy habits and wellness practices."
        )

        logger.info(f"🤖 Generating tips...")

        response = gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.6,
                "top_p": 0.9,
                "max_output_tokens": 500,
            },
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"}
            ]
        )

        tips_text = response.text.strip()
        
        # Cache the tips
        cache_response(cache_key, tips_text)
        
        logger.info("✅ Tips generated and cached")

        return JSONResponse(content={
            "success": True,
            "topic": topic,
            "tips": tips_text,
            "source": "ai"
        })

    except Exception as e:
        logger.error(f"❌ Tips error: {str(e)}")
        
        # Fallback tips library
        fallback_tips = {
            "general": "1. Stay hydrated - drink 8-10 glasses of water daily\n2. Eat balanced meals with plenty of fruits and vegetables\n3. Get 7-9 hours of sleep each night\n4. Take gentle walks for light exercise\n5. Practice relaxation techniques",
            "nutrition": "1. Include iron-rich foods like spinach and lean meat\n2. Eat folate sources: leafy greens and beans\n3. Choose whole grains for sustained energy\n4. Add calcium from dairy or fortified alternatives\n5. Include omega-3s from salmon or walnuts",
            "exercise": "1. Walk 30 minutes most days\n2. Try prenatal yoga for flexibility\n3. Swim for low-impact cardio\n4. Practice pelvic floor exercises daily\n5. Always warm up and cool down",
            "mental-health": "1. Practice daily meditation or mindfulness\n2. Connect with supportive friends and family\n3. Journal your thoughts and feelings\n4. Get adequate rest\n5. Engage in activities you enjoy",
        }
        
        tips_text = fallback_tips.get(topic, fallback_tips["general"])
        
        return JSONResponse(content={
            "success": True,
            "tips": tips_text,
            "source": "fallback"
        })

@app.post("/pregnancy/affirmation")
async def pregnancy_affirmation():
    """Generate affirmation with rotation."""
    
    logger.info("💖 Affirmation request")
    
    # Predefined affirmations (no API needed!)
    affirmations = [
        "You are strong, capable, and creating a beautiful life. Trust your journey. 💕",
        "Your body knows exactly what to do. You are powerful and amazing. 💖",
        "Every day you're growing a miracle. You've got this, mama! 🌟",
        "You are doing an incredible job. Be proud of yourself. 💝",
        "Your strength is limitless. Your love is boundless. You are extraordinary. ✨",
        "Embrace this beautiful journey. You are nurturing life with grace and love. 🌸",
        "You are a warrior, creating life and spreading love. Believe in yourself. 💪",
        "Your body is amazing. Trust the process and honor your journey. 🦋",
    ]
    
    import random
    affirmation = random.choice(affirmations)
    
    return JSONResponse(content={
        "success": True,
        "affirmation": affirmation
    })

@app.on_event("startup")
async def startup_event():
    """Log startup info."""
    logger.info("=" * 60)
    logger.info("🚀 Women's Wellness API v3.0 Starting")
    logger.info(f"🤖 Gemini: {'✅ Configured' if gemini_model else '❌ Not Configured'}")
    logger.info(f"💾 Response caching: ✅ Enabled")
    logger.info(f"🔊 Text-to-speech: ✅ Enabled")
    logger.info("=" * 60)

# ---------------- Run Server ----------------
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8002))
    
    logger.info(f"🚀 Starting API on port {port}")
    logger.info(f"📖 Docs: http://localhost:{port}/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )