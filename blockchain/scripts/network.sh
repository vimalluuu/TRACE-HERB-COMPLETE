#!/bin/bash
#
# TRACE HERB Network Setup Script
# Sets up Hyperledger Fabric network for herb traceability
#

# Exit on first error
set -e

# Print the usage message
function printHelp() {
  echo "Usage: "
  echo "  network.sh <Mode> [Flags]"
  echo "    <Mode>"
  echo "      - 'up' - bring up the network with docker-compose up"
  echo "      - 'down' - clear the network with docker-compose down"
  echo "      - 'restart' - restart the network"
  echo "      - 'generate' - generate required certificates and genesis block"
  echo "      - 'deployCC' - deploy the chaincode"
  echo "    -ca <use CAs> -  create Certificate Authorities to generate the crypto material"
  echo "    -c <channel name> - channel name to use (defaults to 'herb-channel')"
  echo "    -s <dbtype> - the database backend to use: goleveldb (default) or couchdb"
  echo "    -r <max retry> - CLI times out after this number of attempts (defaults to 5)"
  echo "    -d <delay> - delay duration in seconds (defaults to 3)"
  echo "    -i <imagetag> - the tag to be used to launch the network (defaults to latest)"
  echo "    -v - verbose mode"
  echo "  network.sh -h (print this message)"
  echo
  echo "Typically, one would first generate the required certificates and "
  echo "genesis block, then bring up the network. e.g.:"
  echo
  echo "	network.sh generate -c herb-channel"
  echo "	network.sh up -c herb-channel -s couchdb"
  echo "        network.sh up createChannel -c herb-channel -s couchdb"
  echo "	network.sh deployCC -c herb-channel"
  echo
  echo "Taking all defaults:"
  echo "	network.sh generate"
  echo "	network.sh up"
  echo "	network.sh deployCC"
}

# Obtain CONTAINER_IDS and remove them
# TODO Might want to make this optional - could clear other containers
function clearContainers() {
  CONTAINER_IDS=$(docker ps -a | awk '($2 ~ /dev-peer.*/) {print $1}')
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    echo "---- No containers available for deletion ----"
  else
    docker rm -f $CONTAINER_IDS
  fi
}

