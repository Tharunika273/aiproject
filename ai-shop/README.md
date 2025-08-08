# AI Shopping Assistant

A minimal full-stack AI shopping assistant with FastAPI backend and a simple web UI. Uses TF-IDF retrieval over a sample product catalog to recommend items and manage a cart.

## Quickstart

1. Install dependencies

```bash
pip install -r requirements.txt
```

2. Run the server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

3. Open the app

Visit http://localhost:8000 in your browser.

## Endpoints
- `POST /api/chat` — chat with the assistant
- `GET /api/products/search?q=...` — search products
- `POST /api/cart/add` — add to cart
- `POST /api/cart/remove` — remove from cart
- `GET /api/cart/{session_id}` — get cart

## Notes
- Catalog is defined in `app/catalog.csv`. Edit or replace with your own.
- Replace the TF-IDF logic with embeddings/LLM as needed.