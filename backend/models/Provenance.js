/**
 * Provenance Model - FHIR-style metadata bundle for complete supply chain provenance
 * Represents the complete journey of an herb from collection to final product
 */

class Provenance {
  constructor(data = {}) {
    this.resourceType = 'Provenance';
    this.id = data.id || this.generateId();
    this.meta = {
      versionId: data.meta?.versionId || '1',
      lastUpdated: data.meta?.lastUpdated || new Date().toISOString(),
      profile: ['http://trace-herb.com/fhir/StructureDefinition/Provenance']
    };
    
    // Core provenance information
    this.identifier = data.identifier || [];
    this.target = {
      reference: data.target?.reference || '', // Reference to final product
      display: data.target?.display || '',
      productId: data.target?.productId || '',
      batchNumber: data.target?.batchNumber || '',
      qrCode: data.target?.qrCode || ''
    };
    
    // Provenance period
    this.occurredPeriod = {
      start: data.occurredPeriod?.start || null, // First collection event
      end: data.occurredPeriod?.end || new Date().toISOString() // Final packaging
    };
    
    this.recorded = data.recorded || new Date().toISOString();
    
    // Supply chain participants
    this.agent = data.agent || [];
    
    // Complete supply chain journey
    this.activity = {
      coding: [{
        system: 'http://trace-herb.com/fhir/CodeSystem/provenance-activity',
        code: data.activity?.code || 'supply-chain',
        display: data.activity?.display || 'Supply Chain Traceability'
      }]
    };
    
    // Supply chain events in chronological order
    this.events = data.events || [];
    
    // Product information
    this.product = {
      name: data.product?.name || '',
      botanicalName: data.product?.botanicalName || '',
      commonName: data.product?.commonName || '',
      ayurvedicName: data.product?.ayurvedicName || '',
      formulation: data.product?.formulation || '',
      strength: data.product?.strength || '',
      dosageForm: data.product?.dosageForm || '',
      packSize: data.product?.packSize || '',
      manufacturer: data.product?.manufacturer || '',
      license: data.product?.license || ''
    };
    
    // Geographic journey
    this.geography = {
      origin: {
        coordinates: data.geography?.origin?.coordinates || { latitude: 0, longitude: 0 },
        address: data.geography?.origin?.address || {},
        region: data.geography?.origin?.region || '',
        biodiversityHotspot: data.geography?.origin?.biodiversityHotspot || false
      },
      journey: data.geography?.journey || [], // Array of locations
      destination: {
        coordinates: data.geography?.destination?.coordinates || { latitude: 0, longitude: 0 },
        address: data.geography?.destination?.address || {},
        market: data.geography?.destination?.market || ''
      }
    };
    
    // Quality journey
    this.quality = {
      collectionGrade: data.quality?.collectionGrade || '',
      processingStandards: data.quality?.processingStandards || [],
      testResults: data.quality?.testResults || [],
      certifications: data.quality?.certifications || [],
      compliance: {
        pharmacopoeia: data.quality?.compliance?.pharmacopoeia || [],
        organic: data.quality?.compliance?.organic || false,
        fairTrade: data.quality?.compliance?.fairTrade || false,
        gmp: data.quality?.compliance?.gmp || false
      }
    };
    
    // Sustainability metrics
    this.sustainability = {
      conservation: {
        status: data.sustainability?.conservation?.status || 'least-concern',
        permit: data.sustainability?.conservation?.permit || '',
        quota: data.sustainability?.conservation?.quota || 0,
        harvested: data.sustainability?.conservation?.harvested || 0
      },
      environmental: {
        carbonFootprint: data.sustainability?.environmental?.carbonFootprint || 0,
        waterUsage: data.sustainability?.environmental?.waterUsage || 0,
        energyConsumption: data.sustainability?.environmental?.energyConsumption || 0,
        wasteGenerated: data.sustainability?.environmental?.wasteGenerated || 0
      },
      social: {
        fairTrade: data.sustainability?.social?.fairTrade || false,
        communityBenefit: data.sustainability?.social?.communityBenefit || 0,
        farmerPremium: data.sustainability?.social?.farmerPremium || 0,
        genderEquity: data.sustainability?.social?.genderEquity || false
      }
    };
    
    // Economic data
    this.economics = {
      farmGatePrice: data.economics?.farmGatePrice || 0,
      processingCost: data.economics?.processingCost || 0,
      testingCost: data.economics?.testingCost || 0,
      logisticsCost: data.economics?.logisticsCost || 0,
      retailPrice: data.economics?.retailPrice || 0,
      valueAddition: data.economics?.valueAddition || 0,
      currency: data.economics?.currency || 'INR'
    };
    
    // Traceability metrics
    this.traceability = {
      completeness: data.traceability?.completeness || 0, // Percentage
      accuracy: data.traceability?.accuracy || 0, // Percentage
      timeliness: data.traceability?.timeliness || 0, // Average delay in hours
      transparency: data.traceability?.transparency || 0, // Transparency score
      verifiability: data.traceability?.verifiability || 0 // Verification score
    };
    
    // Consumer information
    this.consumer = {
      scanCount: data.consumer?.scanCount || 0,
      firstScan: data.consumer?.firstScan || null,
      lastScan: data.consumer?.lastScan || null,
      locations: data.consumer?.locations || [],
      feedback: data.consumer?.feedback || [],
      rating: data.consumer?.rating || 0
    };
    
    // Regulatory compliance
    this.regulatory = {
      ayush: {
        compliant: data.regulatory?.ayush?.compliant || false,
        license: data.regulatory?.ayush?.license || '',
        guidelines: data.regulatory?.ayush?.guidelines || []
      },
      fssai: {
        compliant: data.regulatory?.fssai?.compliant || false,
        license: data.regulatory?.fssai?.license || '',
        category: data.regulatory?.fssai?.category || ''
      },
      export: {
        eligible: data.regulatory?.export?.eligible || false,
        countries: data.regulatory?.export?.countries || [],
        certificates: data.regulatory?.export?.certificates || []
      },
      cites: {
        required: data.regulatory?.cites?.required || false,
        permit: data.regulatory?.cites?.permit || '',
        appendix: data.regulatory?.cites?.appendix || ''
      }
    };
    
    // Risk assessment
    this.risk = {
      adulteration: {
        risk: data.risk?.adulteration?.risk || 'low',
        factors: data.risk?.adulteration?.factors || [],
        mitigation: data.risk?.adulteration?.mitigation || []
      },
      contamination: {
        risk: data.risk?.contamination?.risk || 'low',
        sources: data.risk?.contamination?.sources || [],
        controls: data.risk?.contamination?.controls || []
      },
      authenticity: {
        confidence: data.risk?.authenticity?.confidence || 'high',
        verification: data.risk?.authenticity?.verification || [],
        dnaConfirmed: data.risk?.authenticity?.dnaConfirmed || false
      }
    };
    
    // Documentation
    this.documentation = {
      certificates: data.documentation?.certificates || [],
      reports: data.documentation?.reports || [],
      photos: data.documentation?.photos || [],
      videos: data.documentation?.videos || [],
      testimonials: data.documentation?.testimonials || [],
      stories: data.documentation?.stories || []
    };
    
    // Blockchain metadata
    this.blockchain = {
      networkId: data.blockchain?.networkId || '',
      channelId: data.blockchain?.channelId || '',
      chaincodeId: data.blockchain?.chaincodeId || '',
      transactionIds: data.blockchain?.transactionIds || [],
      blockNumbers: data.blockchain?.blockNumbers || [],
      merkleRoot: data.blockchain?.merkleRoot || '',
      timestamp: data.blockchain?.timestamp || new Date().toISOString()
    };
  }
  
