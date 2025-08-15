#!/bin/bash

echo "🚀 Starting Zero-Knowledge Proof System..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "✅ Python dependencies installed"
echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd notrust
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

echo "✅ Node.js dependencies installed"
echo ""

# Start backend in background
echo "🔧 Starting Flask backend..."
cd ..
python3 app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:5001/health > /dev/null; then
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend started successfully on http://localhost:5001"
echo ""

# Start frontend
echo "🌐 Starting Next.js frontend..."
cd notrust
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo "✅ Frontend started successfully on http://localhost:3000"
echo ""
echo "🎉 System is now running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
