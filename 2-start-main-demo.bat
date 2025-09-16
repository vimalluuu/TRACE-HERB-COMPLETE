@echo off
title TRACE HERB - Enhanced Consumer Portal (Main Demo)
color 0B
echo.
echo ========================================
echo    STARTING MAIN DEMO PORTAL
echo ========================================
echo.

cd frontend\enhanced-consumer-portal
echo Current directory: %CD%
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting Enhanced Consumer Portal on port 3010...
npm run dev

pause
