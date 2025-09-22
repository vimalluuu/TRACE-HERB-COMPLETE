# TRACE HERB - Start ALL Portals
# This script starts all TRACE HERB portals with proper port assignments

param(
    [switch]$SkipBackend = $false,
    [switch]$OpenBrowser = $true
)

# Colors for output
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Step { param($Message) Write-Host "[STEP] $Message" -ForegroundColor Blue }

Write-Host "TRACE HERB - Starting ALL Portals" -ForegroundColor Magenta
Write-Host "==================================" -ForegroundColor Magenta

# Define all portals with their CORRECT ports and paths
$portals = @(
    @{ Name = "Backend API"; Path = "backend"; Port = 3000; Command = "npm run dev"; Skip = $SkipBackend },
    @{ Name = "Enhanced Consumer Portal"; Path = "frontend\enhanced-consumer-portal"; Port = 3001; Command = "npm run dev" },
    @{ Name = "Farmer Portal"; Path = "frontend\farmer-dapp"; Port = 3002; Command = "npm run dev" },
    @{ Name = "Processor Portal"; Path = "frontend\processor-portal"; Port = 3003; Command = "npm run dev" },
    @{ Name = "Laboratory Portal"; Path = "frontend\lab-portal"; Port = 3004; Command = "npm run dev" },
    @{ Name = "Regulatory Portal"; Path = "frontend\regulator-portal"; Port = 3005; Command = "npm run dev" },
    @{ Name = "Stakeholder Dashboard"; Path = "frontend\stakeholder-dashboard"; Port = 3006; Command = "npm run dev" },
    @{ Name = "Management Portal"; Path = "frontend\management-portal"; Port = 3007; Command = "npm run dev" },
    @{ Name = "Supply Chain Overview"; Path = "frontend\supply-chain-overview"; Port = 3008; Command = "npm run dev" }
)

Write-Info "Portal Configuration:"
foreach ($portal in $portals) {
    if (-not $portal.Skip) {
        Write-Host "  $($portal.Name): http://localhost:$($portal.Port)" -ForegroundColor White
    }
}
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Start each portal
foreach ($portal in $portals) {
    if ($portal.Skip) {
        Write-Info "Skipping $($portal.Name)"
        continue
    }

    Write-Step "Starting $($portal.Name) on port $($portal.Port)..."
    
    # Check if already running
    if (Test-Port -Port $portal.Port) {
        Write-Success "$($portal.Name) is already running"
        continue
    }
    
    # Check if directory exists
    if (-not (Test-Path $portal.Path)) {
        Write-Error "Directory not found: $($portal.Path)"
        continue
    }
    
    # Start the portal
    try {
        $windowTitle = "$($portal.Name) - Port $($portal.Port)"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($portal.Path)'; $($portal.Command)" -WindowStyle Normal
        Write-Success "Started $($portal.Name)"
        Start-Sleep -Seconds 2
    } catch {
        Write-Error "Failed to start $($portal.Name): $($_.Exception.Message)"
    }
}

Write-Info "Waiting for all portals to initialize..."
Start-Sleep -Seconds 20

Write-Host ""
Write-Success "All TRACE HERB Portals Started!"
Write-Host ""

# Test portal accessibility
Write-Step "Testing portal accessibility..."
$accessiblePortals = @()
$inaccessiblePortals = @()

foreach ($portal in $portals) {
    if ($portal.Skip) { continue }
    
    $url = "http://localhost:$($portal.Port)"
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Success "$($portal.Name) is accessible"
        $accessiblePortals += @{ Name = $portal.Name; URL = $url }
    } catch {
        Write-Warning "$($portal.Name) is not accessible yet"
        $inaccessiblePortals += $portal.Name
    }
}

Write-Host ""
Write-Info "=== TRACE HERB SYSTEM STATUS ==="
Write-Host ""

if ($accessiblePortals.Count -gt 0) {
    Write-Success "Accessible Portals ($($accessiblePortals.Count)):"
    foreach ($portal in $accessiblePortals) {
        Write-Host "  ✅ $($portal.Name): $($portal.URL)" -ForegroundColor Green
    }
}

if ($inaccessiblePortals.Count -gt 0) {
    Write-Warning "Portals Still Starting ($($inaccessiblePortals.Count)):"
    foreach ($portalName in $inaccessiblePortals) {
        Write-Host "  ⏳ $portalName" -ForegroundColor Yellow
    }
    Write-Info "These portals may need a few more minutes to fully initialize."
}

Write-Host ""
Write-Info "=== QUICK ACCESS URLS ==="
Write-Host "Backend API:              http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "Enhanced Consumer Portal: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Farmer Portal:            http://localhost:3002" -ForegroundColor Cyan
Write-Host "Processor Portal:         http://localhost:3003" -ForegroundColor Cyan
Write-Host "Laboratory Portal:        http://localhost:3004" -ForegroundColor Cyan
Write-Host "Regulatory Portal:        http://localhost:3005" -ForegroundColor Cyan
Write-Host "Stakeholder Dashboard:    http://localhost:3006" -ForegroundColor Cyan
Write-Host "Management Portal:        http://localhost:3007" -ForegroundColor Cyan
Write-Host "Supply Chain Overview:    http://localhost:3008" -ForegroundColor Cyan

Write-Host ""
Write-Success "🌿 TRACE HERB Complete System is Ready!"

if ($OpenBrowser) {
    Write-Info "Press any key to open all portals in browser..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    Write-Step "Opening all portals in browser..."
    
    # Open main portals
    Start-Process "http://localhost:3000"  # Backend API
    Start-Process "http://localhost:3001"  # Enhanced Consumer Portal
    Start-Process "http://localhost:3002"  # Farmer Portal
    Start-Process "http://localhost:3003"  # Processor Portal
    Start-Process "http://localhost:3004"  # Laboratory Portal
    Start-Process "http://localhost:3005"  # Regulatory Portal
    Start-Process "http://localhost:3006"  # Stakeholder Dashboard
    Start-Process "http://localhost:3007"  # Management Portal
    Start-Process "http://localhost:3008"  # Supply Chain Overview
    
    Write-Success "All portals opened in browser!"
}

Write-Host ""
Write-Info "To stop all portals: Close all PowerShell windows or press Ctrl+C in each terminal"
Write-Info "To restart a specific portal: Navigate to its directory and run 'npm run dev'"
