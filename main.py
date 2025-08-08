import json
import os
from pathlib import Path
from typing import List, Dict, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import openai
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY environment variable not set. Please add it to your environment or ".
        ".env file before starting the server."
    )

openai.api_key = OPENAI_API_KEY

# ---------- Data Models ----------
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender: system, user, or assistant")
    content: str = Field(..., description="Content of the message")


class ChatRequest(BaseModel):
    message: str = Field(..., description="Latest user message")
    history: Optional[List[ChatMessage]] = Field(
        default=None, description="Optional previous conversation messages"
    )


class ChatResponse(BaseModel):
    reply: str


# ---------- Helper Functions ----------
CATALOG_FILE = Path(__file__).with_name("products.json")


def load_catalog() -> List[Dict]:
    if not CATALOG_FILE.exists():
        raise FileNotFoundError(f"Catalog file {CATALOG_FILE} not found.")
    with CATALOG_FILE.open() as f:
        return json.load(f)


def build_system_prompt(products: List[Dict]) -> str:
    """Construct a system prompt that embeds the product catalog in compact form."""
    catalog_lines = [
        f"{p['id']}. {p['name']} (\${p['price']}) - {p['description']}" for p in products
    ]
    catalog_text = "\n".join(catalog_lines)
    return (
        "You are an AI shopping assistant tasked with helping customers find products and "
        "answer questions about our catalog. Provide friendly, concise, and helpful responses. "
        "Use the following catalog when giving recommendations or answering questions:\n" + catalog_text
    )


# ---------- FastAPI App ----------
app = FastAPI(title="AI Shopping Assistant", version="0.1.0")


@app.on_event("startup")
async def startup_event():
    app.state.products = load_catalog()
    app.state.system_prompt = build_system_prompt(app.state.products)


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    # Build conversation history for OpenAI chat completion
    messages: List[Dict[str, str]] = [
        {"role": "system", "content": app.state.system_prompt}
    ]

    if req.history:
        messages.extend([msg.dict() for msg in req.history])

    messages.append({"role": "user", "content": req.message})

    try:
        completion = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=400,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    reply_content = completion.choices[0].message.content

    return ChatResponse(reply=reply_content)


# ---------- Run with: ----------
# uvicorn main:app --reload --port 8000