# Delete any images that were generated as a part of this setup
# specifically the following images are often left behind:
function removeUnwantedImages() {
  DOCKER_IMAGE_IDS=$(docker images | awk '($1 ~ /dev-peer.*/) {print $3}')
  if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
    echo "---- No images available for deletion ----"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

# Versions of fabric known not to work with the test network
BLACKLISTED_VERSIONS="^1\.0\. ^1\.1\. ^1\.2\. ^1\.3\. ^1\.4\."

# Do some basic sanity checking to make sure that the appropriate versions of fabric
# binaries/images are available. In the future, additional checking for the presence
# of go or other items could be added.
function checkPrereqs() {
  ## Check if your have cloned the peer binaries and configuration files.
  peer version > /dev/null 2>&1

  if [[ $? -ne 0 || ! -d "../config" ]]; then
    echo "ERROR! Peer binary and configuration files not found.."
    echo
    echo "Follow the instructions in the Fabric docs to install the Fabric Binaries:"
    echo "https://hyperledger-fabric.readthedocs.io/en/latest/install.html"
    exit 1
  fi
  # use the fabric tools container to see if the samples and binaries match your
  # docker images
  LOCAL_VERSION=$(peer version | sed -ne 's/ Version: //p')
  DOCKER_IMAGE_VERSION=$(docker run --rm hyperledger/fabric-tools:$IMAGETAG peer version | sed -ne 's/ Version: //p' | head -1)

  echo "LOCAL_VERSION=$LOCAL_VERSION"
  echo "DOCKER_IMAGE_VERSION=$DOCKER_IMAGE_VERSION"

  if [ "$LOCAL_VERSION" != "$DOCKER_IMAGE_VERSION" ]; then
    echo "=================== WARNING ==================="
    echo "  Local fabric binaries and docker images are  "
    echo "  out of  sync. This may cause problems.       "
    echo "==============================================="
  fi

  for UNSUPPORTED_VERSION in $BLACKLISTED_VERSIONS; do
    echo "$LOCAL_VERSION" | grep -q $UNSUPPORTED_VERSION
    if [ $? -eq 0 ]; then
      echo "ERROR! Local Fabric binary version of $LOCAL_VERSION does not match the versions supported by the test network."
      exit 1
    fi

    echo "$DOCKER_IMAGE_VERSION" | grep -q $UNSUPPORTED_VERSION
    if [ $? -eq 0 ]; then
      echo "ERROR! Fabric Docker image version of $DOCKER_IMAGE_VERSION does not match the versions supported by the test network."
      exit 1
    fi
  done
}

# Before you can bring up a network, each organization needs to generate the crypto
# material that will define that organization on the network. Because Hyperledger
# Fabric is a permissioned blockchain, each node and user on the network needs to
# use certificates and keys to sign and verify its communications. In addition, each
# user needs to belong to an organization that is recognized as a member of the
# network. You can use the Cryptogen tool or Fabric CAs to generate the crypto
# material for each organization.
function createOrgs() {
  if [ -d "organizations/peerOrganizations" ]; then
    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
  fi

  # Create crypto material using cryptogen
  which cryptogen
  if [ "$?" -ne 0 ]; then
    echo "cryptogen tool not found. exiting"
    exit 1
  fi
  echo
  echo "##########################################################"
  echo "##### Generate certificates using cryptogen tool #######"
  echo "##########################################################"

  echo "##########################################################"
  echo "############ Create Farmers Org Identities ##############"
  echo "##########################################################"

  set -x
  cryptogen generate --config=./organizations/cryptogen/crypto-config-farmers.yaml --output="organizations"
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    echo "Failed to generate certificates..."
    exit 1
  fi

  echo "##########################################################"
  echo "########### Create Processors Org Identities ###########"
  echo "##########################################################"

  set -x
  cryptogen generate --config=./organizations/cryptogen/crypto-config-processors.yaml --output="organizations"
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    echo "Failed to generate certificates..."
    exit 1
  fi

  echo "##########################################################"
  echo "############### Create Orderer Org Identities ###########"
  echo "##########################################################"

  set -x
  cryptogen generate --config=./organizations/cryptogen/crypto-config-orderer.yaml --output="organizations"
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    echo "Failed to generate certificates..."
    exit 1
  fi

  echo "##########################################################"
  echo "############## Create Labs Org Identities ###############"
  echo "##########################################################"

  set -x
  cryptogen generate --config=./organizations/cryptogen/crypto-config-labs.yaml --output="organizations"
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    echo "Failed to generate certificates..."
    exit 1
  fi

  echo "##########################################################"
  echo "########### Create Regulators Org Identities ###########"
  echo "##########################################################"

  set -x
  cryptogen generate --config=./organizations/cryptogen/crypto-config-regulators.yaml --output="organizations"
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    echo "Failed to generate certificates..."
    exit 1
  fi

  echo "Generate CCP files for Farmers and Processors"
  ./organizations/ccp-generate.sh
}

# Once you create the organization crypto material, you need to create the
# genesis block of the application channel.
function createConsortium() {
  which configtxgen
  if [ "$?" -ne 0 ]; then
    echo "configtxgen tool not found. exiting"
    exit 1
  fi

  echo "#################################################################"
  echo "### Generating channel configuration transaction 'channel.tx' ###"
  echo "#################################################################"
  set -x
  configtxgen -profile HerbChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    echo "Failed to generate channel configuration transaction..."
    exit 1
  fi

  echo "#################################################################"
  echo "#######    Generating anchor peer update for FarmersMSP   ##########"
  echo "#################################################################"
  set -x
  configtxgen -profile HerbChannel -outputAnchorPeersUpdate ./channel-artifacts/FarmersMSPanchors.tx -channelID $CHANNEL_NAME -asOrg FarmersMSP
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    echo "Failed to generate anchor peer update for FarmersMSP..."
    exit 1
  fi

  echo "#################################################################"
  echo "#######    Generating anchor peer update for ProcessorsMSP   ##########"
  echo "#################################################################"
  set -x
  configtxgen -profile HerbChannel -outputAnchorPeersUpdate ./channel-artifacts/ProcessorsMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ProcessorsMSP
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    echo "Failed to generate anchor peer update for ProcessorsMSP..."
    exit 1
  fi
}

# Bring up the peer and orderer nodes using docker compose.
function networkUp() {
  checkPrereqs
  # generate artifacts if they don't exist
  if [ ! -d "organizations/peerOrganizations" ]; then
    createOrgs
    createConsortium
  fi

  COMPOSE_FILES="-f ${COMPOSE_FILE}"
  if [ "${DATABASE}" == "couchdb" ]; then
    COMPOSE_FILES="${COMPOSE_FILES} -f ${COMPOSE_FILE_COUCH}"
  fi

  IMAGE_TAG=$IMAGETAG docker-compose ${COMPOSE_FILES} up -d 2>&1

  docker ps -a
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to start network"
    exit 1
  fi
}

# call the script to create the channel, join the peers of org1 and org2,
# and then update the anchor peers for each organization
function createChannel() {
  # Bring up the network if it is not already up.
  if [ ! -d "organizations/peerOrganizations" ]; then
    echo "Bringing up network"
    networkUp
  fi

  # now run the script that creates a channel. This script uses configtxgen once
  # more to create the channel creation transaction and the anchor peer updates.
  scripts/createChannel.sh $CHANNEL_NAME $CLI_DELAY $MAX_RETRY $VERBOSE
}

## Call the script to deploy a chaincode to the channel
function deployCC() {
  scripts/deployCC.sh $CHANNEL_NAME $CC_NAME $CC_SRC_PATH $CC_SRC_LANGUAGE $CC_VERSION $CC_SEQUENCE $CC_INIT_FCN $CC_END_POLICY $CC_COLL_CONFIG $CLI_DELAY $MAX_RETRY $VERBOSE

  if [ $? -ne 0 ]; then
    echo "ERROR !!! Deploying chaincode failed"
    exit 1
  fi
}

# Tear down running network
function networkDown() {
  # stop org3 containers also in addition to org1 and org2, in case we were running sample to add org3
  docker-compose -f $COMPOSE_FILE -f $COMPOSE_FILE_COUCH down --volumes --remove-orphans
  docker-compose -f $COMPOSE_FILE_CA -f $COMPOSE_FILE_COUCH down --volumes --remove-orphans
  # Don't remove the generated artifacts -- note, the ledgers are always removed
  if [ "$MODE" != "restart" ]; then
    # Bring down the network, deleting the volumes
    #Cleanup the chaincode containers
    clearContainers
    #Cleanup images
    removeUnwantedImages
    # remove orderer block and other channel configuration transactions and certs
    docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf system-genesis-block/*.block organizations/peerOrganizations organizations/ordererOrganizations'
    ## remove fabric ca artifacts
    docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/farmers/msp organizations/fabric-ca/farmers/tls-cert.pem organizations/fabric-ca/farmers/ca-cert.pem organizations/fabric-ca/farmers/IssuerPublicKey organizations/fabric-ca/farmers/IssuerRevocationPublicKey organizations/fabric-ca/farmers/fabric-ca-server.db'
    docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/processors/msp organizations/fabric-ca/processors/tls-cert.pem organizations/fabric-ca/processors/ca-cert.pem organizations/fabric-ca/processors/IssuerPublicKey organizations/fabric-ca/processors/IssuerRevocationPublicKey organizations/fabric-ca/processors/fabric-ca-server.db'
    docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/ordererOrg/msp organizations/fabric-ca/ordererOrg/tls-cert.pem organizations/fabric-ca/ordererOrg/ca-cert.pem organizations/fabric-ca/ordererOrg/IssuerPublicKey organizations/fabric-ca/ordererOrg/IssuerRevocationPublicKey organizations/fabric-ca/ordererOrg/fabric-ca-server.db'
    #remove channel and script artifacts
    docker run --rm -v $(pwd):/data busybox sh -c 'cd /data && rm -rf channel-artifacts log.txt *.tar.gz'
  fi
}

# Using crpto vs CA. default is cryptogen
CRYPTO="cryptogen"
# timeout duration - the duration the CLI should wait for a response from
# another container before giving up
MAX_RETRY=5
# default for delay between commands
CLI_DELAY=3
# channel name defaults to "herb-channel"
CHANNEL_NAME="herb-channel"
# chaincode name defaults to "herb-traceability"
CC_NAME="herb-traceability"
# chaincode path defaults to "../chaincode/herb-traceability/"
CC_SRC_PATH="../chaincode/herb-traceability/"
# endorsement policy defaults to "NA". This would allow chaincodes to use the majority default policy.
CC_END_POLICY="NA"
# collection configuration defaults to "NA"
CC_COLL_CONFIG="NA"
# chaincode init function defaults to "NA"
CC_INIT_FCN="NA"
# use this as the default docker-compose yaml definition
COMPOSE_FILE=docker/docker-compose-trace-herb.yaml
# docker-compose.yaml file if you are using couchdb
COMPOSE_FILE_COUCH=docker/docker-compose-couch.yaml
# certificate authorities compose file
COMPOSE_FILE_CA=docker/docker-compose-ca.yaml
# use golang as the default language for chaincode
CC_SRC_LANGUAGE=javascript
# Chaincode version
CC_VERSION=1.0
# Chaincode definition sequence
CC_SEQUENCE=1
# default image tag
IMAGETAG="latest"
# default database
DATABASE="leveldb"

# Parse commandline args

## Parse mode
if [[ $# -lt 1 ]] ; then
  printHelp
  exit 0
else
  MODE=$1
  shift
fi

# parse a createChannel subcommand if used
if [[ $# -ge 1 ]] ; then
  key="$1"
  if [[ "$key" == "createChannel" ]]; then
      export MODE="createChannel"
      shift
  fi
fi

# parse flags

while [[ $# -ge 1 ]] ; do
  key="$1"
  case $key in
  -h )
    printHelp
    exit 0
    ;;
  -c )
    CHANNEL_NAME="$2"
    shift
    ;;
  -ca )
    CRYPTO="Certificate Authorities"
    ;;
  -r )
    MAX_RETRY="$2"
    shift
    ;;
  -d )
    CLI_DELAY="$2"
    shift
    ;;
  -s )
    DATABASE="$2"
    shift
    ;;
  -ccl )
    CC_SRC_LANGUAGE="$2"
    shift
    ;;
  -ccn )
    CC_NAME="$2"
    shift
    ;;
  -ccv )
    CC_VERSION="$2"
    shift
    ;;
  -ccs )
    CC_SEQUENCE="$2"
    shift
    ;;
  -ccp )
    CC_SRC_PATH="$2"
    shift
    ;;
  -ccep )
    CC_END_POLICY="$2"
    shift
    ;;
  -cccg )
    CC_COLL_CONFIG="$2"
    shift
    ;;
  -cci )
    CC_INIT_FCN="$2"
    shift
    ;;
  -i )
    IMAGETAG="$2"
    shift
    ;;
  -v )
    VERBOSE=true
    shift
    ;;
  * )
    echo "Unknown flag: $key"
    printHelp
    exit 1
    ;;
  esac
  shift
done

# Are we generating crypto material with this command?
if [ ! -d "organizations/peerOrganizations" ]; then
  CRYPTO_MODE="with crypto from '${CRYPTO}'"
else
  CRYPTO_MODE=""
fi

# Determine mode of operation and printing out what we asked for
if [ "$MODE" == "up" ]; then
  echo "Starting nodes with CLI timeout of '${MAX_RETRY}' tries and CLI delay of '${CLI_DELAY}' seconds and using database '${DATABASE}' ${CRYPTO_MODE}"
  echo
elif [ "$MODE" == "createChannel" ]; then
  echo "Creating channel '${CHANNEL_NAME}'."
  echo
  echo "If network is not up, starting nodes with CLI timeout of '${MAX_RETRY}' tries and CLI delay of '${CLI_DELAY}' seconds and using database '${DATABASE} ${CRYPTO_MODE}"
  echo
elif [ "$MODE" == "down" ]; then
  echo "Stopping network"
  echo
elif [ "$MODE" == "restart" ]; then
  echo "Restarting network"
  echo
elif [ "$MODE" == "deployCC" ]; then
  echo "deploying chaincode on channel '${CHANNEL_NAME}'"
  echo
elif [ "$MODE" == "generate" ]; then
  echo "Generating certs and genesis block for channel '${CHANNEL_NAME}' with CLI timeout of '${MAX_RETRY}' tries and CLI delay of '${CLI_DELAY}' seconds and using database '${DATABASE}'"
  echo
else
  printHelp
  exit 1
fi

if [ "${MODE}" == "up" ]; then
  networkUp
elif [ "${MODE}" == "createChannel" ]; then
  createChannel
elif [ "${MODE}" == "deployCC" ]; then
  deployCC
elif [ "${MODE}" == "down" ]; then
  networkDown
elif [ "${MODE}" == "restart" ]; then
  networkDown
  networkUp
elif [ "${MODE}" == "generate" ]; then
  createOrgs
  createConsortium
else
  printHelp
  exit 1
fi
