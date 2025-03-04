from fastapi import APIRouter, Depends, Request 
from models.product import Product
from controllers.product_controller import create_product, get_products, get_product_by_id, update_product, delete_product
from middleware.auth import protect
from middleware.rate_limiter import public_api_limiter, auth_api_limiter

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/")
@public_api_limiter
async def list_products(request: Request):  
    page = int(request.query_params.get("page", 1))
    limit = int(request.query_params.get("limit", 10))
    return await get_products(page=page, limit=limit)

@router.post("/")
@auth_api_limiter
async def add_product(product: Product, request: Request, user=Depends(protect)):  
    return await create_product(product.model_dump())

@router.get("/{id}")
@public_api_limiter
async def get_product(id: str, request: Request):  
    return await get_product_by_id(id)

@router.put("/{id}")
@auth_api_limiter
async def update_product_route(id: str, product: Product, request: Request, user=Depends(protect)):  
    return await update_product(id, product.dict())

@router.delete("/{id}")
@auth_api_limiter
async def delete_product_route(id: str, request: Request, user=Depends(protect)): 
    return await delete_product(id)