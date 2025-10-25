@echo off
title TRACE HERB - Master Startup
color 0F
echo.
echo ========================================
echo    TRACE HERB - MASTER STARTUP
echo ========================================
echo.

echo This will start all services in separate windows
echo.
echo Starting services in order:
echo 1. Blockchain Network
echo 2. Backend Server  
echo 3. Main Demo Portal
echo 4. Farmer Portal
echo 5. Lab Portal
echo.

pause

echo Starting Blockchain Network...
start "Blockchain" cmd /c "5-start-blockchain.bat"
timeout /t 5

echo Starting Backend Server...
start "Backend" cmd /c "1-start-backend.bat"
timeout /t 3

echo Starting Main Demo Portal...
start "Main Demo" cmd /c "2-start-main-demo.bat"
timeout /t 2

echo Starting Farmer Portal...
start "Farmer Portal" cmd /c "3-start-farmer-portal.bat"
timeout /t 2

echo Starting Lab Portal...
start "Lab Portal" cmd /c "4-start-lab-portal.bat"

echo.
echo ========================================
echo    ALL SERVICES STARTING!
echo ========================================
echo.
echo Check the opened windows for each service
echo.
echo Main Demo: http://localhost:3010
echo Farmer Portal: http://localhost:3002
echo Lab Portal: http://localhost:3005
echo Backend API: http://localhost:3000/api
echo.
echo Wait 60 seconds for all services to fully load
echo.

pause
