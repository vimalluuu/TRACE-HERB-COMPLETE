/**
 * Enhanced Blockchain Service - Production Hyperledger Fabric Implementation
 * Advanced features: Multi-organization network, smart contracts, geo-fencing, quality gates
 */

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const EventEmitter = require('events');

class EnhancedBlockchainService extends EventEmitter {
  constructor() {
    super();
    this.isConnected = false;
    this.gateway = null;
    this.networks = new Map();
    this.contracts = new Map();
    this.wallet = null;
    this.demoMode = false;
    
    // Multi-organization configuration
    this.organizations = {
      farmers: {
        mspId: 'FarmersMSP',
        peers: ['peer0.farmers.trace-herb.com', 'peer1.farmers.trace-herb.com'],
        ca: 'ca.farmers.trace-herb.com',
        admin: 'admin-farmers'
      },
      processors: {
        mspId: 'ProcessorsMSP',
        peers: ['peer0.processors.trace-herb.com', 'peer1.processors.trace-herb.com'],
        ca: 'ca.processors.trace-herb.com',
        admin: 'admin-processors'
      },
      labs: {
        mspId: 'LabsMSP',
        peers: ['peer0.labs.trace-herb.com', 'peer1.labs.trace-herb.com'],
        ca: 'ca.labs.trace-herb.com',
        admin: 'admin-labs'
      },
      manufacturers: {
        mspId: 'ManufacturersMSP',
        peers: ['peer0.manufacturers.trace-herb.com', 'peer1.manufacturers.trace-herb.com'],
        ca: 'ca.manufacturers.trace-herb.com',
        admin: 'admin-manufacturers'
      },
      regulators: {
        mspId: 'RegulatorsMSP',
        peers: ['peer0.regulators.trace-herb.com', 'peer1.regulators.trace-herb.com'],
        ca: 'ca.regulators.trace-herb.com',
        admin: 'admin-regulators'
      }
    };
    
    // Channel configuration
    this.channels = {
      main: {
        name: 'herb-channel',
        contracts: ['collection-contract', 'supply-contract']
      },
      quality: {
        name: 'quality-channel',
        contracts: ['quality-contract', 'testing-contract']
      },
      compliance: {
        name: 'compliance-channel',
        contracts: ['compliance-contract', 'audit-contract']
      }
    };
    
    // Smart contract configuration
    this.smartContracts = {
      collection: {
        name: 'collection-contract',
        version: '1.0',
        functions: [
          'CreateCollectionEvent',
          'UpdateCollectionEvent',
          'GetCollectionEvent',
          'QueryCollectionsByFarmer',
          'ValidateGeoFencing',
          'CheckSeasonalRestrictions'
        ]
      },
      quality: {
        name: 'quality-contract',
        version: '1.0',
        functions: [
          'CreateQualityTest',
          'UpdateQualityTest',
          'GetQualityTest',
          'ValidateQualityGates',
          'IssueCertificate',
          'RevokeCertificate'
        ]
      },
      supply: {
        name: 'supply-contract',
        version: '1.0',
        functions: [
          'CreateProcessingStep',
          'UpdateProcessingStep',
          'TransferCustody',
          'CreateProvenance',
          'GetProvenance',
          'TrackBatch'
        ]
      },
      compliance: {
        name: 'compliance-contract',
        version: '1.0',
        functions: [
          'CreateComplianceRecord',
          'UpdateComplianceRecord',
          'GenerateAuditReport',
          'ValidateSustainability',
          'CheckExportCompliance',
          'IssueExportCertificate'
        ]
      }
    };
    
    // Geo-fencing zones for approved harvesting areas
    this.geoFencingZones = [
      {
        id: 'maharashtra-zone-1',
        name: 'Maharashtra Organic Zone 1',
        coordinates: [
          { lat: 19.7515, lng: 75.7139 },
          { lat: 19.8515, lng: 75.8139 },
          { lat: 19.8515, lng: 75.9139 },
          { lat: 19.7515, lng: 75.8139 }
        ],
        approvedSpecies: ['Withania somnifera', 'Curcuma longa'],
        restrictions: {
          seasons: ['winter', 'spring'],
          maxQuantityPerDay: 100, // kg
          certificationRequired: true
        }
      },
      {
        id: 'kerala-zone-1',
        name: 'Kerala Spice Zone 1',
        coordinates: [
          { lat: 10.8505, lng: 76.2711 },
          { lat: 10.9505, lng: 76.3711 },
          { lat: 10.9505, lng: 76.4711 },
          { lat: 10.8505, lng: 76.3711 }
        ],
        approvedSpecies: ['Curcuma longa', 'Piper nigrum'],
        restrictions: {
          seasons: ['monsoon', 'post-monsoon'],
          maxQuantityPerDay: 200, // kg
          certificationRequired: true
        }
      }
    ];
    
    // Quality gates configuration
    this.qualityGates = {
      moisture: { min: 0, max: 10, unit: '%' },
      pesticides: { max: 0.01, unit: 'ppm' },
      heavyMetals: { max: 0.005, unit: 'ppm' },
      microbial: { max: 1000, unit: 'cfu/g' },
      withanolides: { min: 2.5, max: 5.0, unit: '%' }, // For Ashwagandha
      curcumin: { min: 3.0, max: 7.0, unit: '%' } // For Turmeric
    };
  }

