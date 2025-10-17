import os
import re
import time
import json
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import google.generativeai as genai  # ✅ Gemini SDK import

# Load environment variables
load_dotenv()

# ✅ API key check
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is required in the .env file")

# ✅ Port and allowed origins
PORT = int(os.getenv("PORT", 3001))
_env_allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8080")
if not _env_allowed or _env_allowed.strip() == "*":
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [o.strip() for o in _env_allowed.split(",") if o.strip()]

# ✅ Configure Gemini SDK
genai.configure(api_key=GEMINI_API_KEY)

# ✅ Initialize FastAPI
app = FastAPI(title="Food Suggestions (Gemini)")

# ✅ Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Models
class SuggestRequest(BaseModel):
    medicineName: str

class SuggestResponse(BaseModel):
    before: list[str]
    after: list[str]

# ✅ In-memory cache
_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SEC = 60 * 30  # 30 minutes

def cache_result(key: str, value: Dict[str, Any]):
    _cache[key] = {"ts": time.time(), "value": value}

def get_cached(key: str):
    v = _cache.get(key)
    if not v:
        return None
    if time.time() - v["ts"] > CACHE_TTL_SEC:
        del _cache[key]
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

# ✅ API route
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

# ✅ Health check route
@app.get("/ping")
async def ping():
    return {"ok": True}
