@echo off
echo.
echo ========================================
echo   TRACE HERB System Startup
echo ========================================
echo.

echo Starting TRACE HERB System...
powershell -ExecutionPolicy Bypass -File "start-system.ps1"

echo.
echo Press any key to exit...
pause > nul
