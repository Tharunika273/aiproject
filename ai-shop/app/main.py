from __future__ import annotations

from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .models import (
    CartAddRequest,
    CartRemoveRequest,
    CartResponse,
    ChatRequest,
    ChatResponse,
    Product,
)
from .retriever import ProductCatalog
from .cart import CartStore

ROOT = Path(__file__).resolve().parent.parent
STATIC_DIR = ROOT / "static"
CATALOG_CSV = ROOT / "app" / "catalog.csv"

app = FastAPI(title="AI Shopping Assistant", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize catalog and cart
catalog = ProductCatalog(str(CATALOG_CSV))
cart_store = CartStore()


@app.get("/")
async def serve_index() -> FileResponse:
    return FileResponse(str(STATIC_DIR / "index.html"))


app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/api/products/search")
async def search_products(q: str = "", limit: int = 5):
    items, _ = catalog.search(q, top_k=limit)
    return {"products": [to_product_dict(p) for p in items]}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    items, filters = catalog.search(req.message, top_k=5)

    # Simple response composition
    if items:
        summary = catalog.format_products_for_reply(items)
        lead = "Here are some options that match your request:\n" if req.message.strip() else "Popular picks for you:\n"
        followup_parts: List[str] = []
        if filters.category:
            followup_parts.append(f"category '{filters.category}'")
        if filters.brand:
            followup_parts.append(f"brand '{filters.brand}'")
        if filters.min_price is not None or filters.max_price is not None:
            if filters.min_price is not None and filters.max_price is not None:
                followup_parts.append(f"between ${filters.min_price:.0f} and ${filters.max_price:.0f}")
            elif filters.max_price is not None:
                followup_parts.append(f"under ${filters.max_price:.0f}")
            elif filters.min_price is not None:
                followup_parts.append(f"above ${filters.min_price:.0f}")
        followup = (
            "\n\nWant me to refine by "
            + ", ".join(followup_parts)
            + ", or compare any two items?"
            if followup_parts
            else "\n\nWant me to filter by price, brand, or features?"
        )
        reply_text = lead + summary + followup
    else:
        reply_text = (
            "I couldn't find a good match. Want to try a different brand, category, or budget?"
        )

    return ChatResponse(
        reply=reply_text,
        products=[to_product_model(p) for p in items],
        cart=_cart_payload(req.session_id),
    )


@app.post("/api/cart/add", response_model=CartResponse)
async def cart_add(req: CartAddRequest) -> CartResponse:
    product = catalog.get_product_by_id(req.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    cart_store.add(req.session_id, req.product_id, req.quantity)
    return _cart_payload(req.session_id)


@app.post("/api/cart/remove", response_model=CartResponse)
async def cart_remove(req: CartRemoveRequest) -> CartResponse:
    cart_store.remove(req.session_id, req.product_id)
    return _cart_payload(req.session_id)


@app.get("/api/cart/{session_id}", response_model=CartResponse)
async def cart_get(session_id: str) -> CartResponse:
    return _cart_payload(session_id)


# Helpers

def to_product_dict(p_row: dict) -> dict:
    return {
        "id": str(p_row["id"]),
        "name": p_row["name"],
        "category": p_row["category"],
        "brand": p_row["brand"],
        "price": float(p_row["price"]),
        "rating": float(p_row["rating"]),
        "description": p_row["description"],
        "image_url": p_row.get("image_url") or None,
    }


def to_product_model(p_row: dict) -> Product:
    return Product(**to_product_dict(p_row))


def _cart_payload(session_id: str) -> CartResponse:
    items_map = cart_store.get(session_id)
    items: List[dict] = []
    subtotal = 0.0
    for pid, qty in items_map.items():
        p = catalog.get_product_by_id(pid)
        if p is None:
            continue
        price = float(p["price"]) * int(qty)
        subtotal += price
        items.append({
            "product": to_product_model(p),
            "quantity": int(qty),
        })
    return CartResponse(session_id=session_id, items=items, subtotal=round(subtotal, 2))