  generateId() {
    return `provenance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  addEvent(event) {
    this.events.push({
      id: event.id,
      type: event.resourceType,
      timestamp: event.meta.lastUpdated,
      reference: event.id,
      summary: this.generateEventSummary(event)
    });
    
    // Sort events by timestamp
    this.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Update provenance period
    if (this.events.length > 0) {
      this.occurredPeriod.start = this.events[0].timestamp;
      this.occurredPeriod.end = this.events[this.events.length - 1].timestamp;
    }
  }
  
  generateEventSummary(event) {
    switch (event.resourceType) {
      case 'CollectionEvent':
        return `Collected ${event.quantity.value}${event.quantity.unit} of ${event.subject.botanicalName} from ${event.location.address.village}, ${event.location.address.district}`;
      case 'ProcessingStep':
        return `${event.type.coding[0].display} processing completed with ${event.output.quantity.yield}% yield`;
      case 'QualityTest':
        return `${event.code.coding[0].display} test completed with result: ${event.result.value} ${event.result.unit}`;
      default:
        return `${event.resourceType} event recorded`;
    }
  }
  
  calculateTraceabilityScore() {
    const weights = {
      completeness: 0.3,
      accuracy: 0.25,
      timeliness: 0.2,
      transparency: 0.15,
      verifiability: 0.1
    };
    
    return (
      this.traceability.completeness * weights.completeness +
      this.traceability.accuracy * weights.accuracy +
      (100 - this.traceability.timeliness) * weights.timeliness + // Lower delay is better
      this.traceability.transparency * weights.transparency +
      this.traceability.verifiability * weights.verifiability
    );
  }
  
  validate() {
    const errors = [];
    
    if (!this.target.reference) {
      errors.push('Target product reference is required');
    }
    
    if (this.events.length === 0) {
      errors.push('At least one supply chain event is required');
    }
    
    if (!this.product.botanicalName) {
      errors.push('Product botanical name is required');
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
      target: this.target,
      occurredPeriod: this.occurredPeriod,
      recorded: this.recorded,
      agent: this.agent,
      activity: this.activity,
      events: this.events,
      product: this.product,
      geography: this.geography,
      quality: this.quality,
      sustainability: this.sustainability,
      economics: this.economics,
      traceability: this.traceability,
      consumer: this.consumer,
      regulatory: this.regulatory,
      risk: this.risk,
      documentation: this.documentation,
      blockchain: this.blockchain
    };
  }
}

module.exports = Provenance;
