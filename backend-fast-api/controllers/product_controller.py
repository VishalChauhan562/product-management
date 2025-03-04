# controllers/product_controller.py
from fastapi import HTTPException
from config.db import get_db
from bson import ObjectId

def serialize_product(product):
    product_dict = dict(product)
    product_dict["_id"] = str(product_dict.pop("_id"))  
    return product_dict

async def create_product(product: dict):
    db = await get_db()
    products_collection = db["products"]
    result = await products_collection.insert_one(product)
    inserted_product = await products_collection.find_one({"_id": result.inserted_id})
    return serialize_product(inserted_product)

async def get_products():
    db = await get_db()
    products_collection = db["products"]
    
    # Use AsyncIOMotorCursor for async iteration
    products_cursor = products_collection.find()
    products = [serialize_product(product) async for product in products_cursor]  

    return products 

async def get_product_by_id(product_id: str):
    db = await get_db()
    products_collection = db["products"]
    try:
        product = await products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return serialize_product(product)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

async def update_product(product_id: str, product: dict):
    db = await get_db()
    products_collection = db["products"]
    try:
        updated_product = await products_collection.find_one_and_update(
            {"_id": ObjectId(product_id)},
            {"$set": product},
            return_document=True
        )
        if not updated_product:
            raise HTTPException(status_code=404, detail="Product not found")
        return serialize_product(updated_product)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

async def delete_product(product_id: str):
    db = await get_db()
    products_collection = db["products"]
    try:
        result = await products_collection.delete_one({"_id": ObjectId(product_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID format")