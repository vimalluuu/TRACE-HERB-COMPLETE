@echo off
echo.
echo ========================================
echo   TRACE HERB FARMER MOBILE DAPP SETUP
echo ========================================
echo.

:: Set colors for better visibility
color 0A

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

:: Navigate to farmer DApp directory
cd /d "%~dp0frontend\farmer-dapp"

echo 📦 Installing mobile DApp dependencies...
echo.

:: Install dependencies
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully
echo.

:: Install PWA dependencies
echo 📱 Installing PWA dependencies...
call npm install next-pwa@latest workbox-webpack-plugin@latest
if errorlevel 1 (
    echo ⚠️ PWA dependencies installation failed, continuing anyway...
)

echo.
echo 🔧 Setting up mobile configuration...

:: Create browserconfig.xml for Windows tiles
echo ^<?xml version="1.0" encoding="utf-8"?^> > public\browserconfig.xml
echo ^<browserconfig^> >> public\browserconfig.xml
echo   ^<msapplication^> >> public\browserconfig.xml
echo     ^<tile^> >> public\browserconfig.xml
echo       ^<square150x150logo src="/icon-192x192.png"/^> >> public\browserconfig.xml
echo       ^<TileColor^>#16a34a^</TileColor^> >> public\browserconfig.xml
echo     ^</tile^> >> public\browserconfig.xml
echo   ^</msapplication^> >> public\browserconfig.xml
echo ^</browserconfig^> >> public\browserconfig.xml

echo ✅ Mobile configuration complete
echo.

:: Build the application
echo 🏗️ Building mobile DApp...
echo.
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully
echo.

:: Get local IP address for mobile testing
echo 📱 Getting network information for mobile testing...
setlocal enabledelayedexpansion
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    if not "!ip!"=="127.0.0.1" (
        goto :found_ip
    )
)
:found_ip

:: Configure mobile backend IP in localStorage
echo 🔧 Configuring mobile backend IP...
cd /d "%~dp0frontend\farmer-dapp\public"
echo localStorage.setItem('mobile-backend-ip', '%ip%'); > mobile-config.js
echo console.log('📱 Mobile backend IP configured:', '%ip%'); >> mobile-config.js

echo.
echo ========================================
echo   🎉 MOBILE DAPP SETUP COMPLETE!
echo ========================================
echo.
echo 📱 MOBILE ACCESS INSTRUCTIONS:
echo.
echo 1. DESKTOP ACCESS:
echo    http://localhost:3002
echo.
if defined ip (
    echo 2. MOBILE ACCESS ^(same network^):
    echo    http://%ip%:3002
    echo.
)
echo 3. PWA INSTALLATION:
echo    - Open the URL on your mobile device
echo    - Look for "Add to Home Screen" prompt
echo    - Or use browser menu ^> "Add to Home Screen"
echo.
echo 4. FEATURES ENABLED:
echo    ✅ Offline functionality with local storage
echo    ✅ Enhanced blockchain synchronization
echo    ✅ Mobile-optimized UI with touch gestures
echo    ✅ Network diagnostics and sync status
echo    ✅ Automatic retry with queue management
echo    ✅ Real-time sync progress indicator
echo    ✅ Cross-platform compatibility
echo.
echo 5. MOBILE SYNC FEATURES:
echo    - Data saved locally when offline
echo    - Automatic sync when connection restored
echo    - Sync status indicator in bottom-right corner
echo    - Network diagnostics for troubleshooting
echo    - Queue management for failed operations
echo.
echo 6. TESTING STEPS:
echo    - Test on mobile browser first
echo    - Install as PWA for full experience
echo    - Test offline functionality
echo    - Test batch creation and blockchain sync
echo    - Use Network Diagnostics if connection issues
echo.
echo ========================================

:: Start the mobile server
echo.
echo 🚀 Starting mobile DApp server...
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start with mobile-optimized settings
call npm run mobile

pause
