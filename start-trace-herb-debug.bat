@echo off
title TRACE HERB - Startup Debug
color 0A
echo.
echo ========================================
echo    TRACE HERB - Debug Startup
echo ========================================
echo.

REM Keep window open no matter what
set "KEEP_OPEN=1"

echo [DEBUG] Starting diagnostic checks...
echo [DEBUG] Current directory: %CD%
echo [DEBUG] Script location: %~dp0
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo [ERROR] Backend folder not found!
    echo [ERROR] Make sure you're running this from TRACE-HERB-COMPLETE folder
    echo [ERROR] Current location: %CD%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] Frontend folder not found!
    echo [ERROR] Make sure you're running this from TRACE-HERB-COMPLETE folder
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [SUCCESS] Project folders found!
echo.

REM Check Node.js
echo [DEBUG] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo [ERROR] Please install Node.js from: https://nodejs.org/
    echo [ERROR] Make sure to restart your computer after installation
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js found: %NODE_VERSION%

REM Check npm
echo [DEBUG] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH!
    echo [ERROR] npm should come with Node.js installation
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
echo [SUCCESS] npm found: %NPM_VERSION%
echo.

echo [DEBUG] All prerequisites check passed!
echo [DEBUG] Starting services...
echo.

REM Start Backend
echo [STARTING] Backend API Server (CA-Connected Mode)...
start "TRACE HERB Backend" cmd /k "cd /d %~dp0backend && echo Starting Backend... && npm start"
timeout /t 2 >nul

REM Start Enhanced Consumer Portal (Main Demo)
echo [STARTING] Enhanced Consumer Portal (Port 3010)...
start "Enhanced Consumer Portal" cmd /k "cd /d %~dp0frontend\enhanced-consumer-portal && echo Starting Enhanced Consumer Portal... && npm run dev"
timeout /t 1 >nul

REM Start Farmer Portal
echo [STARTING] Farmer Portal (Port 3002)...
start "Farmer Portal" cmd /k "cd /d %~dp0frontend\farmer-dapp && echo Starting Farmer Portal... && npm run dev"
timeout /t 1 >nul

REM Start Supply Chain Overview
echo [STARTING] Supply Chain Overview (Port 3000)...
start "Supply Chain Overview" cmd /k "cd /d %~dp0frontend\supply-chain-overview && echo Starting Supply Chain Overview... && npm run dev"
timeout /t 1 >nul

echo.
echo ========================================
echo    SERVICES STARTING...
echo ========================================
echo.
echo [INFO] Multiple Command Prompt windows should have opened
echo [INFO] Each window represents one service starting up
echo [INFO] Wait 30-60 seconds for all services to fully start
echo.
echo [ACCESS POINTS]
echo Main Demo: http://localhost:3010
echo Farmer Portal: http://localhost:3002  
echo Supply Chain: http://localhost:3000
echo Backend API: http://localhost:3000/api
echo.
echo [DEMO QR CODES]
echo QR_DEMO_ASHWAGANDHA_001
echo QR_DEMO_TURMERIC_001
echo QR_DEMO_BRAHMI_001
echo QR_DEMO_NEEM_001
echo.
echo [SUCCESS] Startup script completed!
echo [INFO] Check the opened Command Prompt windows for service status
echo [INFO] If no windows opened, there might be dependency issues
echo.
echo Press any key to open main demo portal...
pause >nul
start http://localhost:3010
echo.
echo Press any key to close this window...
pause >nul
