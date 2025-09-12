/**
 * ProcessingStep Model - FHIR-style metadata bundle for herb processing events
 * Represents processing activities like drying, grinding, storage, etc.
 */

class ProcessingStep {
  constructor(data = {}) {
    this.resourceType = 'ProcessingStep';
    this.id = data.id || this.generateId();
    this.meta = {
      versionId: data.meta?.versionId || '1',
      lastUpdated: data.meta?.lastUpdated || new Date().toISOString(),
      profile: ['http://trace-herb.com/fhir/StructureDefinition/ProcessingStep']
    };
    
    // Core processing information
    this.identifier = data.identifier || [];
    this.status = data.status || 'in-progress'; // planned | in-progress | completed | cancelled
    this.category = {
      coding: [{
        system: 'http://trace-herb.com/fhir/CodeSystem/processing-category',
        code: data.category?.code || 'primary-processing',
        display: data.category?.display || 'Primary Processing'
      }]
    };
    
    // Processing type
    this.type = {
      coding: [{
        system: 'http://trace-herb.com/fhir/CodeSystem/processing-type',
        code: data.type?.code || 'drying',
        display: data.type?.display || 'Drying'
      }]
    };
    
    // Input materials (from previous step or collection)
    this.input = {
      reference: data.input?.reference || '', // Reference to CollectionEvent or previous ProcessingStep
      quantity: {
        value: data.input?.quantity?.value || 0,
        unit: data.input?.quantity?.unit || 'kg'
      },
      condition: data.input?.condition || 'fresh' // fresh | dried | processed
    };
    
    // Processing details
    this.performedPeriod = {
      start: data.performedPeriod?.start || new Date().toISOString(),
      end: data.performedPeriod?.end || null
    };
    
    this.performer = {
      reference: data.performer?.reference || '',
      display: data.performer?.display || '',
      type: data.performer?.type || 'processor', // processor | facility | cooperative
      identifier: data.performer?.identifier || '',
      contact: data.performer?.contact || {},
      certification: data.performer?.certification || []
    };
    
    // Processing facility
    this.location = {
      reference: data.location?.reference || '',
      display: data.location?.display || '',
      address: {
        facility: data.location?.address?.facility || '',
        street: data.location?.address?.street || '',
        city: data.location?.address?.city || '',
        state: data.location?.address?.state || '',
        country: data.location?.address?.country || 'India',
        postalCode: data.location?.address?.postalCode || ''
      },
      coordinates: {
        latitude: data.location?.coordinates?.latitude || 0,
        longitude: data.location?.coordinates?.longitude || 0
      },
      certification: {
        gmp: data.location?.certification?.gmp || false,
        organic: data.location?.certification?.organic || false,
        iso: data.location?.certification?.iso || []
      }
    };
    
    // Processing parameters
    this.parameters = {
      temperature: {
        value: data.parameters?.temperature?.value || 0,
        unit: data.parameters?.temperature?.unit || 'celsius',
        range: data.parameters?.temperature?.range || { min: 0, max: 0 }
      },
      humidity: {
        value: data.parameters?.humidity?.value || 0,
        unit: data.parameters?.humidity?.unit || 'percent',
        controlled: data.parameters?.humidity?.controlled || false
      },
      duration: {
        value: data.parameters?.duration?.value || 0,
        unit: data.parameters?.duration?.unit || 'hours'
      },
      pressure: {
        value: data.parameters?.pressure?.value || 0,
        unit: data.parameters?.pressure?.unit || 'bar'
      },
      additives: data.parameters?.additives || [],
      equipment: data.parameters?.equipment || []
    };
    
    // Output results
    this.output = {
      quantity: {
        value: data.output?.quantity?.value || 0,
        unit: data.output?.quantity?.unit || 'kg',
        yield: data.output?.quantity?.yield || 0 // percentage yield
      },
      condition: data.output?.condition || 'processed',
      packaging: {
        type: data.output?.packaging?.type || '',
        material: data.output?.packaging?.material || '',
        size: data.output?.packaging?.size || '',
        sealed: data.output?.packaging?.sealed || false
      },
      storage: {
        conditions: data.output?.storage?.conditions || '',
        temperature: data.output?.storage?.temperature || 0,
        humidity: data.output?.storage?.humidity || 0,
        location: data.output?.storage?.location || ''
      }
    };
    
    // Quality control during processing
    this.qualityControl = {
      monitoring: {
        continuous: data.qualityControl?.monitoring?.continuous || false,
        intervals: data.qualityControl?.monitoring?.intervals || 0,
        parameters: data.qualityControl?.monitoring?.parameters || []
      },
      testing: {
        inProcess: data.qualityControl?.testing?.inProcess || [],
        final: data.qualityControl?.testing?.final || []
      },
      deviations: data.qualityControl?.deviations || [],
      corrective: data.qualityControl?.corrective || []
    };
    
    // Environmental impact
    this.environmental = {
      energy: {
        consumption: data.environmental?.energy?.consumption || 0,
        source: data.environmental?.energy?.source || 'grid',
        renewable: data.environmental?.energy?.renewable || false
      },
      water: {
        usage: data.environmental?.water?.usage || 0,
        treatment: data.environmental?.water?.treatment || false,
        recycled: data.environmental?.water?.recycled || false
      },
      waste: {
        generated: data.environmental?.waste?.generated || 0,
        recycled: data.environmental?.waste?.recycled || 0,
        disposal: data.environmental?.waste?.disposal || ''
      },
      emissions: {
        co2: data.environmental?.emissions?.co2 || 0,
        other: data.environmental?.emissions?.other || []
      }
    };
    
    // Compliance and certifications
    this.compliance = {
      gmp: {
        compliant: data.compliance?.gmp?.compliant || false,
        certificate: data.compliance?.gmp?.certificate || '',
        expiry: data.compliance?.gmp?.expiry || null
      },
      organic: {
        certified: data.compliance?.organic?.certified || false,
        certifier: data.compliance?.organic?.certifier || '',
        certificate: data.compliance?.organic?.certificate || ''
      },
      ayush: {
        compliant: data.compliance?.ayush?.compliant || false,
        license: data.compliance?.ayush?.license || '',
        guidelines: data.compliance?.ayush?.guidelines || []
      }
    };
    
    // Documentation
    this.documentation = {
      photos: data.documentation?.photos || [],
      videos: data.documentation?.videos || [],
      certificates: data.documentation?.certificates || [],
      reports: data.documentation?.reports || [],
      sop: data.documentation?.sop || '',
      notes: data.documentation?.notes || ''
    };
    
    // Blockchain metadata
    this.blockchain = {
      transactionId: data.blockchain?.transactionId || '',
      blockNumber: data.blockchain?.blockNumber || 0,
      timestamp: data.blockchain?.timestamp || new Date().toISOString(),
      hash: data.blockchain?.hash || '',
      previousHash: data.blockchain?.previousHash || ''
    };
  }
  
  generateId() {
    return `processing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  validate() {
    const errors = [];
    
    if (!this.input.reference) {
      errors.push('Input reference is required');
    }
    
    if (!this.performer.identifier) {
      errors.push('Processor identifier is required');
    }
    
    if (this.input.quantity.value <= 0) {
      errors.push('Input quantity must be greater than 0');
    }
    
    if (!this.performedPeriod.start) {
      errors.push('Processing start time is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  toJSON() {
    return {
      resourceType: this.resourceType,
      id: this.id,
      meta: this.meta,
      identifier: this.identifier,
      status: this.status,
      category: this.category,
      type: this.type,
      input: this.input,
      performedPeriod: this.performedPeriod,
      performer: this.performer,
      location: this.location,
      parameters: this.parameters,
      output: this.output,
      qualityControl: this.qualityControl,
      environmental: this.environmental,
      compliance: this.compliance,
      documentation: this.documentation,
      blockchain: this.blockchain
    };
  }
}

module.exports = ProcessingStep;
