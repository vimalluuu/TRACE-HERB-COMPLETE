/**
 * Demo Data for TRACE HERB System
 * Complete end-to-end demonstration using Ashwagandha as pilot species
 */

// Simple UUID generator for demo
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Demo Collection Event - Ashwagandha harvest in Maharashtra
const demoCollectionEvent = {
  id: 'collection-demo-ashwagandha-001',
  resourceType: 'CollectionEvent',
  meta: {
    versionId: '1',
    lastUpdated: '2024-01-15T08:30:00.000Z',
    profile: ['http://trace-herb.com/fhir/StructureDefinition/CollectionEvent']
  },
  identifier: [
    {
      system: 'http://trace-herb.com/collection-id',
      value: 'COL-ASH-2024-001'
    }
  ],
  status: 'completed',
  category: {
    coding: [{
      system: 'http://trace-herb.com/fhir/CodeSystem/collection-category',
      code: 'cultivated-collection',
      display: 'Cultivated Collection'
    }]
  },
  subject: {
    reference: 'herb-ashwagandha',
    display: 'Ashwagandha',
    botanicalName: 'Withania somnifera',
    commonName: 'Ashwagandha',
    ayurvedicName: 'Ashwagandha',
    partUsed: ['roots']
  },
  performedDateTime: '2024-01-15T08:30:00.000Z',
  performer: {
    reference: 'collector-ramesh-patil',
    display: 'Ramesh Patil',
    type: 'farmer',
    identifier: 'FARMER-001-MH',
    contact: {
      phone: '+91-9876543210',
      village: 'Shirdi'
    }
  },
  location: {
    reference: 'location-shirdi-farm',
    display: 'Organic Farm, Shirdi, Maharashtra',
    coordinates: {
      latitude: 19.7645,
      longitude: 74.4769,
      altitude: 490,
      accuracy: 5
    },
    address: {
      village: 'Shirdi',
      district: 'Ahmednagar',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '423109'
    },
    geoFence: {
      approved: true,
      zone: 'zone-001',
      restrictions: ['seasonal', 'organic-certified']
    }
  },
  environment: {
    weather: {
      temperature: 28,
      humidity: 65,
      rainfall: 0,
      season: 'winter'
    },
    soil: {
      type: 'red-laterite',
      ph: 6.8,
      moisture: 45,
      organic: true
    },
    cultivation: {
      method: 'organic',
      pesticides: false,
      fertilizers: ['organic-compost', 'vermicompost'],
      irrigation: 'drip-irrigation'
    }
  },
  quantity: {
    value: 25.5,
    unit: 'kg',
    estimatedYield: 30
  },
  qualityAssessment: {
    visualInspection: {
      color: 'light-brown',
      texture: 'firm',
      aroma: 'characteristic-earthy',
      defects: []
    },
    maturity: {
      stage: 'mature',
      optimal: true
    },
    contamination: {
      visible: false,
      type: []
    }
  },
  sustainability: {
    harvestingPractices: {
      sustainable: true,
      method: 'selective-harvesting',
      regeneration: true
    },
    conservation: {
      endangered: false,
      permit: 'ORG-CERT-2024-001',
      quota: 100
    },
    fairTrade: {
      certified: true,
      price: 180,
      premium: 30
    }
  },
  documentation: {
    photos: [
      '/demo/photos/ashwagandha-field-001.jpg',
      '/demo/photos/ashwagandha-roots-001.jpg'
    ],
    certificates: [
      '/demo/certificates/organic-certificate-2024.pdf'
    ],
    permits: [
      '/demo/permits/cultivation-permit-2024.pdf'
    ],
    notes: 'High quality roots harvested after 6 months of cultivation. Excellent root development with characteristic aroma.'
  },
  blockchain: {
    transactionId: 'tx-demo-001',
    blockNumber: 1001,
    timestamp: '2024-01-15T08:35:00.000Z',
    hash: 'hash-demo-collection-001'
  }
};

