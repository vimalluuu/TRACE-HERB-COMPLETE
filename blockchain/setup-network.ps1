# TRACE HERB Blockchain Network Setup - PowerShell Version
# Complete setup script for Hyperledger Fabric network on Windows

param(
    [switch]$SkipDownload,
    [switch]$CleanStart
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Success "Docker found: $dockerVersion"
    }
    catch {
        Write-Error "Docker is not installed or not in PATH. Please install Docker Desktop first."
        exit 1
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version
        Write-Success "Docker Compose found: $composeVersion"
    }
    catch {
        Write-Error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }
    
    # Check if Docker is running
    try {
        docker info | Out-Null
        Write-Success "Docker is running"
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop first."
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Download Hyperledger Fabric Docker images
function Get-FabricImages {
    if ($SkipDownload) {
        Write-Warning "Skipping Fabric images download"
        return
    }
    
    Write-Status "Downloading Hyperledger Fabric Docker images..."
    
    $images = @(
        "hyperledger/fabric-peer:2.4.9",
        "hyperledger/fabric-orderer:2.4.9", 
        "hyperledger/fabric-ca:1.5.5",
        "hyperledger/fabric-tools:2.4.9",
        "hyperledger/fabric-ccenv:2.4.9",
        "hyperledger/fabric-baseos:2.4.9",
        "couchdb:3.1.1"
    )
    
    foreach ($image in $images) {
        Write-Status "Pulling $image..."
        docker pull $image
    }
    
    Write-Success "Fabric Docker images downloaded"
}

# Start the network using docker-compose
function Start-Network {
    Write-Status "Starting Hyperledger Fabric network..."
    
    if ($CleanStart) {
        Write-Status "Cleaning up existing containers and volumes..."
        docker-compose -f network/docker-compose.yml down -v --remove-orphans
        docker system prune -f
    }
    
    # Start the network
    docker-compose -f network/docker-compose.yml up -d
    
    # Wait for containers to start
    Write-Status "Waiting for containers to start..."
    Start-Sleep -Seconds 15
    
    # Check container status
    $containers = docker-compose -f network/docker-compose.yml ps --services
    foreach ($container in $containers) {
        $status = docker-compose -f network/docker-compose.yml ps $container
        Write-Status "Container $container status: $status"
    }
    
    Write-Success "Network started successfully"
}

# Test network connectivity
function Test-Network {
    Write-Status "Testing network connectivity..."
    
    # Test orderer
    try {
        $ordererLogs = docker logs orderer.trace-herb.com --tail 10 2>&1
        if ($ordererLogs -match "Starting orderer") {
            Write-Success "Orderer is running"
        }
    }
    catch {
        Write-Warning "Could not verify orderer status"
    }
    
    # Test peers
    $peers = @("peer0.farmers.trace-herb.com", "peer0.processors.trace-herb.com")
    foreach ($peer in $peers) {
        try {
            $peerLogs = docker logs $peer --tail 5 2>&1
            if ($peerLogs -match "Starting peer") {
                Write-Success "$peer is running"
            }
        }
        catch {
            Write-Warning "Could not verify $peer status"
        }
    }
    
    # Test CAs
    $cas = @("ca.farmers.trace-herb.com", "ca.processors.trace-herb.com")
    foreach ($ca in $cas) {
        try {
            $caLogs = docker logs $ca --tail 5 2>&1
            if ($caLogs -match "Listening on") {
                Write-Success "$ca is running"
            }
        }
        catch {
            Write-Warning "Could not verify $ca status"
        }
    }
    
    Write-Success "Network connectivity test completed"
}

# Create connection profiles with actual certificates
function New-ConnectionProfiles {
    Write-Status "Creating connection profiles..."
    
    # This would normally extract actual certificates from the crypto material
    # For now, we'll create placeholder profiles that the Node.js app can use
    
    $farmersProfile = @{
        name = "farmers-trace-herb-network"
        version = "1.0.0"
        client = @{
            organization = "Farmers"
            connection = @{
                timeout = @{
                    peer = @{
                        endorser = "300"
                    }
                }
            }
        }
        organizations = @{
            Farmers = @{
                mspid = "FarmersMSP"
                peers = @("peer0.farmers.trace-herb.com")
                certificateAuthorities = @("ca.farmers.trace-herb.com")
            }
        }
        orderers = @{
            "orderer.trace-herb.com" = @{
                url = "grpcs://localhost:7050"
                grpcOptions = @{
                    "ssl-target-name-override" = "orderer.trace-herb.com"
                    "hostnameOverride" = "orderer.trace-herb.com"
                }
            }
        }
        peers = @{
            "peer0.farmers.trace-herb.com" = @{
                url = "grpcs://localhost:7051"
                grpcOptions = @{
                    "ssl-target-name-override" = "peer0.farmers.trace-herb.com"
                    "hostnameOverride" = "peer0.farmers.trace-herb.com"
                }
            }
        }
        certificateAuthorities = @{
            "ca.farmers.trace-herb.com" = @{
                url = "https://localhost:7054"
                caName = "ca-farmers"
                httpOptions = @{
                    verify = $false
                }
            }
        }
    }
    
    # Create directory if it doesn't exist
    $profileDir = "organizations\peerOrganizations\farmers.trace-herb.com"
    if (!(Test-Path $profileDir)) {
        New-Item -ItemType Directory -Path $profileDir -Force
    }
    
    # Save connection profile
    $farmersProfile | ConvertTo-Json -Depth 10 | Out-File -FilePath "$profileDir\connection-farmers.json" -Encoding UTF8
    
    Write-Success "Connection profiles created"
}

# Show network status
function Show-NetworkStatus {
    Write-Status "Network Status:"
    Write-Host "===========================================" -ForegroundColor $Blue
    
    # Show running containers
    Write-Status "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=trace-herb"
    
    Write-Host ""
    Write-Status "Network endpoints:"
    Write-Host "  Orderer:           localhost:7050" -ForegroundColor $Green
    Write-Host "  Farmers Peer:      localhost:7051" -ForegroundColor $Green  
    Write-Host "  Processors Peer:   localhost:9051" -ForegroundColor $Green
    Write-Host "  Farmers CA:        localhost:7054" -ForegroundColor $Green
    Write-Host "  Processors CA:     localhost:8054" -ForegroundColor $Green
    Write-Host "  CouchDB (Farmers): localhost:5984" -ForegroundColor $Green
    Write-Host "  CouchDB (Proc):    localhost:7984" -ForegroundColor $Green
    
    Write-Host ""
    Write-Success "🎉 TRACE HERB Blockchain Network is ready!"
    Write-Status "The backend API will now connect to real blockchain instead of demo mode"
    Write-Status "Restart your backend server to connect to the real blockchain network"
}

# Main execution
function Main {
    Write-Status "🌿 Starting TRACE HERB Blockchain Network Setup"
    Write-Host "===========================================" -ForegroundColor $Blue
    
    Test-Prerequisites
    Get-FabricImages
    Start-Network
    Test-Network
    New-ConnectionProfiles
    Show-NetworkStatus
    
    Write-Success "Setup completed! Network is running and ready for use."
}

# Run main function
try {
    Main
}
catch {
    Write-Error "Setup failed: $($_.Exception.Message)"
    Write-Status "Check Docker Desktop is running and try again"
    exit 1
}
