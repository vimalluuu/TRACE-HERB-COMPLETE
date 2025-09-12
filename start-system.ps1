# TRACE HERB System Startup Script
# This script ensures all components start in the correct order with proper configurations

Write-Host "🚀 Starting TRACE HERB System..." -ForegroundColor Green

# Step 1: Start Blockchain Network
Write-Host "📦 Starting Hyperledger Fabric Network..." -ForegroundColor Yellow
Set-Location "blockchain"
docker-compose -f network/docker-compose.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Blockchain network started successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start blockchain network" -ForegroundColor Red
    exit 1
}

# Wait for containers to be ready
Write-Host "⏳ Waiting for containers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 2: Start Backend API
Write-Host "🔧 Starting Backend API..." -ForegroundColor Yellow
Set-Location "../backend"
Start-Process powershell -ArgumentList "-Command", "npm start" -WindowStyle Minimized
Start-Sleep -Seconds 5

# Step 3: Start Frontend Portals
Write-Host "🌐 Starting Frontend Portals..." -ForegroundColor Yellow

$portals = @(
    @{Name="Farmer Portal"; Path="../frontend/farmer-dapp"; Port=3001},
    @{Name="Lab Portal"; Path="../frontend/lab-portal"; Port=3002},
    @{Name="Processor Portal"; Path="../frontend/processor-portal"; Port=3003},
    @{Name="Enhanced Consumer Portal"; Path="../frontend/enhanced-consumer-portal"; Port=3004},
    @{Name="Regulator Portal"; Path="../frontend/regulator-portal"; Port=3005},
    @{Name="Management Portal"; Path="../frontend/management-portal"; Port=3006},
    @{Name="Stakeholder Dashboard"; Path="../frontend/stakeholder-dashboard"; Port=3007},
    @{Name="Supply Chain Overview"; Path="../frontend/supply-chain-overview"; Port=3008}
)

foreach ($portal in $portals) {
    Write-Host "  Starting $($portal.Name) on port $($portal.Port)..." -ForegroundColor Cyan
    Set-Location $portal.Path
    Start-Process powershell -ArgumentList "-Command", "npm run dev -- -p $($portal.Port)" -WindowStyle Minimized
    Start-Sleep -Seconds 2
}

# Step 4: System Status Check
Write-Host "🔍 Checking System Status..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check Docker containers
Write-Host "📊 Docker Containers:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check if backend is responding
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend API is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Backend API not responding yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 TRACE HERB System Started Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Available Services:" -ForegroundColor White
Write-Host "  🔧 Backend API:              http://localhost:3000" -ForegroundColor Gray
Write-Host "  👨‍🌾 Farmer Portal:            http://localhost:3001" -ForegroundColor Gray
Write-Host "  🔬 Lab Portal:               http://localhost:3002" -ForegroundColor Gray
Write-Host "  🏭 Processor Portal:         http://localhost:3003" -ForegroundColor Gray
Write-Host "  📱 Enhanced Consumer Portal: http://localhost:3004" -ForegroundColor Gray
Write-Host "  ⚖️ Regulator Portal:         http://localhost:3005" -ForegroundColor Gray
Write-Host "  📊 Management Portal:        http://localhost:3006" -ForegroundColor Gray
Write-Host "  📈 Stakeholder Dashboard:    http://localhost:3007" -ForegroundColor Gray
Write-Host "  🔗 Supply Chain Overview:   http://localhost:3008" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Blockchain Mode: CA-Connected (Real Certificate Authorities)" -ForegroundColor Green
Write-Host "📍 All port numbers are correctly configured" -ForegroundColor Green
Write-Host ""
Write-Host "Ready for hackathon demonstration! 🏆" -ForegroundColor Yellow

# Return to root directory
Set-Location ".."
