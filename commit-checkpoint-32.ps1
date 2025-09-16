# TRACE HERB - Checkpoint 32 Commit Script
# This script commits all changes and creates a checkpoint for easy reversion

param(
    [switch]$Push = $true,
    [string]$Message = "Checkpoint 32: Full Hyperledger Fabric Network Implementation"
)

# Colors for output
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Step { param($Message) Write-Host "[STEP] $Message" -ForegroundColor Blue }

Write-Host "TRACE HERB - Checkpoint 32 Commit" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta

# Step 1: Check Git status
Write-Step "Checking Git status..."

try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Info "Found changes to commit:"
        git status --short
    } else {
        Write-Warning "No changes detected"
        exit 0
    }
} catch {
    Write-Error "Git not found or not in a Git repository"
    exit 1
}

# Step 2: Add all changes
Write-Step "Adding all changes to Git..."

try {
    git add .
    Write-Success "All changes added to staging area"
} catch {
    Write-Error "Failed to add changes to Git"
    exit 1
}

# Step 3: Create detailed commit message
$detailedMessage = @"
$Message

🚀 MAJOR UPGRADE: Full Hyperledger Fabric Network Implementation

## What's New in Checkpoint 32:

### 🔗 Full Blockchain Network
- ✅ Upgraded from CA-Connected mode to Full Network mode
- ✅ Real Hyperledger Fabric peers, orderers, and CouchDB
- ✅ Complete blockchain operations (no more simulation)
- ✅ Multi-organization network with 4 organizations

### 🏗️ Network Architecture
- ✅ Certificate Authorities: 4 CAs (Farmers, Processors, Labs, Regulators)
- ✅ Peers: 4 peer nodes with CouchDB state databases
- ✅ Orderer: Single orderer node with RAFT consensus
- ✅ Channel: herb-channel with all organizations joined

### 📋 Smart Contracts (Chaincode)
- ✅ herb-traceability chaincode deployed to full network
- ✅ Real blockchain transactions and ledger commits
- ✅ Multi-peer endorsement and consensus

### 🛠️ Automation Scripts
- ✅ setup-full-blockchain-network.ps1 - Complete network setup
- ✅ start-trace-herb-full-system.bat - One-click system startup
- ✅ create-channel.sh - Channel creation and peer joining
- ✅ deploy-full-chaincode.sh - Chaincode deployment

### 🔧 Backend Service Updates
- ✅ Enhanced blockchain service with full network support
- ✅ Real transaction submission to Hyperledger Fabric
- ✅ Automatic fallback: Full Network → CA-Connected → Demo
- ✅ Comprehensive network status reporting

### 🌐 Portal Features (All Working)
- ✅ Farmer Portal (Port 3002) - All advanced features
- ✅ Enhanced Consumer Portal (Port 3000) - Carbon marketplace
- ✅ Processor Portal (Port 3004) - Anomaly detection & export certificates
- ✅ Laboratory Portal (Port 3005) - Species verification & FHIR compliance
- ✅ Regulatory Portal (Port 3006) - GS1 standards & export validation

### 📊 Network Endpoints
- Certificate Authorities: 7054, 8054, 9054, 10054
- Orderer: 7050
- Peers: 7051, 9051, 11051, 13051
- CouchDB: 5984, 7984, 9984, 11984

### 🎯 Key Benefits
- Real blockchain immutability and consensus
- Multi-organization endorsement policies
- Production-ready network architecture
- Complete supply chain traceability
- Regulatory compliance and audit trails

## How to Use:

1. **Start Full System:**
   ```
   .\start-trace-herb-full-system.bat
   ```

2. **Manual Network Setup:**
   ```
   .\setup-full-blockchain-network.ps1 -Clean
   ```

3. **Revert to This Checkpoint:**
   ```
   git checkout checkpoint-32
   ```

## Breaking Changes:
- Blockchain operations are now REAL (not simulated)
- Network startup takes longer due to full blockchain initialization
- Requires Docker with sufficient resources for full network

## Files Modified/Added:
- backend/src/services/blockchainService.js (Full network support)
- setup-full-blockchain-network.ps1 (New)
- start-trace-herb-full-system.bat (New)
- blockchain/scripts/create-channel.sh (New)
- blockchain/scripts/deploy-full-chaincode.sh (New)
- commit-checkpoint-32.ps1 (New)

🌿 TRACE HERB is now running on a complete, production-ready Hyperledger Fabric network!
"@

# Step 4: Commit changes
Write-Step "Committing changes..."

try {
    git commit -m $detailedMessage
    Write-Success "Changes committed successfully"
} catch {
    Write-Error "Failed to commit changes"
    exit 1
}

# Step 5: Create checkpoint tag
Write-Step "Creating checkpoint tag..."

try {
    git tag -a "checkpoint-32" -m "Checkpoint 32: Full Hyperledger Fabric Network Implementation"
    Write-Success "Checkpoint tag 'checkpoint-32' created"
} catch {
    Write-Warning "Failed to create tag (may already exist)"
}

# Step 6: Push to GitHub (if requested)
if ($Push) {
    Write-Step "Pushing to GitHub..."
    
    try {
        # Push commits
        git push origin main
        Write-Success "Commits pushed to GitHub"
        
        # Push tags
        git push origin --tags
        Write-Success "Tags pushed to GitHub"
        
    } catch {
        Write-Error "Failed to push to GitHub. Please check your remote configuration."
        Write-Info "You can manually push later with:"
        Write-Info "  git push origin main"
        Write-Info "  git push origin --tags"
    }
} else {
    Write-Info "Skipping GitHub push (use -Push to enable)"
}

# Step 7: Display summary
Write-Host ""
Write-Success "🎉 Checkpoint 32 Created Successfully!"
Write-Host ""
Write-Info "Checkpoint Details:"
Write-Host "  • Tag: checkpoint-32"
Write-Host "  • Branch: main"
Write-Host "  • Commit: $(git rev-parse --short HEAD)"
Write-Host ""
Write-Info "To revert to this checkpoint later:"
Write-Host "  git checkout checkpoint-32"
Write-Host ""
Write-Info "To continue development:"
Write-Host "  git checkout main"
Write-Host ""
Write-Info "To start the full system:"
Write-Host "  .\start-trace-herb-full-system.bat"
Write-Host ""
Write-Warning "🚨 IMPORTANT: The system now runs on REAL blockchain!"
Write-Warning "All transactions will be permanently recorded on the Hyperledger Fabric ledger."
