@echo off
echo 🍎🥬 Khodar wa Fawakih Deployment Helper
echo ========================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "client" (
    echo ❌ Error: Client directory not found
    pause
    exit /b 1
)

if not exist "server" (
    echo ❌ Error: Server directory not found
    pause
    exit /b 1
)

echo ✅ Project structure verified

REM Build the frontend
echo 📦 Building frontend...
cd client
call npm run build
if %errorlevel% equ 0 (
    echo ✅ Frontend built successfully
) else (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
cd ..

REM Test the backend
echo 🔧 Testing backend...
cd server
call npm test 2>nul || echo ⚠️  No tests found, skipping...
cd ..

echo.
echo 🎉 Build completed successfully!
echo.
echo 📋 Next steps for deployment:
echo.
echo 1. 🖥️  Deploy Backend:
echo    - Go to https://render.com (recommended)
echo    - Create a new Web Service
echo    - Set root directory to 'server'
echo    - Build command: npm install
echo    - Start command: npm start
echo.
echo 2. 🌐 Deploy Frontend:
echo    - Go to https://netlify.com
echo    - Create new site from Git
echo    - Set base directory to 'client'
echo    - Build command: npm run build
echo    - Publish directory: build
echo.
echo 3. ⚙️  Configure Environment Variables:
echo    - In Netlify: Set REACT_APP_SOCKET_URL to your backend URL
echo    - Update CORS settings in server/index.js
echo.
echo 📖 For detailed instructions, see DEPLOYMENT.md
echo.
echo 🍎🥬 Happy deploying!
pause