  /**
   * Initialize enhanced blockchain connection
   */
  async connect() {
    try {
      console.log('🔗 Connecting to Enhanced Hyperledger Fabric Network...');
      
      // Load connection profiles for all organizations
      await this.loadConnectionProfiles();
      
      // Setup wallets for all organizations
      await this.setupWallets();
      
      // Connect to gateway
      await this.connectToGateway();
      
      // Initialize all channels and contracts
      await this.initializeChannelsAndContracts();
      
      // Setup event listeners
      await this.setupEventListeners();
      
      this.isConnected = true;
      console.log('✅ Enhanced Blockchain Service connected successfully');
      
      // Emit connection event
      this.emit('connected', {
        timestamp: new Date().toISOString(),
        organizations: Object.keys(this.organizations),
        channels: Object.keys(this.channels),
        contracts: Object.keys(this.smartContracts)
      });
      
    } catch (error) {
      console.error('❌ Failed to connect to blockchain network:', error);
      await this.fallbackToDemoMode();
    }
  }

  /**
   * Load connection profiles for all organizations
   */
  async loadConnectionProfiles() {
    const connectionProfilePath = path.resolve(__dirname, '..', '..', '..', 'blockchain', 'network', 'connection-profile.json');
    
    if (fs.existsSync(connectionProfilePath)) {
      this.connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
      console.log('📄 Connection profile loaded successfully');
    } else {
      throw new Error('Connection profile not found');
    }
  }

  /**
   * Setup wallets for all organizations
   */
  async setupWallets() {
    const walletPath = path.resolve(__dirname, '..', '..', '..', 'blockchain', 'wallets');
    this.wallet = await Wallets.newFileSystemWallet(walletPath);
    
    // Ensure admin identities exist for all organizations
    for (const [orgName, orgConfig] of Object.entries(this.organizations)) {
      const adminExists = await this.wallet.get(orgConfig.admin);
      if (!adminExists) {
        console.log(`🔑 Enrolling admin for ${orgName}...`);
        await this.enrollAdmin(orgName, orgConfig);
      }
    }
    
    console.log('👛 Wallets setup completed');
  }

