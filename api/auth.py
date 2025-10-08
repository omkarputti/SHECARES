import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from dotenv import load_dotenv

load_dotenv()

cred_path = os.getenv("FIREBASE_CRED_PATH")

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

security = HTTPBearer()

def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase token")

# Example FastAPI route
from fastapi import APIRouter

router = APIRouter()

@router.get("/protected")
def protected_route(credentials = Depends(security)):
    token = credentials.credentials
    decoded = verify_token(token)
    return {"message": "You are authenticated", "uid": decoded["uid"]}
