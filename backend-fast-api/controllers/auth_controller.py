from fastapi import HTTPException
from passlib.context import CryptContext
from jose import jwt
from dotenv import load_dotenv
from config.db import get_db
import os
from bson import ObjectId  

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-here")  # Default to a fallback if not set
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_token(user_id: str):
    payload = {"id": user_id}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def register_user(username: str, password: str):
    db = await get_db()  
    users_collection = db["users"]
    if await users_collection.find_one({"username": username}):  
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_password = pwd_context.hash(password)
    user = {"username": username, "password": hashed_password}
    result = await users_collection.insert_one(user) 
    user_id = str(result.inserted_id)
    return {"token": generate_token(user_id), "user": {"id": user_id, "username": username}}

async def login_user(username: str, password: str):
    db = await get_db() 
    users_collection = db["users"]
    user = await users_collection.find_one({"username": username})  
    if not user or not pwd_context.verify(password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    user_id = str(user["_id"])
    return {"token": generate_token(user_id), "user": {"id": user_id, "username": username}}