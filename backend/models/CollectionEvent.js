/**
 * CollectionEvent Model - FHIR-style metadata bundle for herb collection events
 * Represents the initial harvest/collection of medicinal plants with geo-tagged data
 */

class CollectionEvent {
  constructor(data = {}) {
    this.resourceType = 'CollectionEvent';
    this.id = data.id || this.generateId();
    this.meta = {
      versionId: data.meta?.versionId || '1',
      lastUpdated: data.meta?.lastUpdated || new Date().toISOString(),
      profile: ['http://trace-herb.com/fhir/StructureDefinition/CollectionEvent']
    };
    
    // Core collection information
    this.identifier = data.identifier || [];
    this.status = data.status || 'active'; // active | completed | cancelled
    this.category = {
      coding: [{
        system: 'http://trace-herb.com/fhir/CodeSystem/collection-category',
        code: data.category?.code || 'wild-collection',
        display: data.category?.display || 'Wild Collection'
      }]
    };
    
    // Plant/herb information
    this.subject = {
      reference: data.subject?.reference || '',
      display: data.subject?.display || '',
      botanicalName: data.subject?.botanicalName || '',
      commonName: data.subject?.commonName || '',
      ayurvedicName: data.subject?.ayurvedicName || '',
      partUsed: data.subject?.partUsed || [] // roots, leaves, bark, etc.
    };
    
    // Collection details
    this.performedDateTime = data.performedDateTime || new Date().toISOString();
    this.performer = {
      reference: data.performer?.reference || '',
      display: data.performer?.display || '',
      type: data.performer?.type || 'collector', // collector | farmer | cooperative
      identifier: data.performer?.identifier || '',
      contact: data.performer?.contact || {}
    };
    
    // Geographic information
    this.location = {
      reference: data.location?.reference || '',
      display: data.location?.display || '',
      coordinates: {
        latitude: data.location?.coordinates?.latitude || 0,
        longitude: data.location?.coordinates?.longitude || 0,
        altitude: data.location?.coordinates?.altitude || 0,
        accuracy: data.location?.coordinates?.accuracy || 0
      },
      address: {
        village: data.location?.address?.village || '',
        district: data.location?.address?.district || '',
        state: data.location?.address?.state || '',
        country: data.location?.address?.country || 'India',
        postalCode: data.location?.address?.postalCode || ''
      },
      geoFence: {
        approved: data.location?.geoFence?.approved || false,
        zone: data.location?.geoFence?.zone || '',
        restrictions: data.location?.geoFence?.restrictions || []
      }
    };
    
    // Environmental conditions
    this.environment = {
      weather: {
        temperature: data.environment?.weather?.temperature || 0,
        humidity: data.environment?.weather?.humidity || 0,
        rainfall: data.environment?.weather?.rainfall || 0,
        season: data.environment?.weather?.season || ''
      },
      soil: {
        type: data.environment?.soil?.type || '',
        ph: data.environment?.soil?.ph || 0,
        moisture: data.environment?.soil?.moisture || 0,
        organic: data.environment?.soil?.organic || false
      },
      cultivation: {
        method: data.environment?.cultivation?.method || 'wild', // wild | organic | conventional
        pesticides: data.environment?.cultivation?.pesticides || false,
        fertilizers: data.environment?.cultivation?.fertilizers || [],
        irrigation: data.environment?.cultivation?.irrigation || 'natural'
      }
    };
    
    // Collection metrics
    this.quantity = {
      value: data.quantity?.value || 0,
      unit: data.quantity?.unit || 'kg',
      estimatedYield: data.quantity?.estimatedYield || 0
    };
    
    // Quality assessment at collection
    this.qualityAssessment = {
      visualInspection: {
        color: data.qualityAssessment?.visualInspection?.color || '',
        texture: data.qualityAssessment?.visualInspection?.texture || '',
        aroma: data.qualityAssessment?.visualInspection?.aroma || '',
        defects: data.qualityAssessment?.visualInspection?.defects || []
      },
      maturity: {
        stage: data.qualityAssessment?.maturity?.stage || '',
        optimal: data.qualityAssessment?.maturity?.optimal || false
      },
      contamination: {
        visible: data.qualityAssessment?.contamination?.visible || false,
        type: data.qualityAssessment?.contamination?.type || []
      }
    };
    
    // Sustainability compliance
    this.sustainability = {
      harvestingPractices: {
        sustainable: data.sustainability?.harvestingPractices?.sustainable || false,
        method: data.sustainability?.harvestingPractices?.method || '',
        regeneration: data.sustainability?.harvestingPractices?.regeneration || false
      },
      conservation: {
        endangered: data.sustainability?.conservation?.endangered || false,
        permit: data.sustainability?.conservation?.permit || '',
        quota: data.sustainability?.conservation?.quota || 0
      },
      fairTrade: {
        certified: data.sustainability?.fairTrade?.certified || false,
        price: data.sustainability?.fairTrade?.price || 0,
        premium: data.sustainability?.fairTrade?.premium || 0
      }
    };
    
    // Documentation
    this.documentation = {
      photos: data.documentation?.photos || [],
      certificates: data.documentation?.certificates || [],
      permits: data.documentation?.permits || [],
      notes: data.documentation?.notes || ''
    };
    
    // Blockchain metadata
    this.blockchain = {
      transactionId: data.blockchain?.transactionId || '',
      blockNumber: data.blockchain?.blockNumber || 0,
      timestamp: data.blockchain?.timestamp || new Date().toISOString(),
      hash: data.blockchain?.hash || ''
    };
  }
  
  generateId() {
    return `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  validate() {
    const errors = [];
    
    if (!this.subject.botanicalName) {
      errors.push('Botanical name is required');
    }
    
    if (!this.performer.identifier) {
      errors.push('Collector identifier is required');
    }
    
    if (!this.location.coordinates.latitude || !this.location.coordinates.longitude) {
      errors.push('GPS coordinates are required');
    }
    
    if (this.quantity.value <= 0) {
      errors.push('Collection quantity must be greater than 0');
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
      subject: this.subject,
      performedDateTime: this.performedDateTime,
      performer: this.performer,
      location: this.location,
      environment: this.environment,
      quantity: this.quantity,
      qualityAssessment: this.qualityAssessment,
      sustainability: this.sustainability,
      documentation: this.documentation,
      blockchain: this.blockchain
    };
  }
}

module.exports = CollectionEvent;