// Demo Processing Step - Drying and cleaning
const demoProcessingStep = {
  id: 'processing-demo-ashwagandha-001',
  resourceType: 'ProcessingStep',
  meta: {
    versionId: '1',
    lastUpdated: '2024-01-18T14:20:00.000Z',
    profile: ['http://trace-herb.com/fhir/StructureDefinition/ProcessingStep']
  },
  identifier: [
    {
      system: 'http://trace-herb.com/processing-id',
      value: 'PROC-ASH-2024-001'
    }
  ],
  status: 'completed',
  category: {
    coding: [{
      system: 'http://trace-herb.com/fhir/CodeSystem/processing-category',
      code: 'primary-processing',
      display: 'Primary Processing'
    }]
  },
  type: {
    coding: [{
      system: 'http://trace-herb.com/fhir/CodeSystem/processing-type',
      code: 'drying-cleaning',
      display: 'Drying and Cleaning'
    }]
  },
  input: {
    reference: 'collection-demo-ashwagandha-001',
    quantity: {
      value: 25.5,
      unit: 'kg'
    },
    condition: 'fresh'
  },
  performedPeriod: {
    start: '2024-01-16T09:00:00.000Z',
    end: '2024-01-18T14:00:00.000Z'
  },
  performer: {
    reference: 'processor-maharashtra-herbs',
    display: 'Maharashtra Herbs Processing Unit',
    type: 'processor',
    identifier: 'PROC-001-MH',
    certification: ['GMP', 'ISO-22000']
  },
  location: {
    reference: 'facility-processing-ahmednagar',
    display: 'Processing Facility, Ahmednagar',
    address: {
      facility: 'Maharashtra Herbs Processing Unit',
      street: 'Industrial Area, Phase 2',
      city: 'Ahmednagar',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '414001'
    },
    coordinates: {
      latitude: 19.0948,
      longitude: 74.7480
    },
    certification: {
      gmp: true,
      organic: true,
      iso: ['ISO-22000', 'ISO-9001']
    }
  },
  parameters: {
    temperature: {
      value: 45,
      unit: 'celsius',
      range: { min: 40, max: 50 }
    },
    humidity: {
      value: 15,
      unit: 'percent',
      controlled: true
    },
    duration: {
      value: 48,
      unit: 'hours'
    },
    equipment: ['solar-dryer', 'cleaning-sieves', 'grading-tables']
  },
  output: {
    quantity: {
      value: 8.5,
      unit: 'kg',
      yield: 33.3
    },
    condition: 'dried-cleaned',
    packaging: {
      type: 'jute-bags',
      material: 'natural-fiber',
      size: '25kg',
      sealed: true
    },
    storage: {
      conditions: 'cool-dry-place',
      temperature: 25,
      humidity: 40,
      location: 'warehouse-a'
    }
  },
  qualityControl: {
    monitoring: {
      continuous: true,
      intervals: 6,
      parameters: ['temperature', 'humidity', 'moisture-content']
    },
    testing: {
      inProcess: ['moisture-content', 'visual-inspection'],
      final: ['moisture-content', 'ash-content', 'foreign-matter']
    }
  },
  environmental: {
    energy: {
      consumption: 120,
      source: 'solar',
      renewable: true
    },
    water: {
      usage: 50,
      treatment: true,
      recycled: false
    },
    waste: {
      generated: 2.5,
      recycled: 2.0,
      disposal: 'composting'
    }
  },
  compliance: {
    gmp: {
      compliant: true,
      certificate: 'GMP-CERT-2024-001',
      expiry: '2025-01-15'
    },
    organic: {
      certified: true,
      certifier: 'India Organic',
      certificate: 'ORG-PROC-2024-001'
    }
  },
  documentation: {
    photos: [
      '/demo/photos/drying-process-001.jpg',
      '/demo/photos/cleaned-roots-001.jpg'
    ],
    reports: [
      '/demo/reports/processing-report-001.pdf'
    ],
    sop: 'SOP-DRYING-ASH-001',
    notes: 'Optimal drying achieved with solar dryers. Final moisture content: 8.2%'
  },
  blockchain: {
    transactionId: 'tx-demo-002',
    blockNumber: 1002,
    timestamp: '2024-01-18T14:25:00.000Z',
    hash: 'hash-demo-processing-001',
    previousHash: 'hash-demo-collection-001'
  }
};

