#!/bin/bash
#
# TRACE HERB - Full Chaincode Deployment Script
# This script deploys chaincode to the full Hyperledger Fabric network
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

function print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

function print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

function print_error() {
    echo -e "${RED}❌ $1${NC}"
}

function print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

echo "🚀 TRACE HERB - Full Chaincode Deployment"
echo "========================================"

# Set environment variables
export FABRIC_CFG_PATH=${PWD}/../network
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="FarmersMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/users/Admin@farmers.trace-herb.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Chaincode details
CC_NAME="herb-traceability"
CC_VERSION="1.0"
CC_SEQUENCE="1"
CC_INIT_FCN="initLedger"
CC_END_POLICY="AND('FarmersMSP.peer','ProcessorsMSP.peer')"
CC_COLL_CONFIG=""
CHANNEL_NAME="herb-channel"
DELAY="3"
MAX_RETRY="5"
VERBOSE="false"

print_step "Step 1: Package chaincode..."

# Navigate to chaincode directory
cd ../chaincode

# Package the chaincode
peer lifecycle chaincode package ${CC_NAME}.tar.gz \
    --path . \
    --lang node \
    --label ${CC_NAME}_${CC_VERSION}

if [ $? -eq 0 ]; then
    print_success "Chaincode packaged successfully"
else
    print_error "Failed to package chaincode"
    exit 1
fi

print_step "Step 2: Install chaincode on Farmers peer..."

# Install on Farmers peer
export CORE_PEER_LOCALMSPID="FarmersMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/users/Admin@farmers.trace-herb.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode install ${CC_NAME}.tar.gz

if [ $? -eq 0 ]; then
    print_success "Chaincode installed on Farmers peer"
else
    print_error "Failed to install chaincode on Farmers peer"
    exit 1
fi

print_step "Step 3: Install chaincode on Processors peer..."

# Install on Processors peer
export CORE_PEER_LOCALMSPID="ProcessorsMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/processors.trace-herb.com/users/Admin@processors.trace-herb.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode install ${CC_NAME}.tar.gz

if [ $? -eq 0 ]; then
    print_success "Chaincode installed on Processors peer"
else
    print_error "Failed to install chaincode on Processors peer"
    exit 1
fi

print_step "Step 4: Install chaincode on Labs peer..."

# Install on Labs peer
export CORE_PEER_LOCALMSPID="LabsMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../organizations/peerOrganizations/labs.trace-herb.com/peers/peer0.labs.trace-herb.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/labs.trace-herb.com/users/Admin@labs.trace-herb.com/msp
export CORE_PEER_ADDRESS=localhost:11051

peer lifecycle chaincode install ${CC_NAME}.tar.gz

if [ $? -eq 0 ]; then
    print_success "Chaincode installed on Labs peer"
else
    print_error "Failed to install chaincode on Labs peer"
    exit 1
fi

print_step "Step 5: Install chaincode on Regulators peer..."

# Install on Regulators peer
export CORE_PEER_LOCALMSPID="RegulatorsMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../organizations/peerOrganizations/regulators.trace-herb.com/peers/peer0.regulators.trace-herb.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/regulators.trace-herb.com/users/Admin@regulators.trace-herb.com/msp
export CORE_PEER_ADDRESS=localhost:13051

peer lifecycle chaincode install ${CC_NAME}.tar.gz

if [ $? -eq 0 ]; then
    print_success "Chaincode installed on Regulators peer"
else
    print_error "Failed to install chaincode on Regulators peer"
    exit 1
fi

print_step "Step 6: Query installed chaincode..."

# Query installed chaincode to get package ID
export CORE_PEER_LOCALMSPID="FarmersMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/users/Admin@farmers.trace-herb.com/msp
export CORE_PEER_ADDRESS=localhost:7051

CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r ".installed_chaincodes[0].package_id")

if [ -z "$CC_PACKAGE_ID" ]; then
    print_error "Failed to get chaincode package ID"
    exit 1
fi

print_success "Chaincode package ID: $CC_PACKAGE_ID"

print_step "Step 7: Approve chaincode for Farmers org..."

# Approve for Farmers
peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.trace-herb.com \
    --tls \
    --cafile ${PWD}/../organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $CC_PACKAGE_ID \
    --sequence $CC_SEQUENCE \
    --init-required

if [ $? -eq 0 ]; then
    print_success "Chaincode approved for Farmers org"
else
    print_error "Failed to approve chaincode for Farmers org"
    exit 1
fi

print_step "Step 8: Approve chaincode for Processors org..."

# Approve for Processors
export CORE_PEER_LOCALMSPID="ProcessorsMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/processors.trace-herb.com/users/Admin@processors.trace-herb.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.trace-herb.com \
    --tls \
    --cafile ${PWD}/../organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $CC_PACKAGE_ID \
    --sequence $CC_SEQUENCE \
    --init-required

if [ $? -eq 0 ]; then
    print_success "Chaincode approved for Processors org"
else
    print_error "Failed to approve chaincode for Processors org"
    exit 1
fi

print_step "Step 9: Check commit readiness..."

# Check commit readiness
export CORE_PEER_LOCALMSPID="FarmersMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/users/Admin@farmers.trace-herb.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --init-required \
    --output json

print_step "Step 10: Commit chaincode..."

# Commit chaincode
peer lifecycle chaincode commit \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.trace-herb.com \
    --tls \
    --cafile ${PWD}/../organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/../organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/ca.crt \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --init-required

if [ $? -eq 0 ]; then
    print_success "Chaincode committed successfully"
else
    print_error "Failed to commit chaincode"
    exit 1
fi

print_step "Step 11: Initialize chaincode..."

# Initialize chaincode
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.trace-herb.com \
    --tls \
    --cafile ${PWD}/../organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem \
    -C $CHANNEL_NAME \
    -n $CC_NAME \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/../organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/../organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/ca.crt \
    --isInit \
    -c '{"function":"initLedger","Args":[]}'

if [ $? -eq 0 ]; then
    print_success "Chaincode initialized successfully"
else
    print_error "Failed to initialize chaincode"
    exit 1
fi

print_step "Step 12: Test chaincode..."

# Test chaincode
peer chaincode query \
    -C $CHANNEL_NAME \
    -n $CC_NAME \
    -c '{"function":"GetNetworkInfo","Args":[]}'

if [ $? -eq 0 ]; then
    print_success "Chaincode is responding correctly"
else
    print_warning "Chaincode test query failed, but deployment may still be successful"
fi

echo ""
print_success "🎉 Full Chaincode Deployment Complete!"
echo ""
print_info "Chaincode Details:"
echo "  • Name: $CC_NAME"
echo "  • Version: $CC_VERSION"
echo "  • Channel: $CHANNEL_NAME"
echo "  • Package ID: $CC_PACKAGE_ID"
echo ""
print_info "The chaincode is now deployed and ready for use in the full network!"
