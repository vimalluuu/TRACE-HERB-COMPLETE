@echo off
title TRACE HERB - Fix Dependencies
color 0A

echo.
echo ========================================
echo    TRACE HERB - DEPENDENCY FIX
echo ========================================
echo.
echo Fixing all frontend portal dependencies...
echo.

REM List of frontend portals
set "portals=farmer-dapp enhanced-consumer-portal processor-portal lab-portal regulator-portal stakeholder-dashboard management-portal supply-chain-overview"

REM Fix each portal
for %%p in (%portals%) do (
    echo.
    echo ✅ Fixing frontend/%%p...
    echo.
    
    cd frontend\%%p
    
    REM Clean npm cache
    npm cache clean --force >nul 2>&1
    
    REM Remove node_modules if exists
    if exist node_modules (
        echo   Removing old node_modules...
        rmdir /s /q node_modules >nul 2>&1
    )
    
    REM Remove package-lock.json if exists
    if exist package-lock.json (
        echo   Removing old package-lock.json...
        del package-lock.json >nul 2>&1
    )
    
    REM Install dependencies
    echo   Installing dependencies...
    npm install
    
    if errorlevel 1 (
        echo   ❌ Failed to install dependencies for %%p
    ) else (
        echo   ✅ Successfully fixed %%p
    )
    
    cd ..\..
)

echo.
echo ========================================
echo    DEPENDENCY FIX COMPLETE!
echo ========================================
echo.
echo All frontend portals have been fixed.
echo You can now run: start-trace-herb-full-system.bat
echo.
pause
