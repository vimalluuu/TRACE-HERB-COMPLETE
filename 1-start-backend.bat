@echo off
title TRACE HERB - Backend Server
color 0A
echo.
echo ========================================
echo    STARTING BACKEND SERVER
echo ========================================
echo.

cd backend
echo Current directory: %CD%
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting backend server...
npm start

pause
