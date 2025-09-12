'use strict';

const { Contract, Context } = require('fabric-contract-api');
const { v4: uuidv4 } = require('uuid');
const geolib = require('geolib');

/**
 * Custom transaction context for herb traceability
 */
class HerbTraceabilityContext extends Context {
  constructor() {
    super();
    this.herbList = null;
  }
}

/**
 * Main smart contract for TRACE HERB blockchain network
 * Handles collection events, processing steps, quality tests, and provenance
 */
class HerbTraceabilityContract extends Contract {
  
  constructor() {
    super('HerbTraceabilityContract');
  }

  createContext() {
    return new HerbTraceabilityContext();
  }

  /**
   * Initialize the ledger with default configuration
   */
  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');
    
    // Initialize network configuration
    const networkConfig = {
      id: 'trace-herb-network',
      version: '1.0.0',
      initialized: new Date().toISOString(),
      organizations: ['Org1MSP', 'Org2MSP', 'Org3MSP', 'Org4MSP'],
      channels: ['herb-channel'],
      chaincode: 'herb-traceability'
    };
    
    await ctx.stub.putState('NETWORK_CONFIG', Buffer.from(JSON.stringify(networkConfig)));
    
    // Initialize approved harvesting zones
    const approvedZones = [
      {
        id: 'zone-001',
        name: 'Western Ghats Biodiversity Hotspot',
        coordinates: {
          center: { latitude: 15.2993, longitude: 74.1240 },
          radius: 50000 // 50km radius
        },
        species: ['Withania somnifera', 'Bacopa monnieri', 'Centella asiatica'],
        restrictions: ['seasonal', 'quota-based'],
        season: { start: '10-01', end: '03-31' }
      },
      {
        id: 'zone-002', 
        name: 'Himalayan Medicinal Plants Zone',
        coordinates: {
          center: { latitude: 30.0668, longitude: 79.0193 },
          radius: 75000 // 75km radius
        },
        species: ['Nardostachys jatamansi', 'Picrorhiza kurroa', 'Cordyceps sinensis'],
        restrictions: ['permit-required', 'endangered-species'],
        season: { start: '05-01', end: '09-30' }
      }
    ];
    
    for (const zone of approvedZones) {
      await ctx.stub.putState(`ZONE_${zone.id}`, Buffer.from(JSON.stringify(zone)));
    }
    
