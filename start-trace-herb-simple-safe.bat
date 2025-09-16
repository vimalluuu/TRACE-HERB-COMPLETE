@echo off
title TRACE HERB - Simple Startup
echo.
echo ========================================
echo    TRACE HERB - Simple Startup
echo ========================================
echo.

echo Testing Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found! Install from https://nodejs.org/
    pause
    exit
)

echo Testing npm...
npm --version
if errorlevel 1 (
    echo ERROR: npm not found!
    pause
    exit
)

echo.
echo Node.js and npm are working!
echo.
echo Starting services...
echo.

echo Starting Backend...
start "Backend" cmd /k "cd backend && npm start"

echo Waiting 3 seconds...
timeout /t 3 >nul

echo Starting Enhanced Consumer Portal...
start "Consumer Portal" cmd /k "cd frontend\enhanced-consumer-portal && npm run dev"

echo Starting Farmer Portal...
start "Farmer Portal" cmd /k "cd frontend\farmer-dapp && npm run dev"

echo.
echo ========================================
echo Services are starting!
echo ========================================
echo.
echo Main Demo: http://localhost:3010
echo Farmer Portal: http://localhost:3002
echo.
echo Wait 30-60 seconds for services to fully load
echo Then visit: http://localhost:3010
echo.
echo This window will stay open so you can see any messages
echo.
pause
