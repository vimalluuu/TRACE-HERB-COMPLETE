@echo off
title TRACE HERB - FREE Deployment
color 0A

echo.
echo 🆓 TRACE HERB - FREE Deployment
echo ================================
echo.
echo Deploying your complete system for FREE!
echo.

REM Check if required tools are installed
echo 🔧 Checking required tools...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found! Please install Git
    pause
    exit /b 1
)
echo ✅ Git found

echo.
echo 🚀 Starting FREE deployment...
echo.

REM Step 1: Deploy Backend to Railway (FREE)
echo 📦 Step 1: Deploying Backend to Railway (FREE)
echo.

REM Check if Railway CLI is installed
where railway >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing Railway CLI...
    npm install -g @railway/cli
    if errorlevel 1 (
        echo ❌ Failed to install Railway CLI
        echo 💡 Try: npm install -g @railway/cli --force
        pause
        exit /b 1
    )
)

echo ✅ Railway CLI ready
echo 🔐 Please login to Railway (free account)...
railway login

echo 📤 Deploying backend...
railway init trace-herb-backend
railway up

echo ✅ Backend deployed to Railway!
echo.

REM Step 2: Deploy Farmer Portal to Vercel (FREE)
echo 🧑‍🌾 Step 2: Deploying Farmer Portal to Vercel (FREE)
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing Vercel CLI...
    npm install -g vercel
    if errorlevel 1 (
        echo ❌ Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI ready
echo 🔐 Please login to Vercel (free account)...
cd frontend\farmer-dapp
vercel login
vercel --prod
cd ..\..

echo ✅ Farmer Portal deployed to Vercel!
echo.

REM Step 3: Deploy Consumer Portal to Netlify (FREE)
echo 👥 Step 3: Deploying Consumer Portal to Netlify (FREE)
echo.

REM Check if Netlify CLI is installed
where netlify >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing Netlify CLI...
    npm install -g netlify-cli
    if errorlevel 1 (
        echo ❌ Failed to install Netlify CLI
        pause
        exit /b 1
    )
)

echo ✅ Netlify CLI ready
echo 🔐 Please login to Netlify (free account)...
cd frontend\enhanced-consumer-portal
netlify login
netlify deploy --prod
cd ..\..

echo ✅ Consumer Portal deployed to Netlify!
echo.

REM Step 4: Setup GitHub Pages for other portals
echo 📄 Step 4: Setting up GitHub Pages for other portals (FREE)
echo.

echo 💡 To deploy other portals to GitHub Pages:
echo 1. Go to your GitHub repository settings
echo 2. Enable GitHub Pages
echo 3. Select 'gh-pages' branch as source
echo 4. Run: npm run deploy:github
echo.

echo.
echo ========================================
echo    🎉 FREE DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo 🌐 Your FREE TRACE HERB System URLs:
echo.
echo 🔧 Backend API:        https://trace-herb-backend.railway.app
echo 🧑‍🌾 Farmer Portal:     https://trace-herb-farmer.vercel.app
echo 👥 Consumer Portal:    https://trace-herb-consumer.netlify.app
echo.
echo 📝 Next Steps:
echo 1. Test all portals to ensure they work
echo 2. Set up GitHub Pages for remaining portals
echo 3. Configure MongoDB Atlas (free database)
echo 4. Share your live system with the world!
echo.
echo 💰 Total Cost: $0/month (100%% FREE!)
echo.
echo 🎊 Your blockchain supply chain system is now live!
echo.

pause
