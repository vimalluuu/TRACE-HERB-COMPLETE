@echo off
title TRACE HERB - Farmer Portal
color 0C
echo.
echo ========================================
echo    STARTING FARMER PORTAL
echo ========================================
echo.

cd frontend\farmer-dapp
echo Current directory: %CD%
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting Farmer Portal on port 3002...
npm run dev

pause
