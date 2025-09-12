@echo off
echo 🌿 TRACE HERB - GitHub Upload Script
echo =====================================

echo.
echo 📋 Step 1: Adding GitHub remote...
git remote add origin https://github.com/vimalluuu/TRACE-HERB-COMPLETE.git

echo.
echo 📋 Step 2: Verifying remote...
git remote -v

echo.
echo 📋 Step 3: Pushing to GitHub...
git push -u origin master

echo.
echo ✅ Upload complete!
echo 🌐 Your repository is now available at:
echo https://github.com/vimalluuu/TRACE-HERB-COMPLETE

echo.
echo 🎪 Ready for hackathon demonstration!
pause
