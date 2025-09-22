@echo off
title TRACE HERB - Project Cleanup
color 0E

echo.
echo ========================================
echo    TRACE HERB - PROJECT CLEANUP
echo ========================================
echo.
echo 🧹 This will remove unnecessary startup files and test scripts
echo    to clean up your project directory.
echo.
echo ⚠️  IMPORTANT: This will permanently delete files!
echo.
echo Files to be removed:
echo   • Old startup batch files
echo   • Test scripts and JSON files
echo   • Duplicate documentation files
echo   • Temporary files
echo.

set /p confirm="Do you want to proceed? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo 🗑️ Starting cleanup...
echo.

REM Remove old startup files
echo Removing old startup files...
if exist "1-start-backend.bat" del "1-start-backend.bat" && echo ✅ Removed 1-start-backend.bat
if exist "2-start-main-demo.bat" del "2-start-main-demo.bat" && echo ✅ Removed 2-start-main-demo.bat
if exist "3-start-farmer-portal.bat" del "3-start-farmer-portal.bat" && echo ✅ Removed 3-start-farmer-portal.bat
if exist "4-start-lab-portal.bat" del "4-start-lab-portal.bat" && echo ✅ Removed 4-start-lab-portal.bat
if exist "5-start-blockchain.bat" del "5-start-blockchain.bat" && echo ✅ Removed 5-start-blockchain.bat
if exist "START-ALL-SERVICES.bat" del "START-ALL-SERVICES.bat" && echo ✅ Removed START-ALL-SERVICES.bat
if exist "start-trace-herb.bat" del "start-trace-herb.bat" && echo ✅ Removed start-trace-herb.bat
if exist "start-trace-herb-debug.bat" del "start-trace-herb-debug.bat" && echo ✅ Removed start-trace-herb-debug.bat
if exist "start-trace-herb-fixed.bat" del "start-trace-herb-fixed.bat" && echo ✅ Removed start-trace-herb-fixed.bat
if exist "start-trace-herb-simple.bat" del "start-trace-herb-simple.bat" && echo ✅ Removed start-trace-herb-simple.bat
if exist "start-trace-herb-simple-safe.bat" del "start-trace-herb-simple-safe.bat" && echo ✅ Removed start-trace-herb-simple-safe.bat
if exist "test-minimal.bat" del "test-minimal.bat" && echo ✅ Removed test-minimal.bat

REM Remove PowerShell duplicates (keep the main ones)
echo.
echo Removing duplicate PowerShell files...
if exist "start-trace-herb.ps1" del "start-trace-herb.ps1" && echo ✅ Removed start-trace-herb.ps1
if exist "start-trace-herb-powershell.ps1" del "start-trace-herb-powershell.ps1" && echo ✅ Removed start-trace-herb-powershell.ps1
if exist "start-system.ps1" del "start-system.ps1" && echo ✅ Removed start-system.ps1
if exist "start-all-portals.ps1" del "start-all-portals.ps1" && echo ✅ Removed start-all-portals.ps1
if exist "start-all-trace-herb-portals.ps1" del "start-all-trace-herb-portals.ps1" && echo ✅ Removed start-all-trace-herb-portals.ps1
if exist "commit-checkpoint-32.ps1" del "commit-checkpoint-32.ps1" && echo ✅ Removed commit-checkpoint-32.ps1

REM Remove test scripts
echo.
echo Removing test scripts...
if exist "add-rejected-batch.js" del "add-rejected-batch.js" && echo ✅ Removed add-rejected-batch.js
if exist "add-specific-batch.js" del "add-specific-batch.js" && echo ✅ Removed add-specific-batch.js
if exist "add-test-batch.js" del "add-test-batch.js" && echo ✅ Removed add-test-batch.js
if exist "add-your-batch.js" del "add-your-batch.js" && echo ✅ Removed add-your-batch.js
if exist "clear-all-batches.js" del "clear-all-batches.js" && echo ✅ Removed clear-all-batches.js
if exist "direct-batch-add.js" del "direct-batch-add.js" && echo ✅ Removed direct-batch-add.js
if exist "simple-batch-test.js" del "simple-batch-test.js" && echo ✅ Removed simple-batch-test.js
if exist "simple-blockchain-checker.js" del "simple-blockchain-checker.js" && echo ✅ Removed simple-blockchain-checker.js
if exist "update-batch-status.js" del "update-batch-status.js" && echo ✅ Removed update-batch-status.js

