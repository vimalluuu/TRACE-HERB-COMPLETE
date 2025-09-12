#!/usr/bin/env powershell
#
# TRACE HERB Blockchain Network - Crypto Material Generation
# This script generates all necessary certificates and keys for the Hyperledger Fabric network
#

param(
    [switch]$CleanStart = $false
)

# Color definitions
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

# Test prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Success "Docker found: $dockerVersion"
    }
    catch {
        Write-Error "Docker not found. Please install Docker Desktop."
        exit 1
    }
    
    # Check if CAs are running
    $caContainers = docker ps --filter "name=ca." --format "table {{.Names}}\t{{.Status}}"
    if ($caContainers -match "Up") {
        Write-Success "Certificate Authorities are running"
    }
    else {
        Write-Error "Certificate Authorities are not running. Please start them first."
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Download Fabric binaries if not present
function Get-FabricBinaries {
    Write-Status "Checking Fabric binaries..."
    
    if (!(Test-Path "bin/fabric-ca-client.exe")) {
        Write-Status "Downloading Hyperledger Fabric binaries..."
        
        # Create bin directory
        if (!(Test-Path "bin")) {
            New-Item -ItemType Directory -Path "bin" -Force
        }
        
        # Download and extract Fabric binaries
        $fabricVersion = "2.4.9"
        $caVersion = "1.5.5"
        
        Write-Status "Downloading Fabric CA client..."
        Invoke-WebRequest -Uri "https://github.com/hyperledger/fabric-ca/releases/download/v$caVersion/hyperledger-fabric-ca-windows-amd64-$caVersion.tar.gz" -OutFile "fabric-ca.tar.gz"
        
        # Extract (you may need to install 7-zip or use another extraction method)
        Write-Status "Please extract fabric-ca.tar.gz to the bin directory manually"
        Write-Status "Or install fabric-ca-client using: go install github.com/hyperledger/fabric-ca/cmd/fabric-ca-client@latest"
    }
    
    Write-Success "Fabric binaries ready"
}

# Generate crypto material for an organization
function New-OrgCrypto {
    param(
        [string]$OrgName,
        [string]$OrgDomain,
        [int]$CAPort,
        [string]$MSPId
    )
    
    Write-Status "Generating crypto material for $OrgName..."
    
    $orgDir = "organizations/peerOrganizations/$OrgDomain"
    $caUrl = "https://localhost:$CAPort"
    
    # Set environment variables
    $env:FABRIC_CA_CLIENT_HOME = "$PWD/$orgDir"
    
    # Enroll CA admin
    Write-Status "Enrolling CA admin for $OrgName..."
    docker exec "ca.$OrgDomain" fabric-ca-client enroll -u https://admin:adminpw@ca.$OrgDomain`:$CAPort --caname ca-$($OrgName.ToLower()) --tls.certfiles /etc/hyperledger/fabric-ca-server/ca-cert.pem
    
    # Register peer
    Write-Status "Registering peer for $OrgName..."
    docker exec "ca.$OrgDomain" fabric-ca-client register --caname ca-$($OrgName.ToLower()) --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles /etc/hyperledger/fabric-ca-server/ca-cert.pem
    
    # Register user
    Write-Status "Registering user for $OrgName..."
    docker exec "ca.$OrgDomain" fabric-ca-client register --caname ca-$($OrgName.ToLower()) --id.name user1 --id.secret user1pw --id.type client --tls.certfiles /etc/hyperledger/fabric-ca-server/ca-cert.pem
    
    # Register admin
    Write-Status "Registering admin for $OrgName..."
    docker exec "ca.$OrgDomain" fabric-ca-client register --caname ca-$($OrgName.ToLower()) --id.name org1admin --id.secret org1adminpw --id.type admin --tls.certfiles /etc/hyperledger/fabric-ca-server/ca-cert.pem
    
    # Generate peer MSP
    Write-Status "Generating peer MSP for $OrgName..."
    $peerDir = "$orgDir/peers/peer0.$OrgDomain"
    
    # Create directories
    New-Item -ItemType Directory -Path "$peerDir/msp" -Force
    New-Item -ItemType Directory -Path "$peerDir/tls" -Force
    
    # Enroll peer
    docker exec "ca.$OrgDomain" fabric-ca-client enroll -u https://peer0:peer0pw@ca.$OrgDomain`:$CAPort --caname ca-$($OrgName.ToLower()) -M /etc/hyperledger/fabric-ca-server/peer0-msp --tls.certfiles /etc/hyperledger/fabric-ca-server/ca-cert.pem
    
    # Copy peer MSP to host
    docker cp "ca.$OrgDomain":/etc/hyperledger/fabric-ca-server/peer0-msp/. "$peerDir/msp/"
    
    # Generate TLS certificates for peer
    docker exec "ca.$OrgDomain" fabric-ca-client enroll -u https://peer0:peer0pw@ca.$OrgDomain`:$CAPort --caname ca-$($OrgName.ToLower()) -M /etc/hyperledger/fabric-ca-server/peer0-tls --enrollment.profile tls --csr.hosts peer0.$OrgDomain --csr.hosts localhost --tls.certfiles /etc/hyperledger/fabric-ca-server/ca-cert.pem
    
    # Copy TLS certificates
    docker cp "ca.$OrgDomain":/etc/hyperledger/fabric-ca-server/peer0-tls/. "$peerDir/tls/"
    
    Write-Success "Crypto material generated for $OrgName"
}

# Generate orderer crypto material
function New-OrdererCrypto {
    Write-Status "Generating orderer crypto material..."
    
    $ordererDir = "organizations/ordererOrganizations/trace-herb.com"
    
    # Create directories
    New-Item -ItemType Directory -Path "$ordererDir/orderers/orderer.trace-herb.com/msp" -Force
    New-Item -ItemType Directory -Path "$ordererDir/orderers/orderer.trace-herb.com/tls" -Force
    
    # Use farmers CA to generate orderer certificates (or create separate orderer CA)
    docker exec "ca.farmers.trace-herb.com" fabric-ca-client register --caname ca-farmers --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles /etc/hyperledger/fabric-ca-server/ca-cert.pem
    
    # Enroll orderer
    docker exec "ca.farmers.trace-herb.com" fabric-ca-client enroll -u https://orderer:ordererpw@ca.farmers.trace-herb.com:7054 --caname ca-farmers -M /etc/hyperledger/fabric-ca-server/orderer-msp --tls.certfiles /etc/hyperledger/fabric-ca-server/ca-cert.pem
    
    # Copy orderer MSP
    docker cp "ca.farmers.trace-herb.com":/etc/hyperledger/fabric-ca-server/orderer-msp/. "$ordererDir/orderers/orderer.trace-herb.com/msp/"
    
    # Generate TLS for orderer
    docker exec "ca.farmers.trace-herb.com" fabric-ca-client enroll -u https://orderer:ordererpw@ca.farmers.trace-herb.com:7054 --caname ca-farmers -M /etc/hyperledger/fabric-ca-server/orderer-tls --enrollment.profile tls --csr.hosts orderer.trace-herb.com --csr.hosts localhost --tls.certfiles /etc/hyperledger/fabric-ca-server/ca-cert.pem
    
    # Copy TLS certificates
    docker cp "ca.farmers.trace-herb.com":/etc/hyperledger/fabric-ca-server/orderer-tls/. "$ordererDir/orderers/orderer.trace-herb.com/tls/"
    
    Write-Success "Orderer crypto material generated"
}

# Main execution
function Main {
    Write-Status "🔐 Starting TRACE HERB Crypto Material Generation"
    Write-Host "=================================================" -ForegroundColor $Blue
    
    Test-Prerequisites
    Get-FabricBinaries
    
    # Generate crypto for all organizations
    New-OrgCrypto -OrgName "Farmers" -OrgDomain "farmers.trace-herb.com" -CAPort 7054 -MSPId "FarmersMSP"
    New-OrgCrypto -OrgName "Processors" -OrgDomain "processors.trace-herb.com" -CAPort 8054 -MSPId "ProcessorsMSP"
    New-OrgCrypto -OrgName "Labs" -OrgDomain "labs.trace-herb.com" -CAPort 9054 -MSPId "LabsMSP"
    New-OrgCrypto -OrgName "Regulators" -OrgDomain "regulators.trace-herb.com" -CAPort 10054 -MSPId "RegulatorsMSP"
    
    # Generate orderer crypto
    New-OrdererCrypto
    
    Write-Success "🎉 All crypto material generated successfully!"
    Write-Status "You can now start the blockchain network with peers and orderer"
}

# Run main function
try {
    Main
}
catch {
    Write-Error "Crypto generation failed: $($_.Exception.Message)"
    Write-Status "Check that Certificate Authorities are running and try again"
    exit 1
}
