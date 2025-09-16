@echo off
echo.
echo ========================================
echo    TRACE HERB - Complete Startup
echo ========================================
echo.
echo Starting TRACE HERB System...
echo.

REM Check Node.js
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)

echo Node.js OK
echo.

REM Start Backend
echo Starting Backend...
start "TRACE HERB Backend" cmd /k "cd /d %~dp0backend && npm start"

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start Enhanced Consumer Portal
echo Starting Enhanced Consumer Portal...
start "Enhanced Consumer Portal" cmd /k "cd /d %~dp0frontend\enhanced-consumer-portal && npm run dev"

REM Start other portals
echo Starting other portals...
start "Farmer Portal" cmd /k "cd /d %~dp0frontend\farmer-dapp && npm run dev"
start "Supply Chain Overview" cmd /k "cd /d %~dp0frontend\supply-chain-overview && npm run dev"

echo.
echo System starting... Check the opened windows.
echo Main demo: http://localhost:3010
echo.
pause
