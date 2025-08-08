creating a ai based shopping assistant

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Export your OpenAI API key (or create a `.env` file):
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

3. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. Interact with the shopping assistant via HTTP:
   ```bash
   curl -X POST http://localhost:8000/chat \
        -H "Content-Type: application/json" \
        -d '{"message": "I need gift ideas for a tech enthusiast."}'
   ```

5. You should receive a JSON response containing the assistant's reply.

Feel free to modify `products.json` to include your own catalog items.