REM Remove test JSON files
echo.
echo Removing test JSON files...
if exist "test-collection-new.json" del "test-collection-new.json" && echo ✅ Removed test-collection-new.json
if exist "test-farmer-new.json" del "test-farmer-new.json" && echo ✅ Removed test-farmer-new.json
if exist "test-farmer-submission.json" del "test-farmer-submission.json" && echo ✅ Removed test-farmer-submission.json
if exist "test-lab.json" del "test-lab.json" && echo ✅ Removed test-lab.json
if exist "test-processing.json" del "test-processing.json" && echo ✅ Removed test-processing.json
if exist "test-workflow-approval.json" del "test-workflow-approval.json" && echo ✅ Removed test-workflow-approval.json
if exist "test-workflow-farmer.json" del "test-workflow-farmer.json" && echo ✅ Removed test-workflow-farmer.json
if exist "test-workflow-lab.json" del "test-workflow-lab.json" && echo ✅ Removed test-workflow-lab.json
if exist "test-workflow-processing.json" del "test-workflow-processing.json" && echo ✅ Removed test-workflow-processing.json

REM Remove debugging and fix scripts (keep the main ones)
echo.
echo Removing debugging scripts...
if exist "test-batch-click-debug.js" del "test-batch-click-debug.js" && echo ✅ Removed test-batch-click-debug.js
if exist "test-batch-click-fix.js" del "test-batch-click-fix.js" && echo ✅ Removed test-batch-click-fix.js
if exist "test-correct-batch-display.js" del "test-correct-batch-display.js" && echo ✅ Removed test-correct-batch-display.js
if exist "test-farmer-batch-status.js" del "test-farmer-batch-status.js" && echo ✅ Removed test-farmer-batch-status.js
if exist "test-farmer-instant-batch.js" del "test-farmer-instant-batch.js" && echo ✅ Removed test-farmer-instant-batch.js
if exist "test-farmer-portal-realtime.js" del "test-farmer-portal-realtime.js" && echo ✅ Removed test-farmer-portal-realtime.js
if exist "test-realtime-batch-updates.js" del "test-realtime-batch-updates.js" && echo ✅ Removed test-realtime-batch-updates.js
if exist "test-realtime-sync.js" del "test-realtime-sync.js" && echo ✅ Removed test-realtime-sync.js
if exist "test-rejected-batch.js" del "test-rejected-batch.js" && echo ✅ Removed test-rejected-batch.js
if exist "test-specific-batch-fix.js" del "test-specific-batch-fix.js" && echo ✅ Removed test-specific-batch-fix.js
if exist "test-sync-functionality.js" del "test-sync-functionality.js" && echo ✅ Removed test-sync-functionality.js

REM Remove duplicate documentation files
echo.
echo Removing duplicate documentation...
if exist "NEW_GITIGNORE" del "NEW_GITIGNORE" && echo ✅ Removed NEW_GITIGNORE
if exist "NEW_PACKAGE_JSON" del "NEW_PACKAGE_JSON" && echo ✅ Removed NEW_PACKAGE_JSON
if exist "NEW_README.md" del "NEW_README.md" && echo ✅ Removed NEW_README.md
if exist "README-PRODUCTION.md" del "README-PRODUCTION.md" && echo ✅ Removed README-PRODUCTION.md
if exist "UPLOAD_COMMANDS.bat" del "UPLOAD_COMMANDS.bat" && echo ✅ Removed UPLOAD_COMMANDS.bat
if exist "CLEAN_REPOSITORY_SETUP.bat" del "CLEAN_REPOSITORY_SETUP.bat" && echo ✅ Removed CLEAN_REPOSITORY_SETUP.bat

REM Remove temporary files
echo.
echo Removing temporary files...
if exist "blockchain-status-checker.html" del "blockchain-status-checker.html" && echo ✅ Removed blockchain-status-checker.html
if exist "blockchain-status-report.json" del "blockchain-status-report.json" && echo ✅ Removed blockchain-status-report.json
if exist "blockchain-verification-tool.js" del "blockchain-verification-tool.js" && echo ✅ Removed blockchain-verification-tool.js
if exist "test-cors.html" del "test-cors.html" && echo ✅ Removed test-cors.html
if exist "system-config.json" del "system-config.json" && echo ✅ Removed system-config.json

REM Remove shell scripts (Windows environment)
echo.
echo Removing shell scripts (keeping PowerShell)...
if exist "start-trace-herb.sh" del "start-trace-herb.sh" && echo ✅ Removed start-trace-herb.sh
if exist "deploy-production-system.sh" del "deploy-production-system.sh" && echo ✅ Removed deploy-production-system.sh

echo.
echo ========================================
echo    🎉 CLEANUP COMPLETED!
echo ========================================
echo.
echo ✅ Removed unnecessary startup files
echo ✅ Removed test scripts and JSON files
echo ✅ Removed duplicate documentation
echo ✅ Removed temporary files
echo.
echo 📁 REMAINING KEY FILES:
echo   • TRACE-HERB-MASTER-STARTUP.bat (Main startup file)
echo   • start-trace-herb-full-system.bat (Alternative startup)
echo   • setup-full-blockchain-network.ps1 (Blockchain setup)
echo   • docker-compose.yml (Docker configuration)
echo   • package.json (Project dependencies)
echo   • README.md (Main documentation)
echo.
echo 🚀 USE THIS FILE TO START YOUR PROJECT:
echo   TRACE-HERB-MASTER-STARTUP.bat
echo.

pause
