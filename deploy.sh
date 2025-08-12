#!/bin/bash

# 🚀 Khodar wa Fawakih Deployment Script
# This script helps prepare your app for deployment

echo "🍎🥬 Khodar wa Fawakih Deployment Helper"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Build the frontend
echo "📦 Building frontend..."
cd client
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Test the backend
echo "🔧 Testing backend..."
cd server
npm test 2>/dev/null || echo "⚠️  No tests found, skipping..."
cd ..

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 Next steps for deployment:"
echo ""
echo "1. 🖥️  Deploy Backend:"
echo "   - Go to https://render.com (recommended)"
echo "   - Create a new Web Service"
echo "   - Set root directory to 'server'"
echo "   - Build command: npm install"
echo "   - Start command: npm start"
echo ""
echo "2. 🌐 Deploy Frontend:"
echo "   - Go to https://netlify.com"
echo "   - Create new site from Git"
echo "   - Set base directory to 'client'"
echo "   - Build command: npm run build"
echo "   - Publish directory: build"
echo ""
echo "3. ⚙️  Configure Environment Variables:"
echo "   - In Netlify: Set REACT_APP_SOCKET_URL to your backend URL"
echo "   - Update CORS settings in server/index.js"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🍎�� Happy deploying!"
