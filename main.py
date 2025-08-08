from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime
import openai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Shopping Assistant", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI configuration
openai.api_key = os.getenv("OPENAI_API_KEY", "your-api-key-here")

# Data models
class Product(BaseModel):
    id: int
    name: str
    price: float
    description: str
    category: str
    image_url: str
    rating: float
    in_stock: bool

class CartItem(BaseModel):
    product_id: int
    quantity: int

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None

class Recommendation(BaseModel):
    products: List[Product]
    reason: str

# In-memory data storage (in production, use a proper database)
products_db = [
    {
        "id": 1,
        "name": "Wireless Bluetooth Headphones",
        "price": 129.99,
        "description": "High-quality wireless headphones with noise cancellation",
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
        "rating": 4.5,
        "in_stock": True
    },
    {
        "id": 2,
        "name": "Smart Watch",
        "price": 299.99,
        "description": "Advanced smartwatch with health monitoring features",
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
        "rating": 4.7,
        "in_stock": True
    },
    {
        "id": 3,
        "name": "Organic Coffee Beans",
        "price": 24.99,
        "description": "Premium organic coffee beans, medium roast",
        "category": "Food & Beverages",
        "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300",
        "rating": 4.3,
        "in_stock": True
    },
    {
        "id": 4,
        "name": "Yoga Mat",
        "price": 39.99,
        "description": "Non-slip yoga mat perfect for home workouts",
        "category": "Sports & Fitness",
        "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300",
        "rating": 4.6,
        "in_stock": True
    },
    {
        "id": 5,
        "name": "Laptop Backpack",
        "price": 79.99,
        "description": "Durable laptop backpack with multiple compartments",
        "category": "Accessories",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300",
        "rating": 4.4,
        "in_stock": True
    }
]

shopping_cart = []

@app.get("/")
async def root():
    return {"message": "AI Shopping Assistant API"}

@app.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    """Get all products or filter by category"""
    if category:
        filtered_products = [p for p in products_db if p["category"].lower() == category.lower()]
        return filtered_products
    return products_db

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    """Get a specific product by ID"""
    product = next((p for p in products_db if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/cart/add")
async def add_to_cart(item: CartItem):
    """Add item to shopping cart"""
    # Check if product exists
    product = next((p for p in products_db if p["id"] == item.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = next((i for i in shopping_cart if i["product_id"] == item.product_id), None)
    if existing_item:
        existing_item["quantity"] += item.quantity
    else:
        shopping_cart.append({"product_id": item.product_id, "quantity": item.quantity})
    
    return {"message": "Item added to cart", "cart": shopping_cart}

@app.get("/cart")
async def get_cart():
    """Get current shopping cart with product details"""
    cart_with_details = []
    total = 0
    
    for cart_item in shopping_cart:
        product = next((p for p in products_db if p["id"] == cart_item["product_id"]), None)
        if product:
            item_total = product["price"] * cart_item["quantity"]
            total += item_total
            cart_with_details.append({
                "product": product,
                "quantity": cart_item["quantity"],
                "subtotal": item_total
            })
    
    return {"items": cart_with_details, "total": total}

@app.delete("/cart/{product_id}")
async def remove_from_cart(product_id: int):
    """Remove item from cart"""
    global shopping_cart
    shopping_cart = [item for item in shopping_cart if item["product_id"] != product_id]
    return {"message": "Item removed from cart", "cart": shopping_cart}

@app.post("/ai/chat")
async def ai_chat(message: ChatMessage):
    """Chat with AI shopping assistant"""
    try:
        # Create a context-aware prompt
        system_prompt = f"""You are a helpful AI shopping assistant. You help users find products, answer questions about shopping, and provide recommendations. 

Available products in our store:
{json.dumps(products_db, indent=2)}

Current user's cart:
{json.dumps(shopping_cart, indent=2)}

Please provide helpful, friendly responses about shopping, product recommendations, and general assistance. If asked about specific products, refer to the ones in our store. Keep responses concise but informative."""

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message.message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        return {"response": ai_response}
    
    except Exception as e:
        return {"response": "I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again later!"}

@app.post("/ai/recommendations", response_model=Recommendation)
async def get_ai_recommendations(preferences: Optional[str] = None):
    """Get AI-powered product recommendations"""
    try:
        prompt = f"""Based on the following products and user preferences, recommend 3 products with a brief explanation:

Products available:
{json.dumps(products_db, indent=2)}

User preferences: {preferences or "General recommendations"}

Please respond with a JSON object containing:
- products: array of 3 recommended product objects
- reason: brief explanation for the recommendations
"""

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a product recommendation AI. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.5
        )
        
        ai_response = response.choices[0].message.content
        recommendations = json.loads(ai_response)
        
        return recommendations
    
    except Exception as e:
        # Fallback recommendations
        return {
            "products": products_db[:3],
            "reason": "These are our top-rated products perfect for any occasion!"
        }

@app.post("/search")
async def search_products(query: str):
    """Search products by name or description"""
    query_lower = query.lower()
    results = [
        product for product in products_db
        if query_lower in product["name"].lower() or query_lower in product["description"].lower()
    ]
    return {"results": results, "count": len(results)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)