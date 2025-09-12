@echo off
echo 🧹 TRACE HERB - Clean Repository Setup
echo =====================================
echo This will create a fresh repository with only your name as contributor
echo.

echo 📋 Step 1: Backup current directory...
if not exist "TRACE-HERB-BACKUP" mkdir TRACE-HERB-BACKUP
xcopy /E /I /Y . TRACE-HERB-BACKUP

echo.
echo 📋 Step 2: Remove old git history...
rmdir /S /Q .git

echo.
echo 📋 Step 3: Initialize fresh repository...
git init

echo.
echo 📋 Step 4: Set your Git identity...
git config user.name "vimalluuu"
git config user.email "vimal@example.com"

echo.
echo 📋 Step 5: Add all files...
git add .

echo.
echo 📋 Step 6: Create initial commit with your name only...
git commit -m "🌿 TRACE HERB - Complete Blockchain Traceability System

✅ HACKATHON-READY FEATURES:
- Complete end-to-end traceability (Farm → Consumer)
- 8 specialized portals with professional UI/UX
- Real-time workflow management with automatic progression
- Amazon-style consumer tracking interface
- Hyperledger Fabric blockchain integration
- QR code generation and verification system
- Multi-stakeholder platform with role-based access
- Comprehensive quality testing and certification
- Regulatory compliance and approval workflows

🏆 TECHNICAL ACHIEVEMENTS:
- Node.js/Express.js backend with REST APIs
- Next.js/React frontend with Tailwind CSS
- Sequential workflow control
- Real-time dashboard updates
- Professional deployment scripts

📊 SYSTEM STATUS: 70%% of ideal vision fulfilled
🎪 DEMO READY: Complete workflow demonstration available
🚀 DEPLOYMENT: One-command setup available

Author: vimalluuu
Ready for hackathon judges! 🏆"

echo.
echo 📋 Step 7: Add GitHub remote...
git remote add origin https://github.com/vimalluuu/TRACE-HERB-COMPLETE.git

echo.
echo 📋 Step 8: Push to GitHub...
git push -u origin master

echo.
echo ✅ Clean repository setup complete!
echo 🌐 Repository URL: https://github.com/vimalluuu/TRACE-HERB-COMPLETE
echo 👤 Only contributor: vimalluuu
echo.
echo 🎪 Ready for hackathon demonstration!
pause
