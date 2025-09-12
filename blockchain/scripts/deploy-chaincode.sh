#!/bin/bash
#
# Deploy Chaincode Script for TRACE HERB Network
# This script packages, installs, approves, and commits the herb traceability chaincode
#

set -e

# Set environment variables
export FABRIC_CFG_PATH=${PWD}/../network
export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/../network/crypto-config/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem

CHANNEL_NAME="herb-channel"
CHAINCODE_NAME="herb-traceability"
CHAINCODE_VERSION="1.0"
CHAINCODE_SEQUENCE="1"
CC_RUNTIME_LANGUAGE="node"
CC_SRC_PATH="../chaincode"

echo "========== Deploying Chaincode: ${CHAINCODE_NAME} =========="

# Package the chaincode
echo "Packaging chaincode..."
peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz \
    --path ${CC_SRC_PATH} \
    --lang ${CC_RUNTIME_LANGUAGE} \
    --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION}

if [ "$?" -ne 0 ]; then
    echo "Failed to package chaincode"
    exit 1
fi

# Function to set peer environment variables
setGlobals() {
    local ORG=$1
    local PEER=$2
    
    if [ $ORG -eq 1 ]; then
        export CORE_PEER_LOCALMSPID="Org1MSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../network/crypto-config/peerOrganizations/org1.trace-herb.com/peers/peer${PEER}.org1.trace-herb.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${PWD}/../network/crypto-config/peerOrganizations/org1.trace-herb.com/users/Admin@org1.trace-herb.com/msp
        export CORE_PEER_ADDRESS=localhost:7051
    elif [ $ORG -eq 2 ]; then
        export CORE_PEER_LOCALMSPID="Org2MSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../network/crypto-config/peerOrganizations/org2.trace-herb.com/peers/peer${PEER}.org2.trace-herb.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${PWD}/../network/crypto-config/peerOrganizations/org2.trace-herb.com/users/Admin@org2.trace-herb.com/msp
        export CORE_PEER_ADDRESS=localhost:9051
    elif [ $ORG -eq 3 ]; then
        export CORE_PEER_LOCALMSPID="Org3MSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../network/crypto-config/peerOrganizations/org3.trace-herb.com/peers/peer${PEER}.org3.trace-herb.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${PWD}/../network/crypto-config/peerOrganizations/org3.trace-herb.com/users/Admin@org3.trace-herb.com/msp
        export CORE_PEER_ADDRESS=localhost:11051
    elif [ $ORG -eq 4 ]; then
        export CORE_PEER_LOCALMSPID="Org4MSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../network/crypto-config/peerOrganizations/org4.trace-herb.com/peers/peer${PEER}.org4.trace-herb.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${PWD}/../network/crypto-config/peerOrganizations/org4.trace-herb.com/users/Admin@org4.trace-herb.com/msp
        export CORE_PEER_ADDRESS=localhost:13051
    fi
}

# Install chaincode on all peers
echo "Installing chaincode on all peers..."

for org in 1 2 3 4; do
    setGlobals $org 0
    echo "Installing chaincode on peer0.org${org}..."
    
    peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
    if [ "$?" -ne 0 ]; then
        echo "Failed to install chaincode on peer0.org${org}"
        exit 1
    fi
done

# Query installed chaincode to get package ID
echo "Querying installed chaincode..."
setGlobals 1 0
peer lifecycle chaincode queryinstalled >&log.txt
PACKAGE_ID=$(sed -n "/${CHAINCODE_NAME}_${CHAINCODE_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
echo "Package ID: ${PACKAGE_ID}"

# Approve chaincode for all organizations
echo "Approving chaincode for all organizations..."

for org in 1 2 3 4; do
    setGlobals $org 0
    echo "Approving chaincode for Org${org}..."
    
    peer lifecycle chaincode approveformyorg \
        -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.trace-herb.com \
        --tls \
        --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME \
        --name $CHAINCODE_NAME \
        --version $CHAINCODE_VERSION \
        --package-id $PACKAGE_ID \
        --sequence $CHAINCODE_SEQUENCE
        
    if [ "$?" -ne 0 ]; then
        echo "Failed to approve chaincode for Org${org}"
        exit 1
    fi
done

# Check commit readiness
echo "Checking commit readiness..."
setGlobals 1 0
peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CHAINCODE_VERSION \
    --sequence $CHAINCODE_SEQUENCE \
    --output json

# Commit chaincode
echo "Committing chaincode..."
peer lifecycle chaincode commit \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.trace-herb.com \
    --tls \
    --cafile $ORDERER_CA \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/../network/crypto-config/peerOrganizations/org1.trace-herb.com/peers/peer0.org1.trace-herb.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/../network/crypto-config/peerOrganizations/org2.trace-herb.com/peers/peer0.org2.trace-herb.com/tls/ca.crt \
    --peerAddresses localhost:11051 \
    --tlsRootCertFiles ${PWD}/../network/crypto-config/peerOrganizations/org3.trace-herb.com/peers/peer0.org3.trace-herb.com/tls/ca.crt \
    --peerAddresses localhost:13051 \
    --tlsRootCertFiles ${PWD}/../network/crypto-config/peerOrganizations/org4.trace-herb.com/peers/peer0.org4.trace-herb.com/tls/ca.crt \
    --version $CHAINCODE_VERSION \
    --sequence $CHAINCODE_SEQUENCE

if [ "$?" -ne 0 ]; then
    echo "Failed to commit chaincode"
    exit 1
fi

# Query committed chaincode
echo "Querying committed chaincode..."
peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name $CHAINCODE_NAME

# Initialize the ledger
echo "Initializing ledger..."
peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.trace-herb.com \
    --tls \
    --cafile $ORDERER_CA \
    -C $CHANNEL_NAME \
    -n $CHAINCODE_NAME \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/../network/crypto-config/peerOrganizations/org1.trace-herb.com/peers/peer0.org1.trace-herb.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/../network/crypto-config/peerOrganizations/org2.trace-herb.com/peers/peer0.org2.trace-herb.com/tls/ca.crt \
    -c '{"function":"initLedger","Args":[]}'

if [ "$?" -ne 0 ]; then
    echo "Failed to initialize ledger"
    exit 1
fi

# Clean up
rm -f ${CHAINCODE_NAME}.tar.gz log.txt

echo "========== Chaincode Deployment Completed Successfully =========="
echo "Chaincode ${CHAINCODE_NAME} version ${CHAINCODE_VERSION} is now active on channel ${CHANNEL_NAME}"
