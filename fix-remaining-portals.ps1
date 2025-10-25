# TRACE HERB - Fix Remaining Frontend Portals
Write-Host "========================================" -ForegroundColor Green
Write-Host "   TRACE HERB - FIX REMAINING PORTALS" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# List of remaining portals to fix
$portals = @(
    "processor-portal",
    "lab-portal", 
    "regulator-portal",
    "stakeholder-dashboard",
    "management-portal",
    "supply-chain-overview"
)

# Set location to frontend directory
Set-Location "frontend"

foreach ($portal in $portals) {
    Write-Host "🔧 Fixing $portal..." -ForegroundColor Yellow
    
    Set-Location $portal
    
    # Remove node_modules and package-lock.json
    if (Test-Path "node_modules") {
        Write-Host "  Removing node_modules..." -ForegroundColor Gray
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Write-Host "  Removing package-lock.json..." -ForegroundColor Gray
        Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
    }
    
    # Install dependencies
    Write-Host "  Installing dependencies..." -ForegroundColor Gray
    $result = npm install 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Successfully fixed $portal" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to fix $portal" -ForegroundColor Red
        Write-Host "  Error: $result" -ForegroundColor Red
    }
    
    Set-Location ".."
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "   ALL PORTALS FIXED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run: start-trace-herb-full-system.bat" -ForegroundColor Cyan
Write-Host ""
