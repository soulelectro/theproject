#!/bin/bash

echo "🧠 Setting up Temporary Social App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if MongoDB is running (optional)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed locally. You can:"
    echo "   1. Install MongoDB locally"
    echo "   2. Use MongoDB Atlas (cloud)"
    echo "   3. Update MONGODB_URI in server/.env"
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo "✅ Dependencies installed successfully!"

echo "🔧 Setting up environment files..."

# Create server .env if it doesn't exist
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env from example"
fi

# Create client .env if it doesn't exist
if [ ! -f "client/.env" ]; then
    echo "REACT_APP_API_URL=http://localhost:5000/api" > client/.env
    echo "REACT_APP_SERVER_URL=http://localhost:5000" >> client/.env
    echo "✅ Created client/.env"
fi

echo ""
echo "🎉 Setup complete! Here's what you can do next:"
echo ""
echo "1. 🗄️  Start MongoDB (if using locally):"
echo "   mongod"
echo ""
echo "2. 🚀 Start the development server:"
echo "   npm run dev"
echo ""
echo "3. 🌐 Open your browser and go to:"
echo "   http://localhost:3000"
echo ""
echo "📝 For production setup, update the environment variables in:"
echo "   - server/.env (Twilio, Razorpay, YouTube API keys)"
echo "   - client/.env (API URLs)"
echo ""
echo "📚 Read the README.md for detailed setup instructions."
echo ""
echo "Happy coding! 🧠✨"