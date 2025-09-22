@echo off
title TRACE HERB - Commit to Master Branch
color 0A

echo.
echo ========================================
echo    TRACE HERB - COMMIT TO MASTER
echo ========================================
echo.
echo 🚀 Committing all changes to master branch
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found! Please install Git
    pause
    exit /b 1
)

echo ✅ Git is available
echo.

REM Check current branch
echo 🔍 Checking current branch...
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set current_branch=%%i

if "%current_branch%"=="" (
    echo 📝 No current branch detected, assuming master
    set current_branch=master
)

echo 📍 Current branch: %current_branch%
echo.

REM Switch to master if not already there
if not "%current_branch%"=="master" (
    echo 🔄 Switching to master branch...
    git checkout master
    if errorlevel 1 (
        echo ❌ Failed to switch to master branch
        echo Creating master branch...
        git checkout -b master
        if errorlevel 1 (
            echo ❌ Failed to create master branch
            pause
            exit /b 1
        )
    )
    echo ✅ Switched to master branch
    echo.
)

REM Check git status
echo 📊 Checking git status...
git status --porcelain > temp_status.txt
set /p git_status=<temp_status.txt
del temp_status.txt

if "%git_status%"=="" (
    echo ℹ️ No changes to commit
    echo.
) else (
    echo 📝 Changes detected, proceeding with commit...
    echo.
)

REM Add all files
echo 📦 Adding all files to staging...
git add .
if errorlevel 1 (
    echo ❌ Failed to add files
    pause
    exit /b 1
)
echo ✅ All files added to staging
echo.

REM Create comprehensive commit message
echo 📝 Creating commit message...

set commit_msg=🚀 TRACE HERB: Complete System Implementation with Master Startup

feat: Add comprehensive TRACE HERB system with single-command startup

✨ New Features:
- 🎯 TRACE-HERB-MASTER-STARTUP.bat: One-click complete system startup
- 🧹 CLEANUP-UNNECESSARY-FILES.bat: Project cleanup utility
- 📋 STARTUP-INSTRUCTIONS.md: Comprehensive startup documentation
- 🔧 Enhanced real-time batch synchronization across all portals
- 🔄 Cross-portal data merging and timeline updates

🏗️ System Architecture:
- 🔗 Full Hyperledger Fabric blockchain network (CA-Connected mode)
- 🖥️ Backend API server with blockchain integration
- 🌐 7 Frontend portals with real-time synchronization
- 📱 Mobile-ready farmer DApp
- 🛍️ Enhanced consumer portal with QR tracking

🌐 Portal Ecosystem:
- 🌾 Farmer Portal (Port 3002): Batch creation and tracking
- 🏭 Processor Portal (Port 3003): Processing and quality checks
- 🧪 Laboratory Portal (Port 3005): Testing and analysis
- 📋 Regulatory Portal (Port 3006): Compliance and approval
- 📊 Management Portal (Port 3007): System management
- 👥 Stakeholder Dashboard (Port 3008): Stakeholder overview
- 🛍️ Consumer Portal (Port 3010): QR scanning and tracking

🔧 Technical Improvements:
- ✅ Fixed real-time timeline synchronization issues
- ✅ Enhanced batch status progression across portals
- ✅ Improved cross-portal data consistency
- ✅ Added comprehensive error handling
- ✅ Automated dependency installation
- ✅ Docker integration for blockchain network

🎯 Key Features:
- 🔄 Real-time synchronization between all portals
- 📊 Complete supply chain traceability
- 🔐 CA-Connected blockchain with real certificate authorities
- 📱 Mobile-responsive design
- 🎨 Professional UI/UX across all portals
- 🧪 Complete workflow testing capabilities

🛠️ DevOps & Deployment:
- 🚀 Single-command startup script
- 🐳 Docker containerization
- 📦 Automated dependency management
- 🧹 Project cleanup utilities
- 📋 Comprehensive documentation

This commit represents a complete, production-ready TRACE HERB system
suitable for hackathon demonstrations and real-world deployment.

echo.
echo 💾 Committing changes...
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo ❌ Commit failed
    pause
    exit /b 1
)

echo ✅ Commit successful!
echo.

REM Check if remote exists
echo 🔍 Checking remote repository...
git remote -v > temp_remote.txt 2>nul
set remote_exists=false
for /f %%i in (temp_remote.txt) do set remote_exists=true
del temp_remote.txt

if "%remote_exists%"=="true" (
    echo 📡 Remote repository detected
    echo.
    
    set /p push_confirm="Do you want to push to remote repository? (Y/N): "
    if /i "%push_confirm%"=="Y" (
        echo 🚀 Pushing to remote master...
        git push origin master
        if errorlevel 1 (
            echo ⚠️ Push failed, but local commit was successful
            echo You may need to set up remote repository or resolve conflicts
        ) else (
            echo ✅ Successfully pushed to remote master!
        )
    ) else (
        echo ℹ️ Skipped remote push
    )
) else (
    echo ℹ️ No remote repository configured
    echo Local commit completed successfully
)

echo.
echo ========================================
echo    🎉 COMMIT COMPLETED!
echo ========================================
echo.
echo ✅ All changes committed to master branch
echo 📝 Commit includes:
echo   • Master startup script
echo   • Cleanup utilities
echo   • Documentation updates
echo   • Real-time sync fixes
echo   • All portal enhancements
echo.
echo 🎯 Your TRACE HERB system is now committed and ready!
echo.

pause
