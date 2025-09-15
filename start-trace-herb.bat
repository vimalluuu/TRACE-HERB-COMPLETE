@echo off
echo.
echo ========================================
echo    🌿 TRACE HERB - Complete Startup
echo ========================================
echo.
echo Starting TRACE HERB Blockchain-based Herb Supply Chain Traceability System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm is not installed or not in PATH
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

REM Install dependencies if node_modules don't exist
echo 📦 Installing dependencies...
echo.

REM Backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
) else (
    echo ✅ Backend dependencies already installed
)

REM Enhanced Consumer Portal dependencies
if not exist "frontend\enhanced-consumer-portal\node_modules" (
    echo Installing Enhanced Consumer Portal dependencies...
    cd frontend\enhanced-consumer-portal
    call npm install
    cd ..\..
) else (
    echo ✅ Enhanced Consumer Portal dependencies already installed
)

REM Farmer Portal dependencies
if not exist "frontend\farmer-dapp\node_modules" (
    echo Installing Farmer Portal dependencies...
    cd frontend\farmer-dapp
    call npm install
    cd ..\..
) else (
    echo ✅ Farmer Portal dependencies already installed
)

REM Supply Chain Overview dependencies
if not exist "frontend\supply-chain-overview\node_modules" (
    echo Installing Supply Chain Overview dependencies...
    cd frontend\supply-chain-overview
    call npm install
    cd ..\..
) else (
    echo ✅ Supply Chain Overview dependencies already installed
)

REM Consumer Portal dependencies
if not exist "frontend\consumer-portal\node_modules" (
    echo Installing Consumer Portal dependencies...
    cd frontend\consumer-portal
    call npm install
    cd ..\..
) else (
    echo ✅ Consumer Portal dependencies already installed
)

REM Processor Portal dependencies
if not exist "frontend\processor-portal\node_modules" (
    echo Installing Processor Portal dependencies...
    cd frontend\processor-portal
    call npm install
    cd ..\..
) else (
    echo ✅ Processor Portal dependencies already installed
)

REM Lab Portal dependencies
if not exist "frontend\lab-portal\node_modules" (
    echo Installing Lab Portal dependencies...
    cd frontend\lab-portal
    call npm install
    cd ..\..
) else (
    echo ✅ Lab Portal dependencies already installed
)

REM Regulator Portal dependencies
if not exist "frontend\regulator-portal\node_modules" (
    echo Installing Regulator Portal dependencies...
    cd frontend\regulator-portal
    call npm install
    cd ..\..
) else (
    echo ✅ Regulator Portal dependencies already installed
)

echo.
echo 🚀 Starting all services...
echo.

REM Start Backend (CA-Connected Blockchain Mode)
echo Starting Backend API Server (CA-Connected Mode)...
start "TRACE HERB Backend" cmd /k "cd /d %~dp0backend && npm start"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start Enhanced Consumer Portal (Main Demo Portal)
echo Starting Enhanced Consumer Portal (Port 3010)...
start "Enhanced Consumer Portal" cmd /k "cd /d %~dp0frontend\enhanced-consumer-portal && npm run dev"

REM Start Farmer Portal
echo Starting Farmer Portal (Port 3002)...
start "Farmer Portal" cmd /k "cd /d %~dp0frontend\farmer-dapp && npm run dev"

REM Start Supply Chain Overview
echo Starting Supply Chain Overview (Port 3000)...
start "Supply Chain Overview" cmd /k "cd /d %~dp0frontend\supply-chain-overview && npm run dev"

REM Start Consumer Portal (Original)
echo Starting Consumer Portal (Port 3001)...
start "Consumer Portal" cmd /k "cd /d %~dp0frontend\consumer-portal && npm run dev -- -p 3001"

REM Start Processor Portal
echo Starting Processor Portal (Port 3004)...
start "Processor Portal" cmd /k "cd /d %~dp0frontend\processor-portal && npm run dev -- -p 3004"

REM Start Lab Portal
echo Starting Lab Portal (Port 3005)...
start "Lab Portal" cmd /k "cd /d %~dp0frontend\lab-portal && npm run dev -- -p 3005"

REM Start Regulator Portal
echo Starting Regulator Portal (Port 3006)...
start "Regulator Portal" cmd /k "cd /d %~dp0frontend\regulator-portal && npm run dev -- -p 3006"

REM Start Stakeholder Dashboard
echo Starting Stakeholder Dashboard (Port 3007)...
start "Stakeholder Dashboard" cmd /k "cd /d %~dp0frontend\stakeholder-dashboard && npm run dev -- -p 3007"

REM Start Management Portal
echo Starting Management Portal (Port 3008)...
start "Management Portal" cmd /k "cd /d %~dp0frontend\management-portal && npm run dev -- -p 3008"

REM Start Wild Collector Portal
echo Starting Wild Collector Portal (Port 3009)...
start "Wild Collector Portal" cmd /k "cd /d %~dp0frontend\wild-collector-dapp && npm install --legacy-peer-deps && npm run dev -- -p 3009"

echo.
echo ========================================
echo    🎉 TRACE HERB SYSTEM STARTED!
echo ========================================
echo.
echo 🌐 Access Points:
echo.
echo 📱 MAIN DEMO - Enhanced Consumer Portal: http://localhost:3010
echo 🚜 Farmer Portal:                       http://localhost:3002
echo 📊 Supply Chain Overview:               http://localhost:3000
echo 👤 Consumer Portal (Original):          http://localhost:3001
echo 🏭 Processor Portal:                    http://localhost:3004
echo 🔬 Lab Portal:                          http://localhost:3005
echo 🏛️  Regulator Portal:                   http://localhost:3006
echo 👥 Stakeholder Dashboard:               http://localhost:3007
echo 🎛️  Management Portal:                  http://localhost:3008
echo 🌿 Wild Collector Portal:               http://localhost:3009
echo 🔧 Backend API:                         http://localhost:3000/api
echo.
echo 🔗 Blockchain Status: CA-Connected Mode (Certificate Authority)
echo.
echo ⚡ Demo QR Codes for Testing:
echo    • QR_DEMO_ASHWAGANDHA_001 (Ashwagandha Root)
echo    • QR_DEMO_TURMERIC_001    (Turmeric Powder)
echo    • QR_DEMO_BRAHMI_001      (Brahmi Leaves)
echo    • QR_DEMO_NEEM_001        (Neem Leaves)
echo.
echo 🎯 For Judges Demo: Start with Enhanced Consumer Portal
echo    1. Visit: http://localhost:3010
echo    2. Enter any demo QR code above
echo    3. View tracking progress → Click "Advanced Insights"
echo    4. Create new batches in Farmer Portal
echo.
echo Press any key to open main demo portal...
pause >nul
start http://localhost:3010