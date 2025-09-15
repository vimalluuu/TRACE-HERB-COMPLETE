const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Regulatory & Export Ready Service
 * Handles GS1/FHIR compliance and automated export certificate generation
 */
class RegulatoryService {
  constructor() {
    // GS1 Configuration
    this.gs1Config = {
      companyPrefix: '890123456', // Mock GS1 company prefix
      applicationIdentifiers: {
        GTIN: '01',
        BATCH_LOT: '10',
        EXPIRY_DATE: '17',
        PRODUCTION_DATE: '11',
        SERIAL_NUMBER: '21',
        WEIGHT: '3103',
        ORIGIN: '422'
      },
      standards: ['GS1-128', 'DataMatrix', 'QR Code']
    };

    // FHIR Configuration
    this.fhirConfig = {
      version: 'R4',
      baseUrl: 'https://api.trace-herb.com/fhir',
      resourceTypes: [
        'Medication',
        'MedicationKnowledge',
        'Substance',
        'Organization',
        'Location',
        'Device',
        'Provenance'
      ]
    };

    // Export Compliance Standards
    this.exportStandards = {
      FDA: {
        required: ['DUNS', 'FDA_REGISTRATION', 'PROCESS_FILING'],
        documents: ['Certificate of Analysis', 'Good Manufacturing Practice']
      },
      EU: {
        required: ['EORI', 'CE_MARKING', 'REACH_COMPLIANCE'],
        documents: ['Phytosanitary Certificate', 'Health Certificate']
      },
      AYUSH: {
        required: ['AYUSH_LICENSE', 'GMP_CERTIFICATE', 'QUALITY_CONTROL'],
        documents: ['Ayurvedic Pharmacopoeia Compliance', 'Heavy Metal Analysis']
      },
      WHO: {
        required: ['WHO_GMP', 'QUALITY_ASSURANCE', 'TRACEABILITY'],
        documents: ['WHO Certificate', 'Quality Management System']
      }
    };

    // Mock databases
    this.gs1Records = new Map();
    this.fhirResources = new Map();
    this.exportCertificates = new Map();
    this.complianceReports = [];
  }

