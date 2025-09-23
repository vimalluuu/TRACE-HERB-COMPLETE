@echo off
echo.
echo ========================================
echo   TRACE HERB MOBILE ICON GENERATOR
echo ========================================
echo.

:: Navigate to farmer DApp public directory
cd /d "%~dp0frontend\farmer-dapp\public"

:: Check if we have the icon generator
if not exist "icon-generator.html" (
    echo ❌ Icon generator not found
    echo Please ensure icon-generator.html exists in the public folder
    pause
    exit /b 1
)

echo 📱 Opening icon generator in browser...
echo.
echo INSTRUCTIONS:
echo 1. The icon generator will open in your browser
echo 2. Right-click on each icon to save as PNG
echo 3. Save as "icon-192x192.png" and "icon-512x512.png"
echo 4. Save them in the public folder
echo.

:: Open the icon generator in default browser
start "" "icon-generator.html"

echo ✅ Icon generator opened!
echo.
echo After saving the icons, your mobile DApp will have:
echo - 📱 Proper app icons for home screen
echo - 🎨 Professional branding
echo - ✨ Native app appearance
echo.

pause
