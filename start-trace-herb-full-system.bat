@echo off
title TRACE HERB - Full System Startup
color 0A

echo.
echo ========================================
echo    TRACE HERB - FULL SYSTEM STARTUP
echo ========================================
echo.
echo 🚀 Starting Complete TRACE HERB System with Full Blockchain Network
echo.

REM Check if PowerShell is available
powershell -Command "Write-Host 'PowerShell is available'" >nul 2>&1
if errorlevel 1 (
    echo ❌ PowerShell not found! Please install PowerShell
    pause
    exit /b 1
)

echo 📦 Step 1: Setting up Full Hyperledger Fabric Network...
echo.
powershell -ExecutionPolicy Bypass -File "setup-full-blockchain-network.ps1" -Clean
if errorlevel 1 (
    echo ❌ Failed to setup blockchain network
    pause
    exit /b 1
)

echo.
echo ✅ Blockchain network setup complete!
echo.
echo 🔄 Step 2: Starting Backend Service...
echo.

REM Start backend in new window
start "TRACE HERB Backend" cmd /k "cd backend && npm run dev"

REM Wait for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 10 /nobreak >nul

echo.
echo 🔄 Step 3: Starting Frontend Portals...
echo.

REM Start Farmer Portal
start "Farmer Portal (Port 3002)" cmd /k "cd frontend\farmer-dapp && npm run dev"

REM Start Enhanced Consumer Portal  
start "Enhanced Consumer Portal (Port 3000)" cmd /k "cd frontend\enhanced-consumer-portal && npm run dev"

REM Start Processor Portal
start "Processor Portal (Port 3004)" cmd /k "cd frontend\processor-portal && npm run dev"

REM Start Laboratory Portal
start "Laboratory Portal (Port 3005)" cmd /k "cd frontend\lab-portal && npm run dev"

REM Start Regulatory Portal
start "Regulatory Portal (Port 3006)" cmd /k "cd frontend\regulator-portal && npm run dev"

echo.
echo ⏳ Waiting for all services to start...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo    🎉 TRACE HERB SYSTEM IS NOW RUNNING!
echo ========================================
echo.
echo 🌐 Access Points:
echo.
echo 🧑‍🌾 Farmer Portal:           http://localhost:3002
echo 👥 Enhanced Consumer Portal:  http://localhost:3000  
echo 🏭 Processor Portal:          http://localhost:3004
echo 🔬 Laboratory Portal:         http://localhost:3005
echo 🏛️ Regulatory Portal:         http://localhost:3006
echo.
echo 🔗 Backend API:               http://localhost:3000/api
echo.
echo 📊 Blockchain Network Status:
echo   • Certificate Authorities:  Ports 7054, 8054, 9054, 10054
echo   • Orderer:                  Port 7050
echo   • Peers:                    Ports 7051, 9051, 11051, 13051
echo   • CouchDB:                  Ports 5984, 7984, 9984, 11984
echo.
echo 🎯 System Mode: FULL NETWORK (Real Blockchain Operations)
echo.
echo ⚠️ IMPORTANT: All blockchain operations are now REAL and will be
echo    committed to the actual Hyperledger Fabric ledger!
echo.
echo 📝 To stop the system:
echo    1. Close all terminal windows
echo    2. Run: docker-compose -f blockchain/network/docker-compose.yml down
echo.

REM Keep this window open
echo Press any key to open system monitoring dashboard...
pause >nul

REM Open monitoring dashboard
start http://localhost:3000
start http://localhost:3002

echo.
echo 🎉 TRACE HERB Full System is ready for demonstration!
echo.
pause