// Demo Quality Test - Laboratory analysis
const demoQualityTest = {
  id: 'test-demo-ashwagandha-001',
  resourceType: 'QualityTest',
  meta: {
    versionId: '1',
    lastUpdated: '2024-01-22T11:45:00.000Z',
    profile: ['http://trace-herb.com/fhir/StructureDefinition/QualityTest']
  },
  identifier: [
    {
      system: 'http://trace-herb.com/test-id',
      value: 'TEST-ASH-2024-001'
    }
  ],
  status: 'final',
  category: {
    coding: [{
      system: 'http://trace-herb.com/fhir/CodeSystem/test-category',
      code: 'chemical-microbiological',
      display: 'Chemical and Microbiological Analysis'
    }]
  },
  code: {
    coding: [{
      system: 'http://trace-herb.com/fhir/CodeSystem/test-code',
      code: 'complete-analysis',
      display: 'Complete Quality Analysis'
    }]
  },
  subject: {
    reference: 'processing-demo-ashwagandha-001',
    display: 'Processed Ashwagandha Roots',
    sampleId: 'SAMPLE-ASH-001',
    batchId: 'BATCH-ASH-2024-001',
    quantity: {
      value: 100,
      unit: 'g'
    }
  },
  effectiveDateTime: '2024-01-20T10:00:00.000Z',
  issued: '2024-01-22T11:45:00.000Z',
  performer: {
    reference: 'lab-ayush-testing',
    display: 'AYUSH Approved Testing Laboratory',
    type: 'laboratory',
    identifier: 'LAB-001-MH',
    accreditation: {
      nabl: true,
      iso17025: true,
      certificate: 'NABL-CERT-2024-001',
      scope: ['herbal-medicines', 'ayurvedic-drugs']
    }
  },
  location: {
    reference: 'lab-mumbai',
    display: 'Quality Testing Laboratory, Mumbai',
    address: {
      laboratory: 'AYUSH Testing Lab',
      street: 'Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400051'
    }
  },
  testTypes: {
    chemical: {
      moisture: 8.2,
      ash: {
        total: 4.8,
        acidInsoluble: 1.2,
        waterSoluble: 12.5
      },
      extractives: {
        waterSoluble: 18.5,
        alcoholSoluble: 15.2
      },
      activeCompounds: [
        {
          name: 'Withanolides',
          value: 2.8,
          unit: 'percent',
          method: 'HPLC'
        }
      ]
    },
    microbiological: {
      totalBacterialCount: 850,
      yeastMold: 45,
      pathogenicBacteria: {
        salmonella: 'absent',
        ecoli: 'absent',
        staphylococcus: 'absent'
      },
      aflatoxins: 1.2
    },
    pesticides: {
      organochlorines: [],
      organophosphates: [],
      carbamates: [],
      pyrethroids: []
    },
    heavyMetals: {
      lead: 0.8,
      cadmium: 0.1,
      mercury: 0.05,
      arsenic: 0.2
    }
  },
  compliance: {
    pharmacopoeia: {
      ip: true,
      usp: true,
      bp: true,
      who: true
    },
    ayush: {
      compliant: true,
      guidelines: ['ASU-guidelines-2021'],
      deviations: []
    },
    export: {
      compliant: true,
      countries: ['USA', 'EU', 'Canada'],
      certificates: ['export-cert-2024-001']
    }
  },
  documentation: {
    certificate: '/demo/certificates/quality-certificate-001.pdf',
    report: '/demo/reports/lab-report-001.pdf',
    chromatograms: ['/demo/chromatograms/hplc-withanolides-001.pdf'],
    notes: 'All parameters within acceptable limits. High withanolide content indicates excellent quality.'
  },
  blockchain: {
    transactionId: 'tx-demo-003',
    blockNumber: 1003,
    timestamp: '2024-01-22T11:50:00.000Z',
    hash: 'hash-demo-test-001',
    previousHash: 'hash-demo-processing-001'
  }
};

