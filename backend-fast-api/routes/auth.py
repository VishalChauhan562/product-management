from fastapi import APIRouter, Depends, Request 
from models.user import User
from controllers.auth_controller import register_user, login_user
from middleware.rate_limiter import auth_limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
@auth_limiter
async def register(user: User, request: Request):  
    result = await register_user(user.username, user.password)
    return result

@router.post("/login")
@auth_limiter
async def login(user: User, request: Request): 
    result = await login_user(user.username, user.password)
    return result