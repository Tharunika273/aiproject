#!/bin/bash

# AI Shopping Assistant Startup Script

echo "🚀 Starting AI Shopping Assistant..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Install Python dependencies if not already installed
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies if not already installed
echo "📦 Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env .env.backup 2>/dev/null || true
    echo "⚠️  Please edit .env file and add your OpenAI API key for AI features to work."
fi

echo "🖥️  Starting backend server..."
# Start backend in background
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "🌐 Starting frontend server..."
# Start frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ AI Shopping Assistant is starting up!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for processes to finish
wait