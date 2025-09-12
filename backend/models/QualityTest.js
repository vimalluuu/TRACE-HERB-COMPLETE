/**
 * QualityTest Model - FHIR-style metadata bundle for laboratory testing events
 * Represents quality testing activities including chemical, microbiological, and DNA testing
 */

class QualityTest {
  constructor(data = {}) {
    this.resourceType = 'QualityTest';
    this.id = data.id || this.generateId();
    this.meta = {
      versionId: data.meta?.versionId || '1',
      lastUpdated: data.meta?.lastUpdated || new Date().toISOString(),
      profile: ['http://trace-herb.com/fhir/StructureDefinition/QualityTest']
    };
    
    // Core test information
    this.identifier = data.identifier || [];
    this.status = data.status || 'registered'; // registered | partial | preliminary | final | amended | cancelled
    this.category = {
      coding: [{
        system: 'http://trace-herb.com/fhir/CodeSystem/test-category',
        code: data.category?.code || 'chemical',
        display: data.category?.display || 'Chemical Analysis'
      }]
    };
    
    // Test type
    this.code = {
      coding: [{
        system: 'http://trace-herb.com/fhir/CodeSystem/test-code',
        code: data.code?.code || 'moisture-content',
        display: data.code?.display || 'Moisture Content'
      }]
    };
    
    // Sample information
    this.subject = {
      reference: data.subject?.reference || '', // Reference to CollectionEvent or ProcessingStep
      display: data.subject?.display || '',
      sampleId: data.subject?.sampleId || '',
      batchId: data.subject?.batchId || '',
      quantity: {
        value: data.subject?.quantity?.value || 0,
        unit: data.subject?.quantity?.unit || 'g'
      }
    };
    
    // Test execution details
    this.effectiveDateTime = data.effectiveDateTime || new Date().toISOString();
    this.issued = data.issued || null;
    
    this.performer = {
      reference: data.performer?.reference || '',
      display: data.performer?.display || '',
      type: data.performer?.type || 'laboratory',
      identifier: data.performer?.identifier || '',
      accreditation: {
        nabl: data.performer?.accreditation?.nabl || false,
        iso17025: data.performer?.accreditation?.iso17025 || false,
        certificate: data.performer?.accreditation?.certificate || '',
        scope: data.performer?.accreditation?.scope || []
      }
    };
    
    // Laboratory information
    this.location = {
      reference: data.location?.reference || '',
      display: data.location?.display || '',
      address: {
        laboratory: data.location?.address?.laboratory || '',
        street: data.location?.address?.street || '',
        city: data.location?.address?.city || '',
        state: data.location?.address?.state || '',
        country: data.location?.address?.country || 'India',
        postalCode: data.location?.address?.postalCode || ''
      },
      contact: data.location?.contact || {}
    };
    
    // Test methodology
    this.method = {
      coding: [{
        system: 'http://trace-herb.com/fhir/CodeSystem/test-method',
        code: data.method?.code || 'standard',
        display: data.method?.display || 'Standard Method'
      }],
      reference: data.method?.reference || '', // Reference to SOP or standard
      equipment: data.method?.equipment || [],
      reagents: data.method?.reagents || [],
      conditions: {
        temperature: data.method?.conditions?.temperature || 0,
        humidity: data.method?.conditions?.humidity || 0,
        pressure: data.method?.conditions?.pressure || 0
      }
    };
    
    // Test results
    this.result = {
      value: data.result?.value || null,
      unit: data.result?.unit || '',
      interpretation: {
        coding: [{
          system: 'http://trace-herb.com/fhir/CodeSystem/test-interpretation',
          code: data.result?.interpretation?.code || 'normal',
          display: data.result?.interpretation?.display || 'Normal'
        }]
      },
      referenceRange: {
        low: data.result?.referenceRange?.low || null,
        high: data.result?.referenceRange?.high || null,
        unit: data.result?.referenceRange?.unit || '',
        type: data.result?.referenceRange?.type || 'normal'
      },
      component: data.result?.component || [] // For multi-component tests
    };
    
    // Specific test types
    this.testTypes = {
      chemical: {
        moisture: data.testTypes?.chemical?.moisture || null,
        ash: {
          total: data.testTypes?.chemical?.ash?.total || null,
          acidInsoluble: data.testTypes?.chemical?.ash?.acidInsoluble || null,
          waterSoluble: data.testTypes?.chemical?.ash?.waterSoluble || null
        },
        extractives: {
          waterSoluble: data.testTypes?.chemical?.extractives?.waterSoluble || null,
          alcoholSoluble: data.testTypes?.chemical?.extractives?.alcoholSoluble || null
        },
        volatileOil: data.testTypes?.chemical?.volatileOil || null,
        activeCompounds: data.testTypes?.chemical?.activeCompounds || []
      },
      microbiological: {
        totalBacterialCount: data.testTypes?.microbiological?.totalBacterialCount || null,
        yeastMold: data.testTypes?.microbiological?.yeastMold || null,
        pathogenicBacteria: {
          salmonella: data.testTypes?.microbiological?.pathogenicBacteria?.salmonella || 'absent',
          ecoli: data.testTypes?.microbiological?.pathogenicBacteria?.ecoli || 'absent',
          staphylococcus: data.testTypes?.microbiological?.pathogenicBacteria?.staphylococcus || 'absent'
        },
        aflatoxins: data.testTypes?.microbiological?.aflatoxins || null
      },
      pesticides: {
        organochlorines: data.testTypes?.pesticides?.organochlorines || [],
        organophosphates: data.testTypes?.pesticides?.organophosphates || [],
        carbamates: data.testTypes?.pesticides?.carbamates || [],
        pyrethroids: data.testTypes?.pesticides?.pyrethroids || []
      },
      heavyMetals: {
        lead: data.testTypes?.heavyMetals?.lead || null,
        cadmium: data.testTypes?.heavyMetals?.cadmium || null,
        mercury: data.testTypes?.heavyMetals?.mercury || null,
        arsenic: data.testTypes?.heavyMetals?.arsenic || null
      },
      dna: {
        species: data.testTypes?.dna?.species || '',
        authenticity: data.testTypes?.dna?.authenticity || false,
        adulteration: data.testTypes?.dna?.adulteration || false,
        sequence: data.testTypes?.dna?.sequence || '',
        database: data.testTypes?.dna?.database || 'GenBank'
      }
    };
    
    // Quality assurance
    this.qualityAssurance = {
      calibration: {
        date: data.qualityAssurance?.calibration?.date || null,
        certificate: data.qualityAssurance?.calibration?.certificate || '',
        valid: data.qualityAssurance?.calibration?.valid || false
      },
      controls: {
        positive: data.qualityAssurance?.controls?.positive || null,
        negative: data.qualityAssurance?.controls?.negative || null,
        blank: data.qualityAssurance?.controls?.blank || null
      },
      repeatability: {
        rsd: data.qualityAssurance?.repeatability?.rsd || null,
        acceptable: data.qualityAssurance?.repeatability?.acceptable || false
      },
      recovery: {
        percentage: data.qualityAssurance?.recovery?.percentage || null,
        acceptable: data.qualityAssurance?.recovery?.acceptable || false
      }
    };
    
    // Compliance assessment
    this.compliance = {
      pharmacopoeia: {
        ip: data.compliance?.pharmacopoeia?.ip || false,
        usp: data.compliance?.pharmacopoeia?.usp || false,
        bp: data.compliance?.pharmacopoeia?.bp || false,
        who: data.compliance?.pharmacopoeia?.who || false
      },
      ayush: {
        compliant: data.compliance?.ayush?.compliant || false,
        guidelines: data.compliance?.ayush?.guidelines || [],
        deviations: data.compliance?.ayush?.deviations || []
      },
      export: {
        compliant: data.compliance?.export?.compliant || false,
        countries: data.compliance?.export?.countries || [],
        certificates: data.compliance?.export?.certificates || []
      }
    };
    
    // Documentation
    this.documentation = {
      certificate: data.documentation?.certificate || '',
      report: data.documentation?.report || '',
      chromatograms: data.documentation?.chromatograms || [],
      spectra: data.documentation?.spectra || [],
      photos: data.documentation?.photos || [],
      rawData: data.documentation?.rawData || '',
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
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  validate() {
    const errors = [];
    
    if (!this.subject.reference) {
      errors.push('Sample reference is required');
    }
    
    if (!this.performer.identifier) {
      errors.push('Laboratory identifier is required');
    }
    
    if (!this.effectiveDateTime) {
      errors.push('Test date is required');
    }
    
    if (this.result.value === null || this.result.value === undefined) {
      errors.push('Test result value is required');
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
      code: this.code,
      subject: this.subject,
      effectiveDateTime: this.effectiveDateTime,
      issued: this.issued,
      performer: this.performer,
      location: this.location,
      method: this.method,
      result: this.result,
      testTypes: this.testTypes,
      qualityAssurance: this.qualityAssurance,
      compliance: this.compliance,
      documentation: this.documentation,
      blockchain: this.blockchain
    };
  }
}

module.exports = QualityTest;