// Demo Provenance - Complete supply chain record
const demoProvenance = {
  id: 'provenance-demo-ashwagandha-001',
  resourceType: 'Provenance',
  meta: {
    versionId: '1',
    lastUpdated: '2024-01-25T16:30:00.000Z',
    profile: ['http://trace-herb.com/fhir/StructureDefinition/Provenance']
  },
  identifier: [
    {
      system: 'http://trace-herb.com/provenance-id',
      value: 'PROV-ASH-2024-001'
    }
  ],
  target: {
    reference: 'product-ashwagandha-capsules-001',
    display: 'Ashwagandha Root Extract Capsules',
    productId: 'PROD-ASH-CAP-001',
    batchNumber: 'BATCH-ASH-2024-001',
    qrCode: 'QR_DEMO_ASHWAGANDHA_001'
  },
  occurredPeriod: {
    start: '2024-01-15T08:30:00.000Z',
    end: '2024-01-25T16:30:00.000Z'
  },
  recorded: '2024-01-25T16:30:00.000Z',
  activity: {
    coding: [{
      system: 'http://trace-herb.com/fhir/CodeSystem/provenance-activity',
      code: 'supply-chain-complete',
      display: 'Complete Supply Chain Traceability'
    }]
  },
  events: [
    {
      id: 'collection-demo-ashwagandha-001',
      type: 'CollectionEvent',
      timestamp: '2024-01-15T08:30:00.000Z',
      reference: 'collection-demo-ashwagandha-001',
      summary: 'Collected 25.5kg of Withania somnifera roots from Shirdi, Ahmednagar'
    },
    {
      id: 'processing-demo-ashwagandha-001',
      type: 'ProcessingStep',
      timestamp: '2024-01-18T14:20:00.000Z',
      reference: 'processing-demo-ashwagandha-001',
      summary: 'Drying and cleaning processing completed with 33.3% yield'
    },
    {
      id: 'test-demo-ashwagandha-001',
      type: 'QualityTest',
      timestamp: '2024-01-22T11:45:00.000Z',
      reference: 'test-demo-ashwagandha-001',
      summary: 'Complete quality analysis completed - All parameters within limits'
    }
  ],
  product: {
    name: 'Ashwagandha Root Extract Capsules',
    botanicalName: 'Withania somnifera',
    commonName: 'Ashwagandha',
    ayurvedicName: 'Ashwagandha',
    formulation: 'Standardized Extract Capsules',
    strength: '500mg (2.5% Withanolides)',
    dosageForm: 'Capsules',
    packSize: '60 Capsules',
    manufacturer: 'Ayurvedic Wellness Pvt. Ltd.',
    license: 'MFG-LIC-2024-001'
  },
  geography: {
    origin: {
      coordinates: { latitude: 19.7645, longitude: 74.4769 },
      address: {
        village: 'Shirdi',
        district: 'Ahmednagar',
        state: 'Maharashtra',
        country: 'India'
      },
      region: 'Western Maharashtra',
      biodiversityHotspot: false
    },
    journey: [
      {
        location: 'Shirdi Farm',
        coordinates: { latitude: 19.7645, longitude: 74.4769 },
        activity: 'Collection'
      },
      {
        location: 'Ahmednagar Processing Unit',
        coordinates: { latitude: 19.0948, longitude: 74.7480 },
        activity: 'Processing'
      },
      {
        location: 'Mumbai Testing Lab',
        coordinates: { latitude: 19.0760, longitude: 72.8777 },
        activity: 'Quality Testing'
      }
    ]
  },
  quality: {
    collectionGrade: 'Premium',
    processingStandards: ['GMP', 'ISO-22000'],
    testResults: [
      {
        parameter: 'Withanolides',
        value: '2.8%',
        status: 'Pass'
      },
      {
        parameter: 'Moisture Content',
        value: '8.2%',
        status: 'Pass'
      }
    ],
    certifications: ['Organic', 'Fair Trade', 'NABL Tested'],
    compliance: {
      pharmacopoeia: ['IP', 'USP', 'BP'],
      organic: true,
      fairTrade: true,
      gmp: true
    }
  },
  sustainability: {
    conservation: {
      status: 'least-concern',
      permit: 'ORG-CERT-2024-001',
      quota: 100,
      harvested: 25.5
    },
    environmental: {
      carbonFootprint: 2.5,
      waterUsage: 50,
      energyConsumption: 120,
      wasteGenerated: 2.5
    },
    social: {
      fairTrade: true,
      communityBenefit: 5000,
      farmerPremium: 30,
      genderEquity: true
    }
  },
  economics: {
    farmGatePrice: 180,
    processingCost: 50,
    testingCost: 25,
    logisticsCost: 15,
    retailPrice: 450,
    valueAddition: 150,
    currency: 'INR'
  },
  traceability: {
    completeness: 95,
    accuracy: 98,
    timeliness: 2,
    transparency: 90,
    verifiability: 100
  },
  consumer: {
    scanCount: 0,
    firstScan: null,
    lastScan: null,
    locations: [],
    feedback: [],
    rating: 0
  },
  regulatory: {
    ayush: {
      compliant: true,
      license: 'AYUSH-LIC-2024-001',
      guidelines: ['ASU-guidelines-2021']
    },
    fssai: {
      compliant: true,
      license: 'FSSAI-LIC-2024-001',
      category: 'nutraceuticals'
    },
    export: {
      eligible: true,
      countries: ['USA', 'EU', 'Canada'],
      certificates: ['export-cert-2024-001']
    }
  },
  blockchain: {
    networkId: 'trace-herb-network',
    channelId: 'herb-channel',
    chaincodeId: 'herb-traceability',
    transactionIds: ['tx-demo-001', 'tx-demo-002', 'tx-demo-003'],
    blockNumbers: [1001, 1002, 1003],
    merkleRoot: 'merkle-root-demo-001',
    timestamp: '2024-01-25T16:35:00.000Z'
  }
};

