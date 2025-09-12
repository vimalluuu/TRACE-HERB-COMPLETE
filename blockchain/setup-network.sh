#!/bin/bash
#
# TRACE HERB Blockchain Network Setup
# Complete setup script for Hyperledger Fabric network
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Download Hyperledger Fabric binaries and Docker images
download_fabric() {
    print_status "Downloading Hyperledger Fabric binaries and Docker images..."
    
    # Create bin directory if it doesn't exist
    mkdir -p bin
    
    # Download Fabric binaries (if not already present)
    if [ ! -f "bin/peer" ]; then
        print_status "Downloading Fabric binaries..."
        curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.4.9 1.5.5 -s -b
        
        # Move binaries to bin directory
        if [ -d "fabric-samples/bin" ]; then
            cp fabric-samples/bin/* bin/
            rm -rf fabric-samples
        fi
    else
        print_success "Fabric binaries already present"
    fi
    
    # Download Docker images
    print_status "Pulling Hyperledger Fabric Docker images..."
    docker pull hyperledger/fabric-peer:2.4.9
    docker pull hyperledger/fabric-orderer:2.4.9
    docker pull hyperledger/fabric-ca:1.5.5
    docker pull hyperledger/fabric-tools:2.4.9
    docker pull hyperledger/fabric-ccenv:2.4.9
    docker pull hyperledger/fabric-baseos:2.4.9
    docker pull couchdb:3.1.1
    
    print_success "Fabric binaries and images downloaded"
}

# Generate crypto material
generate_crypto() {
    print_status "Generating crypto material..."
    
    # Create organizations directory structure
    mkdir -p organizations/peerOrganizations
    mkdir -p organizations/ordererOrganizations
    mkdir -p organizations/cryptogen
    
    # Create crypto-config files for each organization
    create_crypto_configs
    
    # Generate crypto material using cryptogen
    ./bin/cryptogen generate --config=organizations/cryptogen/crypto-config-farmers.yaml --output="organizations"
    ./bin/cryptogen generate --config=organizations/cryptogen/crypto-config-processors.yaml --output="organizations"
    ./bin/cryptogen generate --config=organizations/cryptogen/crypto-config-labs.yaml --output="organizations"
    ./bin/cryptogen generate --config=organizations/cryptogen/crypto-config-regulators.yaml --output="organizations"
    ./bin/cryptogen generate --config=organizations/cryptogen/crypto-config-orderer.yaml --output="organizations"
    
    print_success "Crypto material generated"
}

# Create crypto-config files
create_crypto_configs() {
    print_status "Creating crypto-config files..."
    
    # Farmers org crypto config
    cat > organizations/cryptogen/crypto-config-farmers.yaml << EOF
OrdererOrgs:

PeerOrgs:
  - Name: Farmers
    Domain: farmers.trace-herb.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1
EOF

    # Processors org crypto config
    cat > organizations/cryptogen/crypto-config-processors.yaml << EOF
OrdererOrgs:

PeerOrgs:
  - Name: Processors
    Domain: processors.trace-herb.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1
EOF

    # Labs org crypto config
    cat > organizations/cryptogen/crypto-config-labs.yaml << EOF
OrdererOrgs:

PeerOrgs:
  - Name: Labs
    Domain: labs.trace-herb.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1
EOF

    # Regulators org crypto config
    cat > organizations/cryptogen/crypto-config-regulators.yaml << EOF
OrdererOrgs:

PeerOrgs:
  - Name: Regulators
    Domain: regulators.trace-herb.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1
EOF

    # Orderer org crypto config
    cat > organizations/cryptogen/crypto-config-orderer.yaml << EOF
OrdererOrgs:
  - Name: OrdererOrg
    Domain: trace-herb.com
    EnableNodeOUs: true
    Specs:
      - Hostname: orderer
        SANS:
          - localhost

PeerOrgs:
EOF

    print_success "Crypto-config files created"
}

# Create configtx.yaml
create_configtx() {
    print_status "Creating configtx.yaml..."
    
    cat > configtx.yaml << EOF
Organizations:
    - &OrdererOrg
        Name: OrdererOrg
        ID: OrdererMSP
        MSPDir: organizations/ordererOrganizations/trace-herb.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('OrdererMSP.member')"
            Writers:
                Type: Signature
                Rule: "OR('OrdererMSP.member')"
            Admins:
                Type: Signature
                Rule: "OR('OrdererMSP.admin')"
        OrdererEndpoints:
            - orderer.trace-herb.com:7050

    - &Farmers
        Name: FarmersMSP
        ID: FarmersMSP
        MSPDir: organizations/peerOrganizations/farmers.trace-herb.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('FarmersMSP.admin', 'FarmersMSP.peer', 'FarmersMSP.client')"
            Writers:
                Type: Signature
                Rule: "OR('FarmersMSP.admin', 'FarmersMSP.client')"
            Admins:
                Type: Signature
                Rule: "OR('FarmersMSP.admin')"
            Endorsement:
                Type: Signature
                Rule: "OR('FarmersMSP.peer')"
        AnchorPeers:
            - Host: peer0.farmers.trace-herb.com
              Port: 7051

    - &Processors
        Name: ProcessorsMSP
        ID: ProcessorsMSP
        MSPDir: organizations/peerOrganizations/processors.trace-herb.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('ProcessorsMSP.admin', 'ProcessorsMSP.peer', 'ProcessorsMSP.client')"
            Writers:
                Type: Signature
                Rule: "OR('ProcessorsMSP.admin', 'ProcessorsMSP.client')"
            Admins:
                Type: Signature
                Rule: "OR('ProcessorsMSP.admin')"
            Endorsement:
                Type: Signature
                Rule: "OR('ProcessorsMSP.peer')"
        AnchorPeers:
            - Host: peer0.processors.trace-herb.com
              Port: 9051

Capabilities:
    Channel: &ChannelCapabilities
        V2_0: true
    Orderer: &OrdererCapabilities
        V2_0: true
    Application: &ApplicationCapabilities
        V2_0: true

Application: &ApplicationDefaults
    Organizations:
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
        LifecycleEndorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
        Endorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
    Capabilities:
        <<: *ApplicationCapabilities

Orderer: &OrdererDefaults
    OrdererType: etcdraft
    Addresses:
        - orderer.trace-herb.com:7050
    EtcdRaft:
        Consenters:
        - Host: orderer.trace-herb.com
          Port: 7050
          ClientTLSCert: organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/tls/server.crt
          ServerTLSCert: organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/tls/server.crt
    BatchTimeout: 2s
    BatchSize:
        MaxMessageCount: 10
        AbsoluteMaxBytes: 99 MB
        PreferredMaxBytes: 512 KB
    Organizations:
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
        BlockValidation:
            Type: ImplicitMeta
            Rule: "ANY Writers"

Channel: &ChannelDefaults
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
    Capabilities:
        <<: *ChannelCapabilities

Profiles:
    HerbOrdererGenesis:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            Organizations:
                - *OrdererOrg
            Capabilities:
                <<: *OrdererCapabilities
        Consortiums:
            HerbConsortium:
                Organizations:
                    - *Farmers
                    - *Processors

    HerbChannel:
        Consortium: HerbConsortium
        <<: *ChannelDefaults
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - *Farmers
                - *Processors
            Capabilities:
                <<: *ApplicationCapabilities
EOF

    print_success "configtx.yaml created"
}

# Generate genesis block and channel artifacts
generate_artifacts() {
    print_status "Generating genesis block and channel artifacts..."
    
    mkdir -p system-genesis-block
    mkdir -p channel-artifacts
    
    # Set configtx path
    export FABRIC_CFG_PATH=${PWD}
    
    # Generate genesis block
    ./bin/configtxgen -profile HerbOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block
    
    # Generate channel creation transaction
    ./bin/configtxgen -profile HerbChannel -outputCreateChannelTx ./channel-artifacts/herb-channel.tx -channelID herb-channel
    
    # Generate anchor peer transactions
    ./bin/configtxgen -profile HerbChannel -outputAnchorPeersUpdate ./channel-artifacts/FarmersMSPanchors.tx -channelID herb-channel -asOrg FarmersMSP
    ./bin/configtxgen -profile HerbChannel -outputAnchorPeersUpdate ./channel-artifacts/ProcessorsMSPanchors.tx -channelID herb-channel -asOrg ProcessorsMSP
    
    print_success "Genesis block and channel artifacts generated"
}

# Start the network
start_network() {
    print_status "Starting Hyperledger Fabric network..."
    
    # Start the network using docker-compose
    docker-compose -f network/docker-compose.yml up -d
    
    # Wait for containers to start
    sleep 10
    
    print_success "Network started successfully"
}

# Create and join channel
create_channel() {
    print_status "Creating and joining channel..."
    
    # Set environment variables for peer CLI
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="FarmersMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/farmers.trace-herb.com/users/Admin@farmers.trace-herb.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    
    # Create channel
    ./bin/peer channel create -o localhost:7050 -c herb-channel -f ./channel-artifacts/herb-channel.tx --outputBlock ./channel-artifacts/herb-channel.block --tls --cafile ${PWD}/organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem
    
    # Join farmers peer to channel
    ./bin/peer channel join -b ./channel-artifacts/herb-channel.block
    
    # Switch to processors org and join channel
    export CORE_PEER_LOCALMSPID="ProcessorsMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/processors.trace-herb.com/users/Admin@processors.trace-herb.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    
    ./bin/peer channel join -b ./channel-artifacts/herb-channel.block
    
    print_success "Channel created and peers joined"
}

# Deploy chaincode
deploy_chaincode() {
    print_status "Deploying herb-traceability chaincode..."
    
    # Package chaincode
    ./bin/peer lifecycle chaincode package herb-traceability.tar.gz --path ./chaincode/herb-traceability --lang node --label herb-traceability_1.0
    
    # Install on farmers peer
    export CORE_PEER_LOCALMSPID="FarmersMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/farmers.trace-herb.com/users/Admin@farmers.trace-herb.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    
    ./bin/peer lifecycle chaincode install herb-traceability.tar.gz
    
    # Install on processors peer
    export CORE_PEER_LOCALMSPID="ProcessorsMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/processors.trace-herb.com/users/Admin@processors.trace-herb.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    
    ./bin/peer lifecycle chaincode install herb-traceability.tar.gz
    
    # Get package ID
    PACKAGE_ID=$(./bin/peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id')
    
    # Approve chaincode for farmers org
    export CORE_PEER_LOCALMSPID="FarmersMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/farmers.trace-herb.com/users/Admin@farmers.trace-herb.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    
    ./bin/peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.trace-herb.com --tls --cafile ${PWD}/organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem --channelID herb-channel --name herb-traceability --version 1.0 --package-id $PACKAGE_ID --sequence 1
    
    # Approve chaincode for processors org
    export CORE_PEER_LOCALMSPID="ProcessorsMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/processors.trace-herb.com/users/Admin@processors.trace-herb.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    
    ./bin/peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.trace-herb.com --tls --cafile ${PWD}/organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem --channelID herb-channel --name herb-traceability --version 1.0 --package-id $PACKAGE_ID --sequence 1
    
    # Commit chaincode
    ./bin/peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.trace-herb.com --tls --cafile ${PWD}/organizations/ordererOrganizations/trace-herb.com/orderers/orderer.trace-herb.com/msp/tlscacerts/tlsca.trace-herb.com-cert.pem --channelID herb-channel --name herb-traceability --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/farmers.trace-herb.com/peers/peer0.farmers.trace-herb.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/processors.trace-herb.com/peers/peer0.processors.trace-herb.com/tls/ca.crt --version 1.0 --sequence 1
    
    print_success "Chaincode deployed successfully"
}

# Main execution
main() {
    print_status "🌿 Starting TRACE HERB Blockchain Network Setup"
    
    check_prerequisites
    download_fabric
    generate_crypto
    create_configtx
    generate_artifacts
    start_network
    create_channel
    deploy_chaincode
    
    print_success "🎉 TRACE HERB Blockchain Network setup completed successfully!"
    print_status "Network is now running and ready for use"
    print_status "API can now connect to real blockchain instead of demo mode"
}

# Run main function
main "$@"
