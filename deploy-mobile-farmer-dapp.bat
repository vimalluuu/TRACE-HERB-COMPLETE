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

:: Start backend server first
echo 🔧 Starting backend server for mobile connectivity...
cd /d "%~dp0backend"
start "TRACE HERB Backend" cmd /k "npm run dev"
echo ✅ Backend server starting on port 3000...
echo.

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

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
echo 🔧 Setting up mobile configuration and blockchain connectivity fixes...

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

:: Test mobile connectivity
echo.
echo 🧪 Testing mobile connectivity...
timeout /t 2 /nobreak >nul
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://%ip%:3000/api/mobile/test' -Headers @{'X-Mobile-Client'='true'; 'X-Source'='farmer-mobile-dapp'} -TimeoutSec 10; if ($response.StatusCode -eq 200) { Write-Host '✅ Mobile connectivity test: PASSED' -ForegroundColor Green } else { Write-Host '⚠️ Mobile connectivity test: FAILED' -ForegroundColor Yellow } } catch { Write-Host '⚠️ Mobile connectivity test: FAILED - Backend may still be starting' -ForegroundColor Yellow }"

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
echo 4. BLOCKCHAIN CONNECTIVITY FIXES APPLIED:
echo    ✅ Enhanced CORS configuration for mobile IPs
echo    ✅ Mobile connectivity test endpoint added
echo    ✅ Multiple blockchain endpoint fallbacks
echo    ✅ Enhanced error handling and logging
echo    ✅ Mobile-specific timeout settings (15s)
echo    ✅ Server-side rendering fixes applied
echo    ✅ Real-time connectivity diagnostics
echo.
echo 5. MOBILE FEATURES ENABLED:
echo    ✅ Offline functionality with local storage
echo    ✅ Enhanced blockchain synchronization
echo    ✅ Mobile-optimized UI with touch gestures
echo    ✅ Network diagnostics and sync status
echo    ✅ Automatic retry with queue management
echo    ✅ Real-time sync progress indicator
echo    ✅ Cross-platform compatibility
echo.
echo 6. MOBILE SYNC FEATURES:
echo    - Data syncs directly to blockchain (no more local-only storage)
echo    - Automatic sync when connection restored
echo    - Sync status indicator in bottom-right corner
echo    - Network diagnostics for troubleshooting
echo    - Queue management for failed operations
echo    - Mobile connectivity test button in dashboard
echo.
echo 7. TESTING STEPS:
echo    - Test on mobile browser first
echo    - Use "📱 Test Connection" button in dashboard
echo    - Create a batch and verify blockchain sync
echo    - Install as PWA for full experience
echo    - Test offline functionality
echo.
echo 8. TROUBLESHOOTING:
echo    - If mobile can't connect, check WiFi network
echo    - Use Network Diagnostics in the app
echo    - Check Windows Firewall settings if needed
echo    - Backend runs on port 3000, mobile DApp on port 3002
echo.
echo ========================================

:: Start the mobile server
echo.
echo 🚀 Starting mobile DApp server...
echo.
echo Backend Server: http://%ip%:3000 ^(CA-Connected mode^)
echo Mobile DApp: http://%ip%:3002
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start with mobile-optimized settings
call npm run mobile

pause