  /**
   * Enroll admin for organization
   */
  async enrollAdmin(orgName, orgConfig) {
    try {
      const caInfo = this.connectionProfile.certificateAuthorities[orgConfig.ca];
      const caTLSCACerts = caInfo.tlsCACerts.pem;
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

      const enrollment = await ca.enroll({
        enrollmentID: 'admin',
        enrollmentSecret: 'adminpw'
      });

      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: orgConfig.mspId,
        type: 'X.509',
      };

      await this.wallet.put(orgConfig.admin, x509Identity);
      console.log(`✅ Admin enrolled for ${orgName}`);
      
    } catch (error) {
      console.error(`❌ Failed to enroll admin for ${orgName}:`, error);
      throw error;
    }
  }

  /**
   * Connect to Fabric Gateway
   */
  async connectToGateway() {
    this.gateway = new Gateway();
    
    const connectionOptions = {
      wallet: this.wallet,
      identity: this.organizations.farmers.admin, // Default to farmers org
      discovery: { enabled: true, asLocalhost: false },
      eventHandlerOptions: {
        commitTimeout: 100,
        strategy: 'MSPID_SCOPE_ANYFORTX'
      }
    };

    await this.gateway.connect(this.connectionProfile, connectionOptions);
    console.log('🌐 Connected to Fabric Gateway');
  }

  /**
   * Initialize all channels and contracts
   */
  async initializeChannelsAndContracts() {
    for (const [channelKey, channelConfig] of Object.entries(this.channels)) {
      try {
        const network = await this.gateway.getNetwork(channelConfig.name);
        this.networks.set(channelKey, network);
        
        // Initialize contracts for this channel
        for (const contractName of channelConfig.contracts) {
          const contract = network.getContract(contractName);
          this.contracts.set(contractName, contract);
        }
        
        console.log(`📡 Channel ${channelConfig.name} initialized with ${channelConfig.contracts.length} contracts`);
        
      } catch (error) {
        console.error(`❌ Failed to initialize channel ${channelConfig.name}:`, error);
      }
    }
  }

  /**
   * Setup blockchain event listeners
   */
  async setupEventListeners() {
    try {
      for (const [channelKey, network] of this.networks.entries()) {
        // Listen for block events
        const blockListener = await network.addBlockListener(
          'block-listener',
          (blockEvent) => {
            console.log(`📦 New block received on ${channelKey}:`, blockEvent.blockNumber);
            this.emit('blockReceived', {
              channel: channelKey,
              blockNumber: blockEvent.blockNumber,
              timestamp: new Date().toISOString()
            });
          },
          { replay: false }
        );
        
        // Listen for contract events
        for (const contractName of this.channels[channelKey].contracts) {
          const contract = this.contracts.get(contractName);
          if (contract) {
            const contractListener = await contract.addContractListener(
              `${contractName}-listener`,
              'CollectionEventCreated',
              (event) => {
                console.log(`📋 Contract event received from ${contractName}:`, event.eventName);
                this.emit('contractEvent', {
                  contract: contractName,
                  eventName: event.eventName,
                  payload: event.payload,
                  timestamp: new Date().toISOString()
                });
              }
            );
          }
        }
      }
      
      console.log('👂 Event listeners setup completed');
      
    } catch (error) {
      console.error('❌ Failed to setup event listeners:', error);
    }
  }

  /**
   * Validate geo-fencing for collection location
   */
  validateGeoFencing(latitude, longitude, species) {
    for (const zone of this.geoFencingZones) {
      if (this.isPointInPolygon({ lat: latitude, lng: longitude }, zone.coordinates)) {
        if (zone.approvedSpecies.includes(species)) {
          return {
            valid: true,
            zone: zone.id,
            zoneName: zone.name,
            restrictions: zone.restrictions
          };
        }
      }
    }
    
    return {
      valid: false,
      reason: 'Location not in approved harvesting zone or species not permitted'
    };
  }

  /**
   * Check if point is inside polygon (geo-fencing)
   */
  isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].lng > point.lng) !== (polygon[j].lng > point.lng)) &&
          (point.lat < (polygon[j].lat - polygon[i].lat) * (point.lng - polygon[i].lng) / (polygon[j].lng - polygon[i].lng) + polygon[i].lat)) {
        inside = !inside;
      }
    }
    return inside;
  }

  /**
   * Validate quality gates
   */
  validateQualityGates(testResults, species) {
    const validationResults = [];
    
    for (const [parameter, result] of Object.entries(testResults)) {
      const gate = this.qualityGates[parameter];
      if (gate) {
        let passed = true;
        let reason = '';
        
        if (gate.min !== undefined && result.value < gate.min) {
          passed = false;
          reason = `Value ${result.value} below minimum ${gate.min}`;
        }
        
        if (gate.max !== undefined && result.value > gate.max) {
          passed = false;
          reason = `Value ${result.value} above maximum ${gate.max}`;
        }
        
        validationResults.push({
          parameter,
          value: result.value,
          unit: gate.unit,
          passed,
          reason,
          gate: gate
        });
      }
    }
    
    return {
      overallPassed: validationResults.every(r => r.passed),
      results: validationResults
    };
  }

  /**
   * Submit collection event with advanced validation
   */
  async submitCollectionEvent(collectionData) {
    try {
      // Validate geo-fencing
      const geoValidation = this.validateGeoFencing(
        collectionData.location.latitude,
        collectionData.location.longitude,
        collectionData.herb.botanicalName
      );
      
      if (!geoValidation.valid) {
        throw new Error(`Geo-fencing validation failed: ${geoValidation.reason}`);
      }
      
      // Check seasonal restrictions
      const currentSeason = this.getCurrentSeason();
      if (!geoValidation.restrictions.seasons.includes(currentSeason)) {
        throw new Error(`Collection not permitted in current season: ${currentSeason}`);
      }
      
      // Submit to blockchain
      const contract = this.contracts.get('collection-contract');
      if (!contract) {
        throw new Error('Collection contract not available');
      }
      
      const result = await contract.submitTransaction(
        'CreateCollectionEvent',
        JSON.stringify({
          ...collectionData,
          geoValidation,
          timestamp: new Date().toISOString(),
          blockchainVersion: '2.0'
        })
      );
      
      const transactionId = contract.getTransactionId();
      
      console.log('✅ Collection event submitted to blockchain:', transactionId);
      
      return {
        success: true,
        transactionId,
        blockNumber: await this.getLatestBlockNumber(),
        geoValidation,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Failed to submit collection event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current season based on date
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'monsoon';
    if (month >= 9 && month <= 11) return 'post-monsoon';
    return 'winter';
  }

  /**
   * Get latest block number
   */
  async getLatestBlockNumber() {
    try {
      const network = this.networks.get('main');
      if (network) {
        const channel = network.getChannel();
        const blockchainInfo = await channel.queryInfo();
        return blockchainInfo.height.toString();
      }
      return '0';
    } catch (error) {
      console.error('Error getting block number:', error);
      return '0';
    }
  }

  /**
   * Fallback to demo mode if blockchain is not available
   */
  async fallbackToDemoMode() {
    console.log('⚠️ Falling back to demo mode...');
    this.demoMode = true;
    this.isConnected = true;
    
    // Emit demo mode event
    this.emit('demoMode', {
      timestamp: new Date().toISOString(),
      reason: 'Blockchain network not available'
    });
  }

  /**
   * Disconnect from blockchain network
   */
  async disconnect() {
    try {
      if (this.gateway) {
        await this.gateway.disconnect();
        console.log('🔌 Disconnected from blockchain network');
      }
      
      this.isConnected = false;
      this.emit('disconnected', { timestamp: new Date().toISOString() });
      
    } catch (error) {
      console.error('Error disconnecting from blockchain:', error);
    }
  }
}

module.exports = EnhancedBlockchainService;
