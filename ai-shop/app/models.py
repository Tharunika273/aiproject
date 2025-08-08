from pydantic import BaseModel, Field
from typing import List, Literal, Optional


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Client-generated session identifier")
    message: str
    history: List[Message] = []


class Product(BaseModel):
    id: str
    name: str
    category: str
    brand: str
    price: float
    rating: float
    description: str
    image_url: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    products: List[Product] = []
    cart: Optional[dict] = None


class CartAddRequest(BaseModel):
    session_id: str
    product_id: str
    quantity: int = 1


class CartRemoveRequest(BaseModel):
    session_id: str
    product_id: str


class CartItem(BaseModel):
    product: Product
    quantity: int


class CartResponse(BaseModel):
    session_id: str
    items: List[CartItem]
    subtotal: float