module.exports = {
  demoCollectionEvent,
  demoProcessingStep,
  demoQualityTest,
  demoProvenance,
  
  // Helper function to get all demo data
  getAllDemoData: () => ({
    collectionEvent: demoCollectionEvent,
    processingStep: demoProcessingStep,
    qualityTest: demoQualityTest,
    provenance: demoProvenance
  }),
  
  // Helper function to generate new demo data with different IDs
  generateDemoData: (suffix = '') => {
    const timestamp = new Date().toISOString();
    const id = suffix || Date.now().toString();
    
    return {
      collectionEvent: {
        ...demoCollectionEvent,
        id: `collection-demo-ashwagandha-${id}`,
        meta: {
          ...demoCollectionEvent.meta,
          lastUpdated: timestamp
        }
      },
      processingStep: {
        ...demoProcessingStep,
        id: `processing-demo-ashwagandha-${id}`,
        input: {
          ...demoProcessingStep.input,
          reference: `collection-demo-ashwagandha-${id}`
        },
        meta: {
          ...demoProcessingStep.meta,
          lastUpdated: timestamp
        }
      },
      qualityTest: {
        ...demoQualityTest,
        id: `test-demo-ashwagandha-${id}`,
        subject: {
          ...demoQualityTest.subject,
          reference: `processing-demo-ashwagandha-${id}`
        },
        meta: {
          ...demoQualityTest.meta,
          lastUpdated: timestamp
        }
      },
      provenance: {
        ...demoProvenance,
        id: `provenance-demo-ashwagandha-${id}`,
        target: {
          ...demoProvenance.target,
          qrCode: `QR_DEMO_ASHWAGANDHA_${id.toUpperCase()}`
        },
        meta: {
          ...demoProvenance.meta,
          lastUpdated: timestamp
        }
      }
    };
  }
};
