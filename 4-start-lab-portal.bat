@echo off
title TRACE HERB - Lab Portal
color 0D
echo.
echo ========================================
echo    STARTING LAB PORTAL
echo ========================================
echo.

cd frontend\lab-portal
echo Current directory: %CD%
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting Lab Portal on port 3005...
npm run dev -- -p 3005

pause
