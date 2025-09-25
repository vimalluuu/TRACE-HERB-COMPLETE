# TRACE HERB - Full Hyperledger Fabric Network Setup
# This script sets up and starts the complete blockchain network

param(
    [switch]$Clean = $false,
    [switch]$Verbose = $false
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Colors for output
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Step { param($Message) Write-Host "[STEP] $Message" -ForegroundColor Blue }

Write-Host "TRACE HERB - Full Blockchain Network Setup" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta

# Step 1: Check Prerequisites
Write-Step "Checking prerequisites..."

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Success "Docker found: $dockerVersion"
} catch {
    Write-Error "Docker not found! Please install Docker Desktop"
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Success "Docker Compose found: $composeVersion"
} catch {
    Write-Error "Docker Compose not found! Please install Docker Compose"
    exit 1
}

# Step 2: Clean previous network if requested
if ($Clean) {
    Write-Step "Cleaning previous network..."

    # Stop and remove containers
    try {
        docker-compose -f blockchain/network/docker-compose.yml down -v --remove-orphans 2>$null
        docker-compose -f docker-compose.yml down -v --remove-orphans 2>$null
    } catch {
        Write-Info "No previous containers to clean"
    }

    # Remove volumes
    docker volume prune -f 2>$null

    # Remove networks
    docker network prune -f 2>$null

    Write-Success "Previous network cleaned"
}

# Step 3: Generate Crypto Material
Write-Step "Generating cryptographic material..."

Set-Location blockchain

# Check if crypto material exists
if (!(Test-Path "organizations/peerOrganizations") -or $Clean) {
    Write-Info "Generating new crypto material..."

    # Run crypto generation script
    if (Test-Path "setup-network.ps1") {
        .\setup-network.ps1 -GenerateCrypto
    } else {
        Write-Warning "Crypto generation script not found, using existing material"
    }
} else {
    Write-Success "Crypto material already exists"
}

Set-Location ..

# Step 4: Start Certificate Authorities
Write-Step "Starting Certificate Authorities..."

Set-Location blockchain/network
docker-compose up -d ca.farmers.trace-herb.com ca.processors.trace-herb.com ca.labs.trace-herb.com ca.regulators.trace-herb.com

# Wait for CAs to start
Write-Info "Waiting for Certificate Authorities to start..."
Start-Sleep -Seconds 10

# Test CA connections
$caEndpoints = @(
    "https://localhost:7054",
    "https://localhost:8054",
    "https://localhost:9054",
    "https://localhost:10054"
)

foreach ($endpoint in $caEndpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$endpoint/cainfo" -SkipCertificateCheck -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Success "CA at $endpoint is responding"
    } catch {
        Write-Warning "CA at $endpoint is not responding yet"
    }
}

Set-Location ../..

# Step 5: Start Orderer
Write-Step "Starting Orderer..."

Set-Location blockchain/network
docker-compose up -d orderer.trace-herb.com

Write-Info "Waiting for Orderer to start..."
Start-Sleep -Seconds 5

Set-Location ../..

# Step 6: Start Peers
Write-Step "Starting Peer nodes..."

Set-Location blockchain/network
docker-compose up -d peer0.farmers.trace-herb.com peer0.processors.trace-herb.com peer0.labs.trace-herb.com peer0.regulators.trace-herb.com

Write-Info "Waiting for Peers to start..."
Start-Sleep -Seconds 10

Set-Location ../..

# Step 7: Start CouchDB instances
Write-Step "Starting CouchDB instances..."

Set-Location blockchain/network
docker-compose up -d couchdb.farmers couchdb.processors couchdb.labs couchdb.regulators

Write-Info "Waiting for CouchDB instances to start..."
Start-Sleep -Seconds 15

Set-Location ../..

# Step 8: Create Channel
Write-Step "Creating blockchain channel..."

Set-Location blockchain

# Check if channel artifacts exist
if (!(Test-Path "channel-artifacts") -or $Clean) {
    Write-Info "Generating channel artifacts..."

    if (Test-Path "scripts/create-channel.sh") {
        # Run channel creation script (if exists)
        bash scripts/create-channel.sh
    } else {
        Write-Info "Channel creation will be handled by application"
    }
} else {
    Write-Success "Channel artifacts already exist"
}

Set-Location ..

# Step 9: Deploy Chaincode
Write-Step "Deploying chaincode..."

Set-Location blockchain

if (Test-Path "scripts/deploy-chaincode.sh") {
    Write-Info "Deploying herb-traceability chaincode..."
    bash scripts/deploy-chaincode.sh
} else {
    Write-Info "Chaincode deployment will be handled by application"
}

Set-Location ..

# Step 10: Verify Network Status
Write-Step "Verifying network status..."

# Check running containers
$containers = docker ps --format "table {{.Names}}\t{{.Status}}" | Where-Object { $_ -match "trace-herb" }

if ($containers) {
    Write-Success "Blockchain network containers are running:"
    $containers | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Warning "No blockchain containers found running"
}

# Step 11: Test Network Connectivity
Write-Step "Testing network connectivity..."

$networkEndpoints = @{
    "Farmers CA" = "https://localhost:7054/cainfo"
    "Processors CA" = "https://localhost:8054/cainfo"
    "Labs CA" = "https://localhost:9054/cainfo"
    "Regulators CA" = "https://localhost:10054/cainfo"
    "CouchDB Farmers" = "http://localhost:5984"
    "CouchDB Processors" = "http://localhost:7984"
    "CouchDB Labs" = "http://localhost:9984"
    "CouchDB Regulators" = "http://localhost:11984"
}

foreach ($endpoint in $networkEndpoints.GetEnumerator()) {
    try {
        if ($endpoint.Value -like "https://*") {
            $response = Invoke-WebRequest -Uri $endpoint.Value -SkipCertificateCheck -TimeoutSec 5 -ErrorAction SilentlyContinue
        } else {
            $response = Invoke-WebRequest -Uri $endpoint.Value -TimeoutSec 5 -ErrorAction SilentlyContinue
        }
        Write-Success "$($endpoint.Key) is accessible"
    } catch {
        Write-Warning "$($endpoint.Key) is not accessible"
    }
}

Write-Host ""
Write-Success "🎉 Full Hyperledger Fabric Network Setup Complete!"
Write-Host ""
Write-Info "Network Status:"
Write-Host "  • Certificate Authorities: Running on ports 7054, 8054, 9054, 10054"
Write-Host "  • Orderer: Running on port 7050"
Write-Host "  • Peers: Running on ports 7051, 9051, 11051, 13051"
Write-Host "  • CouchDB: Running on ports 5984, 7984, 9984, 11984"
Write-Host ""
Write-Info "Next Steps:"
Write-Host "  1. Start the backend service: npm run dev (in backend directory)"
Write-Host "  2. Start the frontend portals"
Write-Host "  3. The system will now connect to the full blockchain network"
Write-Host ""
Write-Warning "Note: The blockchain service will now run in FULL NETWORK mode instead of simulated mode!"
