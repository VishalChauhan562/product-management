# config/db.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not defined in the environment variables!")

client = AsyncIOMotorClient(MONGO_URI)

async def get_db():
    return client["product-management"]

import asyncio

async def close_db():
    client.close()