# AI Shopping Assistant

A modern, AI-powered shopping assistant web application built with FastAPI backend and React frontend. The application features intelligent product recommendations, AI chat assistance, and a beautiful modern UI.

## Features

### 🤖 AI-Powered Features
- **AI Chat Assistant**: Interactive chat with AI for shopping guidance and product questions
- **Smart Recommendations**: AI-powered product recommendations based on user preferences
- **Intelligent Search**: Advanced product search with AI-enhanced results

### 🛒 Shopping Features
- **Product Catalog**: Browse a curated selection of products with detailed information
- **Shopping Cart**: Add/remove items, adjust quantities, and view order summary
- **Product Categories**: Filter products by categories (Electronics, Food & Beverages, Sports & Fitness, etc.)
- **Ratings & Reviews**: Product ratings and detailed descriptions

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Glass Morphism**: Beautiful glass-effect design with backdrop blur
- **Smooth Animations**: Framer Motion animations for enhanced user experience
- **Material-UI**: Clean, modern interface using Material-UI components

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **OpenAI API**: AI-powered chat and recommendations
- **Pydantic**: Data validation and settings management
- **CORS**: Cross-origin resource sharing support
- **Uvicorn**: ASGI server for running the application

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Material-UI (MUI)**: Comprehensive React UI library
- **Framer Motion**: Production-ready motion library for React
- **React Router**: Declarative routing for React
- **Axios**: Promise-based HTTP client

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- OpenAI API key (optional, for AI features)

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables**:
   ```bash
   # Copy the environment file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your-actual-openai-api-key-here
   ```

3. **Run the backend server**:
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`
   
   API documentation is available at `http://localhost:8000/docs`

### Frontend Setup

1. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```
   
   The application will open at `http://localhost:3000`

### Production Build

To create a production build of the frontend:

```bash
npm run build
```

## API Endpoints

### Products
- `GET /products` - Get all products or filter by category
- `GET /products/{product_id}` - Get specific product details
- `POST /search` - Search products by query

### Shopping Cart
- `GET /cart` - Get current cart contents
- `POST /cart/add` - Add item to cart
- `DELETE /cart/{product_id}` - Remove item from cart

### AI Features
- `POST /ai/chat` - Chat with AI assistant
- `POST /ai/recommendations` - Get AI-powered product recommendations

## Project Structure

```
ai-shopping-assistant/
├── main.py                 # FastAPI backend application
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables
├── package.json           # Node.js dependencies
├── public/                # Static files
│   ├── index.html
│   └── manifest.json
├── src/                   # React application
│   ├── components/        # React components
│   │   ├── Header.js
│   │   ├── ProductGrid.js
│   │   ├── ShoppingCart.js
│   │   ├── AIChat.js
│   │   ├── ProductSearch.js
│   │   └── AIRecommendations.js
│   ├── App.js            # Main application component
│   ├── index.js          # React entry point
│   └── index.css         # Global styles
└── README.md             # This file
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Database URL (for future database integration)
DATABASE_URL=sqlite:///./shopping.db

# JWT Secret Key (for future authentication)
JWT_SECRET_KEY=your-jwt-secret-key-here

# Environment
ENVIRONMENT=development
```

### AI Features Configuration

To enable AI features, you need an OpenAI API key:

1. Sign up at [OpenAI](https://openai.com/)
2. Get your API key from the dashboard
3. Add it to your `.env` file

Without an API key, the application will still work but AI features will show fallback responses.

## Usage

1. **Browse Products**: View all available products on the main page
2. **Search**: Use the search bar to find specific products
3. **AI Recommendations**: Get personalized product suggestions from the AI
4. **Chat with AI**: Click "Chat with AI" to ask questions about products
5. **Add to Cart**: Click "Add to Cart" on any product to add it to your shopping cart
6. **View Cart**: Click the cart icon to view and manage your cart items
7. **Checkout**: Proceed to checkout from the cart page

## Development

### Running in Development Mode

1. Start the backend:
   ```bash
   python main.py
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm start
   ```

### Adding New Products

Products are currently stored in memory in `main.py`. To add new products, edit the `products_db` list in the backend code.

For production use, integrate with a proper database like PostgreSQL or MongoDB.

### Customizing the UI

The application uses Material-UI components with custom styling. You can customize:

- Colors and theme in `src/App.js`
- Global styles in `src/index.css`
- Component-specific styles in individual component files

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- Material-UI team for the excellent React components
- Framer Motion for smooth animations
- Unsplash for product images

---

**Note**: This is a demonstration application. For production use, implement proper authentication, database integration, payment processing, and security measures.