  /**
   * Generate GS1-compliant identifiers and barcodes
   * @param {object} productData - Product information
   * @param {string} batchId - Batch identifier
   * @returns {object} GS1 compliance result
   */
  async generateGS1Compliance(productData, batchId) {
    try {
      console.log('Generating GS1 compliance data...');

      // Generate GTIN (Global Trade Item Number)
      const gtin = this.generateGTIN(productData);
      
      // Generate GS1-128 barcode data
      const gs1Data = this.generateGS1BarcodeData(productData, batchId, gtin);
      
      // Generate DataMatrix code
      const dataMatrix = this.generateDataMatrix(gs1Data);
      
      // Generate compliance report
      const complianceReport = await this.generateGS1ComplianceReport(productData, gs1Data);

      // Store GS1 record
      const gs1Id = this.generateGS1Id();
      this.gs1Records.set(gs1Id, {
        gtin,
        gs1Data,
        dataMatrix,
        complianceReport,
        productData,
        batchId,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        gs1Id,
        gtin,
        gs1BarcodeData: gs1Data,
        dataMatrix,
        complianceReport,
        standards: {
          gs1_128: true,
          dataMatrix: true,
          qrCode: true,
          ean_upc: true
        },
        verification: {
          gtinValid: this.validateGTIN(gtin),
          barcodeValid: this.validateBarcode(gs1Data),
          complianceLevel: 'Full GS1 Compliance'
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('GS1 Compliance Error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate FHIR-compliant healthcare data
   * @param {object} herbData - Herbal product data
   * @param {object} organizationData - Organization information
   * @returns {object} FHIR compliance result
   */
  async generateFHIRCompliance(herbData, organizationData) {
    try {
      console.log('Generating FHIR compliance data...');

      // Generate FHIR resources
      const medication = this.generateMedicationResource(herbData);
      const medicationKnowledge = this.generateMedicationKnowledgeResource(herbData);
      const substance = this.generateSubstanceResource(herbData);
      const organization = this.generateOrganizationResource(organizationData);
      const location = this.generateLocationResource(organizationData);
      const provenance = this.generateProvenanceResource(herbData, organizationData);

      const fhirBundle = {
        resourceType: 'Bundle',
        id: this.generateFHIRId(),
        type: 'collection',
        timestamp: new Date().toISOString(),
        entry: [
          { resource: medication },
          { resource: medicationKnowledge },
          { resource: substance },
          { resource: organization },
          { resource: location },
          { resource: provenance }
        ]
      };

      // Validate FHIR bundle
      const validation = await this.validateFHIRBundle(fhirBundle);

      // Store FHIR resource
      const fhirId = fhirBundle.id;
      this.fhirResources.set(fhirId, {
        bundle: fhirBundle,
        validation,
        herbData,
        organizationData,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        fhirId,
        bundle: fhirBundle,
        validation,
        endpoints: {
          medication: `${this.fhirConfig.baseUrl}/Medication/${medication.id}`,
          substance: `${this.fhirConfig.baseUrl}/Substance/${substance.id}`,
          organization: `${this.fhirConfig.baseUrl}/Organization/${organization.id}`,
          provenance: `${this.fhirConfig.baseUrl}/Provenance/${provenance.id}`
        },
        compliance: {
          fhirVersion: this.fhirConfig.version,
          resourceCount: fhirBundle.entry.length,
          validationStatus: validation.valid ? 'Valid' : 'Invalid',
          interoperabilityLevel: 'Full FHIR R4 Compliance'
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('FHIR Compliance Error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate automated export certificates
   * @param {object} productData - Product information
   * @param {string} destinationCountry - Target export country
   * @param {array} requiredCertificates - Required certificate types
   * @returns {object} Export certificate result
   */
  async generateExportCertificates(productData, destinationCountry, requiredCertificates) {
    try {
      console.log(`Generating export certificates for ${destinationCountry}...`);

      const certificates = [];
      const complianceChecks = [];

      // Determine compliance standards based on destination
      const standards = this.getComplianceStandards(destinationCountry);
      
      // Generate required certificates
      for (const certType of requiredCertificates) {
        const certificate = await this.generateCertificate(certType, productData, destinationCountry);
        certificates.push(certificate);
        
        // Perform compliance check
        const complianceCheck = await this.performComplianceCheck(certType, productData, standards);
        complianceChecks.push(complianceCheck);
      }

      // Generate master export document
      const exportDocument = this.generateExportDocument(productData, destinationCountry, certificates);
      
      // Calculate overall compliance score
      const complianceScore = this.calculateComplianceScore(complianceChecks);

      // Store export certificate
      const exportId = this.generateExportId();
      this.exportCertificates.set(exportId, {
        exportDocument,
        certificates,
        complianceChecks,
        complianceScore,
        productData,
        destinationCountry,
        standards,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        exportId,
        exportDocument,
        certificates,
        complianceScore,
        destinationCountry,
        standards: standards.required,
        requiredDocuments: standards.documents,
        complianceStatus: complianceScore >= 85 ? 'Export Ready' : 'Additional Requirements Needed',
        validityPeriod: '12 months',
        digitalSignature: this.generateDigitalSignature(exportDocument),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Export Certificate Error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // GS1 Helper Methods
  generateGTIN(productData) {
    // Generate 14-digit GTIN
    const companyPrefix = this.gs1Config.companyPrefix;
    const itemReference = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    const indicator = '0';
    
    const partial = indicator + companyPrefix + itemReference;
    const checkDigit = this.calculateGTINCheckDigit(partial);
    
    return partial + checkDigit;
  }

  generateGS1BarcodeData(productData, batchId, gtin) {
    const ai = this.gs1Config.applicationIdentifiers;
    const expiryDate = this.formatGS1Date(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)); // 1 year from now
    const productionDate = this.formatGS1Date(new Date());
    const weight = Math.floor(parseFloat(productData.quantity || 5) * 1000); // Convert to grams
    
    return {
      gtin: `${ai.GTIN}${gtin}`,
      batchLot: `${ai.BATCH_LOT}${batchId}`,
      expiryDate: `${ai.EXPIRY_DATE}${expiryDate}`,
      productionDate: `${ai.PRODUCTION_DATE}${productionDate}`,
      weight: `${ai.WEIGHT}${weight.toString().padStart(6, '0')}`,
      origin: `${ai.ORIGIN}356`, // India country code
      fullBarcode: `${ai.GTIN}${gtin}${ai.BATCH_LOT}${batchId}${ai.EXPIRY_DATE}${expiryDate}${ai.PRODUCTION_DATE}${productionDate}`
    };
  }

  generateDataMatrix(gs1Data) {
    // Mock DataMatrix generation
    return {
      format: 'DataMatrix',
      size: '32x32',
      data: gs1Data.fullBarcode,
      encoding: 'ASCII',
      errorCorrection: 'Reed-Solomon'
    };
  }

  async generateGS1ComplianceReport(productData, gs1Data) {
    return {
      complianceLevel: 'Full GS1 Compliance',
      standards: ['GS1 General Specifications', 'GS1-128', 'DataMatrix'],
      checklist: [
        { item: 'Valid GTIN assigned', status: 'Compliant', details: 'GTIN follows GS1 standards' },
        { item: 'Batch/Lot identification', status: 'Compliant', details: 'AI (10) implemented' },
        { item: 'Date formatting', status: 'Compliant', details: 'YYMMDD format used' },
        { item: 'Weight/Measure', status: 'Compliant', details: 'AI (3103) for net weight' },
        { item: 'Country of origin', status: 'Compliant', details: 'AI (422) for India' }
      ],
      score: 100,
      recommendations: []
    };
  }

  // FHIR Helper Methods
  generateMedicationResource(herbData) {
    return {
      resourceType: 'Medication',
      id: this.generateResourceId(),
      status: 'active',
      code: {
        coding: [{
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: this.getAyurvedicCode(herbData.commonName),
          display: herbData.commonName
        }],
        text: herbData.commonName
      },
      manufacturer: {
        reference: 'Organization/trace-herb-farmers'
      },
      form: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '421026006',
          display: 'Oral form'
        }]
      },
      ingredient: [{
        itemCodeableConcept: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: this.getSNOMEDCode(herbData.scientificName),
            display: herbData.scientificName
          }]
        },
        strength: {
          numerator: {
            value: 100,
            unit: 'percent',
            system: 'http://unitsofmeasure.org',
            code: '%'
          }
        }
      }]
    };
  }

  generateMedicationKnowledgeResource(herbData) {
    return {
      resourceType: 'MedicationKnowledge',
      id: this.generateResourceId(),
      status: 'active',
      code: {
        coding: [{
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: this.getAyurvedicCode(herbData.commonName),
          display: herbData.commonName
        }]
      },
      intendedRoute: [{
        coding: [{
          system: 'http://snomed.info/sct',
          code: '26643006',
          display: 'Oral route'
        }]
      }],
      indicationGuideline: [{
        indication: [{
          concept: {
            coding: [{
              system: 'http://snomed.info/sct',
              code: '264931009',
              display: 'Traditional medicine indication'
            }]
          }
        }]
      }]
    };
  }

  generateSubstanceResource(herbData) {
    return {
      resourceType: 'Substance',
      id: this.generateResourceId(),
      status: 'active',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/substance-category',
          code: 'biological',
          display: 'Biological Substance'
        }]
      }],
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: this.getSNOMEDCode(herbData.scientificName),
          display: herbData.scientificName
        }]
      },
      description: `Traditional Ayurvedic herb: ${herbData.commonName} (${herbData.scientificName})`
    };
  }

  generateOrganizationResource(organizationData) {
    return {
      resourceType: 'Organization',
      id: 'trace-herb-farmers',
      active: true,
      type: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/organization-type',
          code: 'prov',
          display: 'Healthcare Provider'
        }]
      }],
      name: 'TRACE HERB Farmers Cooperative',
      telecom: [{
        system: 'phone',
        value: '+91-8123456789'
      }, {
        system: 'email',
        value: 'info@traceherb.com'
      }],
      address: [{
        use: 'work',
        type: 'physical',
        line: ['Hubli Agricultural Zone'],
        city: 'Hubli',
        state: 'Karnataka',
        postalCode: '580031',
        country: 'IN'
      }]
    };
  }

  generateLocationResource(organizationData) {
    return {
      resourceType: 'Location',
      id: this.generateResourceId(),
      status: 'active',
      name: 'TRACE HERB Farm Location',
      type: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
          code: 'FARM',
          display: 'Farm'
        }]
      }],
      address: {
        line: ['Hubli Agricultural Zone'],
        city: 'Hubli',
        state: 'Karnataka',
        postalCode: '580031',
        country: 'IN'
      },
      position: {
        longitude: 75.7139,
        latitude: 15.3173
      }
    };
  }

  generateProvenanceResource(herbData, organizationData) {
    return {
      resourceType: 'Provenance',
      id: this.generateResourceId(),
      target: [{
        reference: 'Medication/' + this.generateResourceId()
      }],
      occurredDateTime: new Date().toISOString(),
      recorded: new Date().toISOString(),
      agent: [{
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/provenance-participant-type',
            code: 'author',
            display: 'Author'
          }]
        },
        who: {
          reference: 'Organization/trace-herb-farmers'
        }
      }],
      entity: [{
        role: 'source',
        what: {
          identifier: {
            system: 'http://trace-herb.com/batch-id',
            value: 'BATCH_' + Date.now()
          }
        }
      }]
    };
  }

  async validateFHIRBundle(bundle) {
    // Mock FHIR validation
    const errors = [];
    const warnings = [];

    // Basic validation checks
    if (!bundle.resourceType || bundle.resourceType !== 'Bundle') {
      errors.push('Invalid bundle resource type');
    }

    if (!bundle.entry || bundle.entry.length === 0) {
      errors.push('Bundle must contain at least one entry');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      resourceCount: bundle.entry ? bundle.entry.length : 0,
      validationTime: new Date().toISOString()
    };
  }

  // Export Certificate Helper Methods
  getComplianceStandards(country) {
    const countryMap = {
      'USA': this.exportStandards.FDA,
      'EU': this.exportStandards.EU,
      'Germany': this.exportStandards.EU,
      'France': this.exportStandards.EU,
      'India': this.exportStandards.AYUSH,
      'WHO': this.exportStandards.WHO
    };

    return countryMap[country] || this.exportStandards.WHO;
  }

  async generateCertificate(certType, productData, destinationCountry) {
    const certificateTemplates = {
      'Certificate of Analysis': {
        title: 'Certificate of Analysis',
        content: `This certifies that ${productData.commonName} (${productData.scientificName}) has been analyzed and meets all quality standards.`,
        validityPeriod: '12 months',
        issuingAuthority: 'TRACE HERB Quality Control'
      },
      'Phytosanitary Certificate': {
        title: 'Phytosanitary Certificate',
        content: `This is to certify that the herbal products described herein have been inspected and are considered free from quarantine pests.`,
        validityPeriod: '6 months',
        issuingAuthority: 'Plant Quarantine Authority of India'
      },
      'Health Certificate': {
        title: 'Health Certificate',
        content: `This certifies that the herbal products are safe for human consumption and meet health standards.`,
        validityPeriod: '12 months',
        issuingAuthority: 'Ministry of Health, Government of India'
      },
      'Ayurvedic Pharmacopoeia Compliance': {
        title: 'Ayurvedic Pharmacopoeia Compliance Certificate',
        content: `This certifies compliance with Ayurvedic Pharmacopoeia of India standards.`,
        validityPeriod: '24 months',
        issuingAuthority: 'Ministry of AYUSH, Government of India'
      }
    };

    const template = certificateTemplates[certType] || certificateTemplates['Certificate of Analysis'];
    
    return {
      type: certType,
      certificateId: this.generateCertificateId(),
      title: template.title,
      content: template.content,
      issuingAuthority: template.issuingAuthority,
      issueDate: new Date().toISOString(),
      validityPeriod: template.validityPeriod,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      digitalSignature: this.generateDigitalSignature(template.content),
      qrCode: `CERT_${this.generateCertificateId()}`
    };
  }

  async performComplianceCheck(certType, productData, standards) {
    // Mock compliance checking
    const score = Math.floor(Math.random() * 20) + 80; // 80-100 score
    
    return {
      certificateType: certType,
      complianceScore: score,
      status: score >= 85 ? 'Compliant' : 'Needs Improvement',
      checkedStandards: standards.required,
      recommendations: score < 85 ? ['Improve documentation', 'Additional testing required'] : [],
      checkDate: new Date().toISOString()
    };
  }

  generateExportDocument(productData, destinationCountry, certificates) {
    return {
      documentId: this.generateExportId(),
      title: `Export Documentation Package - ${destinationCountry}`,
      productName: productData.commonName,
      scientificName: productData.scientificName,
      destinationCountry,
      exporterDetails: {
        name: 'TRACE HERB Farmers Cooperative',
        address: 'Hubli, Karnataka, India',
        license: 'AYUSH/EXP/2024/001'
      },
      certificates: certificates.map(cert => ({
        type: cert.type,
        id: cert.certificateId,
        validity: cert.validityPeriod
      })),
      issueDate: new Date().toISOString(),
      validityPeriod: '12 months',
      digitalSignature: this.generateDigitalSignature(`${productData.commonName}_${destinationCountry}_${Date.now()}`)
    };
  }

  calculateComplianceScore(complianceChecks) {
    if (complianceChecks.length === 0) return 0;
    
    const totalScore = complianceChecks.reduce((sum, check) => sum + check.complianceScore, 0);
    return Math.round(totalScore / complianceChecks.length);
  }

  // Utility Methods
  calculateGTINCheckDigit(partial) {
    let sum = 0;
    for (let i = 0; i < partial.length; i++) {
      const digit = parseInt(partial[i]);
      sum += (i % 2 === 0) ? digit * 3 : digit;
    }
    return ((10 - (sum % 10)) % 10).toString();
  }

  formatGS1Date(date) {
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return year + month + day;
  }

  validateGTIN(gtin) {
    return gtin.length === 14 && /^\d+$/.test(gtin);
  }

  validateBarcode(gs1Data) {
    return gs1Data.fullBarcode && gs1Data.fullBarcode.length > 0;
  }

  getAyurvedicCode(commonName) {
    // Mock Ayurvedic coding system
    const codes = {
      'Ashwagandha': 'AYU001',
      'Turmeric': 'AYU002',
      'Neem': 'AYU003',
      'Tulsi': 'AYU004'
    };
    return codes[commonName] || 'AYU999';
  }

  getSNOMEDCode(scientificName) {
    // Mock SNOMED CT codes
    const codes = {
      'Withania somnifera': '123456789',
      'Curcuma longa': '234567890',
      'Azadirachta indica': '345678901',
      'Ocimum sanctum': '456789012'
    };
    return codes[scientificName] || '999999999';
  }

  generateDigitalSignature(content) {
    return crypto.createHash('sha256').update(content + Date.now()).digest('hex');
  }

  generateGS1Id() {
    return 'GS1_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateFHIRId() {
    return 'FHIR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateExportId() {
    return 'EXP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateResourceId() {
    return Math.random().toString(36).substr(2, 9);
  }

  generateCertificateId() {
    return 'CERT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  // Statistics and monitoring
  getRegulatoryStats() {
    const totalGS1Records = this.gs1Records.size;
    const totalFHIRResources = this.fhirResources.size;
    const totalExportCertificates = this.exportCertificates.size;
    
    const exportReadyProducts = Array.from(this.exportCertificates.values())
      .filter(cert => cert.complianceScore >= 85).length;

    return {
      gs1Records: totalGS1Records,
      fhirResources: totalFHIRResources,
      exportCertificates: totalExportCertificates,
      exportReadyProducts,
      complianceRate: totalExportCertificates > 0 ? 
        (exportReadyProducts / totalExportCertificates * 100).toFixed(1) : 0,
      supportedStandards: ['GS1', 'FHIR R4', 'FDA', 'EU', 'AYUSH', 'WHO'],
      lastCertificateGenerated: this.exportCertificates.size > 0 ? 
        Array.from(this.exportCertificates.values()).pop().timestamp : null
    };
  }
}

module.exports = new RegulatoryService();
