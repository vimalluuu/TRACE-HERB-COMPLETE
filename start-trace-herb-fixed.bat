@echo off
echo.
echo ========================================
echo    TRACE HERB - Complete Startup
echo ========================================
echo.
echo Starting TRACE HERB Blockchain-based Herb Supply Chain Traceability System...
echo.

REM Check Node.js
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)

REM Check npm
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found
    pause
    exit /b 1
)

echo Node.js and npm are available
echo.

echo Starting all services...
echo.

REM Start Backend (CA-Connected Mode)
echo Starting Backend API Server (CA-Connected Mode)...
start "TRACE HERB Backend" cmd /k "cd /d %~dp0backend && npm start"

REM Wait for backend
timeout /t 5 /nobreak >nul

REM Start Enhanced Consumer Portal (Main Demo)
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

echo.
echo ========================================
echo    TRACE HERB SYSTEM STARTED!
echo ========================================
echo.
echo Access Points:
echo.
echo MAIN DEMO - Enhanced Consumer Portal: http://localhost:3010
echo Farmer Portal:                       http://localhost:3002
echo Supply Chain Overview:               http://localhost:3000
echo Consumer Portal (Original):          http://localhost:3001
echo Processor Portal:                    http://localhost:3004
echo Lab Portal:                          http://localhost:3005
echo Regulator Portal:                    http://localhost:3006
echo Backend API:                         http://localhost:3000/api
echo.
echo Blockchain Status: CA-Connected Mode (Certificate Authority)
echo.
echo Demo QR Codes for Testing:
echo    QR_DEMO_ASHWAGANDHA_001 (Ashwagandha Root)
echo    QR_DEMO_TURMERIC_001    (Turmeric Powder)
echo    QR_DEMO_BRAHMI_001      (Brahmi Leaves)
echo    QR_DEMO_NEEM_001        (Neem Leaves)
echo.
echo For Judges Demo: Start with Enhanced Consumer Portal
echo    1. Visit: http://localhost:3010
echo    2. Enter any demo QR code above
echo    3. View tracking progress and click Advanced Insights
echo    4. Create new batches in Farmer Portal
echo.
echo Press any key to open main demo portal...
pause >nul
start http://localhost:3010
