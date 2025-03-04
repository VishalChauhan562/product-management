from fastapi import HTTPException, Depends
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def protect(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized, invalid token")
        return {"id": user_id}
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized, invalid token")