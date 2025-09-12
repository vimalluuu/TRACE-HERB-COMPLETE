#!/bin/bash
#
# TRACE HERB Blockchain Network Startup Script
# This script starts the Hyperledger Fabric network for herb traceability
#

set -e

# Set environment variables
export FABRIC_CFG_PATH=${PWD}/network
export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/network/crypto-config/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem

echo "========== Starting TRACE HERB Blockchain Network =========="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Clean up any existing containers
echo "Cleaning up existing containers..."
docker-compose -f ../docker-compose.yml down --volumes --remove-orphans

# Remove any existing network artifacts
echo "Cleaning up network artifacts..."
rm -rf ../network/channel-artifacts/*
rm -rf ../network/crypto-config/*

# Generate crypto material
echo "Generating crypto material..."
cd ../network
cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
    echo "Failed to generate crypto material"
    exit 1
fi

# Create channel artifacts directory
mkdir -p channel-artifacts

# Generate genesis block
echo "Generating genesis block..."
configtxgen -profile TraceHerbOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block
if [ "$?" -ne 0 ]; then
    echo "Failed to generate genesis block"
    exit 1
fi

# Generate channel configuration transaction
echo "Generating channel configuration transaction..."
configtxgen -profile TraceHerbChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID herb-channel
if [ "$?" -ne 0 ]; then
    echo "Failed to generate channel configuration transaction"
    exit 1
fi

# Generate anchor peer transactions
echo "Generating anchor peer transactions..."
configtxgen -profile TraceHerbChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID herb-channel -asOrg Org1MSP
configtxgen -profile TraceHerbChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID herb-channel -asOrg Org2MSP
configtxgen -profile TraceHerbChannel -outputAnchorPeersUpdate ./channel-artifacts/Org3MSPanchors.tx -channelID herb-channel -asOrg Org3MSP
configtxgen -profile TraceHerbChannel -outputAnchorPeersUpdate ./channel-artifacts/Org4MSPanchors.tx -channelID herb-channel -asOrg Org4MSP

# Start the network
echo "Starting blockchain network..."
cd ..
docker-compose up -d

# Wait for containers to start
echo "Waiting for containers to start..."
sleep 30

# Check if containers are running
echo "Checking container status..."
docker-compose ps

# Create channel
echo "Creating channel..."
cd scripts
./create-channel.sh

# Join peers to channel
echo "Joining peers to channel..."
./join-channel.sh

# Update anchor peers
echo "Updating anchor peers..."
./update-anchor-peers.sh

# Install and instantiate chaincode
echo "Installing and instantiating chaincode..."
./deploy-chaincode.sh

echo "========== TRACE HERB Blockchain Network Started Successfully =========="
echo "Network is ready for use!"
echo ""
echo "Available services:"
echo "- Orderer: localhost:7050"
echo "- Org1 Peer0: localhost:7051"
echo "- Org2 Peer0: localhost:9051"
echo "- Org3 Peer0: localhost:11051"
echo "- Org4 Peer0: localhost:13051"
echo "- CouchDB: localhost:5984"
echo ""
echo "To stop the network, run: ./stop-network.sh"