    console.info('============= END : Initialize Ledger ===========');
  }

  /**
   * Record a collection event with geo-fencing validation
   */
  async recordCollectionEvent(ctx, collectionEventString) {
    console.info('============= START : Record Collection Event ===========');
    
    const collectionEvent = JSON.parse(collectionEventString);
    
    // Validate collection event
    const validation = await this.validateCollectionEvent(ctx, collectionEvent);
    if (!validation.isValid) {
      throw new Error(`Collection validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Add blockchain metadata
    collectionEvent.blockchain = {
      transactionId: ctx.stub.getTxID(),
      timestamp: ctx.stub.getTxTimestamp().seconds.low * 1000,
      submitter: ctx.clientIdentity.getID(),
      mspId: ctx.clientIdentity.getMSPID()
    };
    
    // Store collection event
    await ctx.stub.putState(collectionEvent.id, Buffer.from(JSON.stringify(collectionEvent)));
    
    // Create composite key for queries
    const compositeKey = ctx.stub.createCompositeKey('collection', [
      collectionEvent.subject.botanicalName,
      collectionEvent.performer.identifier,
      collectionEvent.performedDateTime
    ]);
    await ctx.stub.putState(compositeKey, Buffer.from(collectionEvent.id));
    
    // Emit event
    ctx.stub.setEvent('CollectionEventRecorded', Buffer.from(JSON.stringify({
      id: collectionEvent.id,
      botanicalName: collectionEvent.subject.botanicalName,
      location: collectionEvent.location.address,
      quantity: collectionEvent.quantity
    })));
    
    console.info('============= END : Record Collection Event ===========');
    return collectionEvent.id;
  }

  /**
   * Record a processing step with quality validations
   */
  async recordProcessingStep(ctx, processingStepString) {
    console.info('============= START : Record Processing Step ===========');
    
    const processingStep = JSON.parse(processingStepString);
    
    // Validate processing step
    const validation = await this.validateProcessingStep(ctx, processingStep);
    if (!validation.isValid) {
      throw new Error(`Processing validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Verify input reference exists
    const inputExists = await ctx.stub.getState(processingStep.input.reference);
    if (!inputExists || inputExists.length === 0) {
      throw new Error(`Input reference ${processingStep.input.reference} not found`);
    }
    
    // Add blockchain metadata
    processingStep.blockchain = {
      transactionId: ctx.stub.getTxID(),
      timestamp: ctx.stub.getTxTimestamp().seconds.low * 1000,
      submitter: ctx.clientIdentity.getID(),
      mspId: ctx.clientIdentity.getMSPID(),
      previousHash: await this.calculateHash(inputExists.toString())
    };
    
    // Store processing step
    await ctx.stub.putState(processingStep.id, Buffer.from(JSON.stringify(processingStep)));
    
    // Create composite key for queries
    const compositeKey = ctx.stub.createCompositeKey('processing', [
      processingStep.type.coding[0].code,
      processingStep.performer.identifier,
      processingStep.performedPeriod.start
    ]);
    await ctx.stub.putState(compositeKey, Buffer.from(processingStep.id));
    
    // Emit event
    ctx.stub.setEvent('ProcessingStepRecorded', Buffer.from(JSON.stringify({
      id: processingStep.id,
      type: processingStep.type.coding[0].display,
      inputReference: processingStep.input.reference,
      yield: processingStep.output.quantity.yield
    })));
    
    console.info('============= END : Record Processing Step ===========');
    return processingStep.id;
  }

  /**
   * Record a quality test result
   */
  async recordQualityTest(ctx, qualityTestString) {
    console.info('============= START : Record Quality Test ===========');
    
    const qualityTest = JSON.parse(qualityTestString);
    
    // Validate quality test
    const validation = await this.validateQualityTest(ctx, qualityTest);
    if (!validation.isValid) {
      throw new Error(`Quality test validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Verify subject reference exists
    const subjectExists = await ctx.stub.getState(qualityTest.subject.reference);
    if (!subjectExists || subjectExists.length === 0) {
      throw new Error(`Subject reference ${qualityTest.subject.reference} not found`);
    }
    
    // Add blockchain metadata
    qualityTest.blockchain = {
      transactionId: ctx.stub.getTxID(),
      timestamp: ctx.stub.getTxTimestamp().seconds.low * 1000,
      submitter: ctx.clientIdentity.getID(),
      mspId: ctx.clientIdentity.getMSPID(),
      previousHash: await this.calculateHash(subjectExists.toString())
    };
    
    // Store quality test
    await ctx.stub.putState(qualityTest.id, Buffer.from(JSON.stringify(qualityTest)));
    
    // Create composite key for queries
    const compositeKey = ctx.stub.createCompositeKey('test', [
      qualityTest.code.coding[0].code,
      qualityTest.performer.identifier,
      qualityTest.effectiveDateTime
    ]);
    await ctx.stub.putState(compositeKey, Buffer.from(qualityTest.id));
    
    // Emit event
    ctx.stub.setEvent('QualityTestRecorded', Buffer.from(JSON.stringify({
      id: qualityTest.id,
      testType: qualityTest.code.coding[0].display,
      subjectReference: qualityTest.subject.reference,
      result: qualityTest.result.value,
      interpretation: qualityTest.result.interpretation.coding[0].display
    })));
    
    console.info('============= END : Record Quality Test ===========');
    return qualityTest.id;
  }

  /**
   * Create complete provenance record
   */
  async createProvenance(ctx, provenanceString) {
    console.info('============= START : Create Provenance ===========');
    
    const provenance = JSON.parse(provenanceString);
    
    // Validate all referenced events exist
    for (const event of provenance.events) {
      const eventExists = await ctx.stub.getState(event.reference);
      if (!eventExists || eventExists.length === 0) {
        throw new Error(`Referenced event ${event.reference} not found`);
      }
    }
    
    // Add blockchain metadata
    provenance.blockchain = {
      networkId: 'trace-herb-network',
      channelId: ctx.stub.getChannelID(),
      chaincodeId: 'herb-traceability',
      transactionIds: provenance.events.map(e => e.reference),
      timestamp: ctx.stub.getTxTimestamp().seconds.low * 1000,
      submitter: ctx.clientIdentity.getID(),
      mspId: ctx.clientIdentity.getMSPID()
    };
    
    // Generate QR code identifier
    const qrCode = `QR_${uuidv4().replace(/-/g, '').toUpperCase()}`;
    provenance.target.qrCode = qrCode;
    
    // Store provenance
    await ctx.stub.putState(provenance.id, Buffer.from(JSON.stringify(provenance)));
    await ctx.stub.putState(qrCode, Buffer.from(provenance.id));
    
    // Create composite key for product queries
    const compositeKey = ctx.stub.createCompositeKey('provenance', [
      provenance.product.botanicalName,
      provenance.target.batchNumber,
      provenance.recorded
    ]);
    await ctx.stub.putState(compositeKey, Buffer.from(provenance.id));
    
    // Emit event
    ctx.stub.setEvent('ProvenanceCreated', Buffer.from(JSON.stringify({
      id: provenance.id,
      qrCode: qrCode,
      productName: provenance.product.name,
      batchNumber: provenance.target.batchNumber,
      eventsCount: provenance.events.length
    })));
    
    console.info('============= END : Create Provenance ===========');
    return { provenanceId: provenance.id, qrCode: qrCode };
  }

  /**
   * Query provenance by QR code (for consumer scanning)
   */
  async queryProvenanceByQR(ctx, qrCode) {
    console.info(`============= START : Query Provenance by QR: ${qrCode} ===========`);
    
    const provenanceIdBytes = await ctx.stub.getState(qrCode);
    if (!provenanceIdBytes || provenanceIdBytes.length === 0) {
      throw new Error(`QR code ${qrCode} not found`);
    }
    
    const provenanceId = provenanceIdBytes.toString();
    const provenanceBytes = await ctx.stub.getState(provenanceId);
    
    if (!provenanceBytes || provenanceBytes.length === 0) {
      throw new Error(`Provenance ${provenanceId} not found`);
    }
    
    const provenance = JSON.parse(provenanceBytes.toString());
    
    // Update consumer scan metrics
    if (!provenance.consumer) {
      provenance.consumer = { scanCount: 0, firstScan: null, lastScan: null };
    }
    
    provenance.consumer.scanCount++;
    provenance.consumer.lastScan = new Date().toISOString();
    if (!provenance.consumer.firstScan) {
      provenance.consumer.firstScan = provenance.consumer.lastScan;
    }
    
    // Update the provenance record
    await ctx.stub.putState(provenanceId, Buffer.from(JSON.stringify(provenance)));
    
    console.info('============= END : Query Provenance by QR ===========');
    return provenance;
  }

  /**
   * Validate collection event against geo-fencing and seasonal restrictions
   */
  async validateCollectionEvent(ctx, collectionEvent) {
    const errors = [];
    
    // Basic validation
    if (!collectionEvent.subject?.botanicalName) {
      errors.push('Botanical name is required');
    }
    
    if (!collectionEvent.location?.coordinates?.latitude || !collectionEvent.location?.coordinates?.longitude) {
      errors.push('GPS coordinates are required');
    }
    
    if (collectionEvent.quantity?.value <= 0) {
      errors.push('Collection quantity must be greater than 0');
    }
    
    // Geo-fencing validation
    if (collectionEvent.location?.coordinates) {
      const geoValidation = await this.validateGeoFencing(ctx, collectionEvent);
      if (!geoValidation.isValid) {
        errors.push(...geoValidation.errors);
      }
    }
    
    // Seasonal restrictions validation
    const seasonalValidation = await this.validateSeasonalRestrictions(ctx, collectionEvent);
    if (!seasonalValidation.isValid) {
      errors.push(...seasonalValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate geo-fencing rules
   */
  async validateGeoFencing(ctx, collectionEvent) {
    const errors = [];
    const collectionPoint = {
      latitude: collectionEvent.location.coordinates.latitude,
      longitude: collectionEvent.location.coordinates.longitude
    };
    
    // Get all approved zones
    const iterator = await ctx.stub.getStateByPartialCompositeKey('ZONE_', []);
    let isInApprovedZone = false;
    
    try {
      while (true) {
        const result = await iterator.next();
        if (result.done) break;
        
        const zone = JSON.parse(result.value.value.toString());
        const distance = geolib.getDistance(collectionPoint, zone.coordinates.center);
        
        if (distance <= zone.coordinates.radius) {
          // Check if species is allowed in this zone
          if (zone.species.includes(collectionEvent.subject.botanicalName)) {
            isInApprovedZone = true;
            collectionEvent.location.geoFence = {
              approved: true,
              zone: zone.id,
              restrictions: zone.restrictions
            };
            break;
          }
        }
      }
    } finally {
      await iterator.close();
    }
    
    if (!isInApprovedZone) {
      errors.push('Collection location is not in an approved harvesting zone for this species');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate seasonal restrictions
   */
  async validateSeasonalRestrictions(ctx, collectionEvent) {
    const errors = [];
    const collectionDate = new Date(collectionEvent.performedDateTime);
    const collectionMonth = String(collectionDate.getMonth() + 1).padStart(2, '0');
    const collectionDay = String(collectionDate.getDate()).padStart(2, '0');
    const collectionMMDD = `${collectionMonth}-${collectionDay}`;

    // This is a simplified seasonal check - in production, this would be more sophisticated
    const restrictedSeasons = {
      'Withania somnifera': { start: '04-01', end: '09-30' }, // Restricted during monsoon
      'Nardostachys jatamansi': { start: '10-01', end: '04-30' } // Restricted during winter
    };

    const restriction = restrictedSeasons[collectionEvent.subject.botanicalName];
    if (restriction) {
      // Handle year-end wrap around for seasonal restrictions
      const isRestricted = this.isDateInRestrictedSeason(collectionMMDD, restriction.start, restriction.end);
      if (isRestricted) {
        errors.push(`Collection of ${collectionEvent.subject.botanicalName} is restricted during this season`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper method to check if date falls within restricted season
   */
  isDateInRestrictedSeason(dateMMDD, startMMDD, endMMDD) {
    if (startMMDD <= endMMDD) {
      // Normal season within same year
      return dateMMDD >= startMMDD && dateMMDD <= endMMDD;
    } else {
      // Season spans across year end (e.g., Oct-Apr)
      return dateMMDD >= startMMDD || dateMMDD <= endMMDD;
    }
  }

  /**
   * Basic validation for processing steps
   */
  async validateProcessingStep(ctx, processingStep) {
    const errors = [];
    
    if (!processingStep.input?.reference) {
      errors.push('Input reference is required');
    }
    
    if (!processingStep.performer?.identifier) {
      errors.push('Processor identifier is required');
    }
    
    if (processingStep.input?.quantity?.value <= 0) {
      errors.push('Input quantity must be greater than 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Basic validation for quality tests
   */
  async validateQualityTest(ctx, qualityTest) {
    const errors = [];
    
    if (!qualityTest.subject?.reference) {
      errors.push('Sample reference is required');
    }
    
    if (!qualityTest.performer?.identifier) {
      errors.push('Laboratory identifier is required');
    }
    
    if (qualityTest.result?.value === null || qualityTest.result?.value === undefined) {
      errors.push('Test result value is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate hash for data integrity
   */
  async calculateHash(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Query all records by type
   */
  async queryAllRecords(ctx, recordType) {
    const iterator = await ctx.stub.getStateByPartialCompositeKey(recordType, []);
    const allResults = [];
    
    try {
      while (true) {
        const result = await iterator.next();
        if (result.done) break;
        
        const recordId = result.value.value.toString();
        const recordBytes = await ctx.stub.getState(recordId);
        
        if (recordBytes && recordBytes.length > 0) {
          allResults.push(JSON.parse(recordBytes.toString()));
        }
      }
    } finally {
      await iterator.close();
    }
    
    return allResults;
  }

  /**
   * Get transaction history for a record
   */
  async getRecordHistory(ctx, recordId) {
    const iterator = await ctx.stub.getHistoryForKey(recordId);
    const history = [];
    
    try {
      while (true) {
        const result = await iterator.next();
        if (result.done) break;
        
        const record = {
          txId: result.value.txId,
          timestamp: result.value.timestamp,
          isDelete: result.value.isDelete,
          value: result.value.value ? JSON.parse(result.value.value.toString()) : null
        };
        
        history.push(record);
      }
    } finally {
      await iterator.close();
    }
    
    return history;
  }
}

module.exports = HerbTraceabilityContract;
