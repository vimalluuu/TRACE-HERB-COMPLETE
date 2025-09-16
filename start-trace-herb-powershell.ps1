# TRACE HERB - PowerShell Startup Script
Write-Host "========================================" -ForegroundColor Green
Write-Host "    TRACE HERB - PowerShell Startup" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found! Install from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Enhanced Consumer Portal
Write-Host "Starting Enhanced Consumer Portal..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend\enhanced-consumer-portal; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Farmer Portal
Write-Host "Starting Farmer Portal..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend\farmer-dapp; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Lab Portal
Write-Host "Starting Lab Portal..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend\lab-portal; npm run dev -- -p 3005" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    SERVICES STARTING!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "Main Demo: http://localhost:3010" -ForegroundColor White
Write-Host "Farmer Portal: http://localhost:3002" -ForegroundColor White  
Write-Host "Lab Portal: http://localhost:3005" -ForegroundColor White
Write-Host "Backend API: http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "Wait 60 seconds for all services to fully load" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to open main demo portal"
Start-Process "http://localhost:3010"
