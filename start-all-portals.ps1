# TRACE HERB - Start All Frontend Portals
# This script starts all frontend portals in separate PowerShell windows

param(
    [switch]$SkipBackend = $false
)

# Colors for output
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Step { param($Message) Write-Host "[STEP] $Message" -ForegroundColor Blue }

Write-Host "TRACE HERB - Starting All Portals" -ForegroundColor Magenta
Write-Host "==================================" -ForegroundColor Magenta

# Check if backend is running
if (-not $SkipBackend) {
    Write-Step "Checking if backend is running..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Success "Backend is already running"
    } catch {
        Write-Step "Starting backend service..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal
        Write-Info "Waiting for backend to start..."
        Start-Sleep -Seconds 10
    }
}

# Start Enhanced Consumer Portal
Write-Step "Starting Enhanced Consumer Portal (Port 3000)..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Success "Enhanced Consumer Portal is already running"
} catch {
    Write-Info "Enhanced Consumer Portal will be served by backend"
}

# Start Farmer Portal
Write-Step "Starting Farmer Portal (Port 3002)..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Success "Farmer Portal is already running"
} catch {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend\farmer-dapp; npm run dev" -WindowStyle Normal
    Write-Info "Started Farmer Portal"
}

# Start Processor Portal
Write-Step "Starting Processor Portal (Port 3004)..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3004" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Success "Processor Portal is already running"
} catch {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend\processor-portal; npm run dev" -WindowStyle Normal
    Write-Info "Started Processor Portal"
}

# Start Laboratory Portal
Write-Step "Starting Laboratory Portal (Port 3005)..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Success "Laboratory Portal is already running"
} catch {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend\lab-portal; npm run dev" -WindowStyle Normal
    Write-Info "Started Laboratory Portal"
}

# Start Regulatory Portal
Write-Step "Starting Regulatory Portal (Port 3006)..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3006" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Success "Regulatory Portal is already running"
} catch {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend\regulator-portal; npm run dev" -WindowStyle Normal
    Write-Info "Started Regulatory Portal"
}

Write-Info "Waiting for all portals to initialize..."
Start-Sleep -Seconds 15

Write-Host ""
Write-Success "All TRACE HERB Portals Started!"
Write-Host ""
Write-Info "Access Points:"
Write-Host "  Enhanced Consumer Portal:  http://localhost:3000" -ForegroundColor White
Write-Host "  Farmer Portal:             http://localhost:3002" -ForegroundColor White  
Write-Host "  Processor Portal:          http://localhost:3004" -ForegroundColor White
Write-Host "  Laboratory Portal:         http://localhost:3005" -ForegroundColor White
Write-Host "  Regulatory Portal:         http://localhost:3006" -ForegroundColor White
Write-Host ""
Write-Info "Backend API:                 http://localhost:3000/api"
Write-Host ""

# Test all portals
Write-Step "Testing portal accessibility..."
$portals = @{
    "Enhanced Consumer Portal" = "http://localhost:3000"
    "Farmer Portal" = "http://localhost:3002"
    "Processor Portal" = "http://localhost:3004"
    "Laboratory Portal" = "http://localhost:3005"
    "Regulatory Portal" = "http://localhost:3006"
}

foreach ($portal in $portals.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri $portal.Value -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Success "$($portal.Key) is accessible"
    } catch {
        Write-Warning "$($portal.Key) is not accessible yet"
    }
}

Write-Host ""
Write-Success "TRACE HERB System is ready for demonstration!"
Write-Host ""
Write-Info "Press any key to open all portals in browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open all portals in browser
Start-Process "http://localhost:3000"
Start-Process "http://localhost:3002"
Start-Process "http://localhost:3004"
Start-Process "http://localhost:3005"
Start-Process "http://localhost:3006"

Write-Success "All portals opened in browser!"
