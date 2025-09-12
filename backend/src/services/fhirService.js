/**
 * FHIR Service - Healthcare Interoperability Standards Implementation
 * Provides FHIR R4 compliant data models and transformations for herb traceability
 */

const { v4: uuidv4 } = require('uuid');

class FHIRService {
  constructor() {
    this.fhirVersion = '4.0.1';
    this.baseUrl = 'http://trace-herb.com/fhir';
    this.profiles = {
      collectionEvent: `${this.baseUrl}/StructureDefinition/CollectionEvent`,
      qualityTest: `${this.baseUrl}/StructureDefinition/QualityTest`,
      processingStep: `${this.baseUrl}/StructureDefinition/ProcessingStep`,
      provenance: `${this.baseUrl}/StructureDefinition/Provenance`
    };
    
    // Code systems for standardized terminology
    this.codeSystems = {
      collectionType: `${this.baseUrl}/CodeSystem/collection-type`,
      plantPart: `${this.baseUrl}/CodeSystem/plant-part`,
      qualityTestType: `${this.baseUrl}/CodeSystem/quality-test-type`,
      qualityStatus: `${this.baseUrl}/CodeSystem/quality-status`,
      processingType: `${this.baseUrl}/CodeSystem/processing-type`,
      sustainabilityMetric: `${this.baseUrl}/CodeSystem/sustainability-metric`
    };
  }

  /**
   * Create FHIR-compliant Collection Event resource
   */
  createCollectionEvent(data) {
    const collectionEvent = {
      resourceType: 'Procedure',
      id: data.id,
      meta: {
        profile: [this.profiles.collectionEvent],
        lastUpdated: new Date().toISOString(),
        versionId: '1',
        source: 'trace-herb-mobile-app'
      },
      identifier: [
        {
          use: 'official',
          system: `${this.baseUrl}/identifier/collection-event`,
          value: data.id
        },
        {
          use: 'secondary',
          system: `${this.baseUrl}/identifier/qr-code`,
          value: data.qrCode
        }
      ],
      status: 'completed',
      category: {
        coding: [
          {
            system: this.codeSystems.collectionType,
            code: data.herb.collectionMethod === 'wild-harvesting' ? 'wild-harvest' : 'cultivated-harvest',
            display: data.herb.collectionMethod === 'wild-harvesting' ? 'Wild Harvesting' : 'Cultivated Harvest'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '182836005',
            display: 'Review of medication'
          }
        ],
        text: 'Medicinal Plant Collection'
      },
      subject: {
        reference: `Substance/${data.herb.botanicalName.replace(/\s+/g, '-').toLowerCase()}`,
        display: `${data.herb.botanicalName} (${data.herb.ayurvedicName})`
      },
      performedDateTime: data.metadata.timestamp,
      performer: [
        {
          actor: {
            reference: `Practitioner/${data.farmer.id}`,
            display: data.farmer.name
          },
          role: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/practitioner-role',
                code: 'farmer',
                display: 'Farmer/Collector'
              }
            ]
          }
        }
      ],
      location: {
        reference: `Location/${data.id}-location`,
        display: `${data.farmer.village}, ${data.farmer.district}, ${data.farmer.state}`
      },
      reasonCode: [
        {
          coding: [
            {
              system: this.codeSystems.collectionType,
              code: 'commercial-harvest',
              display: 'Commercial Harvest'
            }
          ]
        }
      ],
      bodySite: [
        {
          coding: [
            {
              system: this.codeSystems.plantPart,
              code: data.herb.partUsed.toLowerCase().replace(/\s+/g, '-'),
              display: data.herb.partUsed
            }
          ]
        }
      ],
      outcome: {
        coding: [
          {
            system: 'http://hl7.org/fhir/event-status',
            code: 'completed',
            display: 'Completed'
          }
        ]
      },
      note: [
        {
          text: data.herb.notes || 'Collection completed successfully'
        }
      ],
      extension: [
        {
          url: `${this.baseUrl}/StructureDefinition/gps-coordinates`,
          extension: [
            {
              url: 'latitude',
              valueDecimal: data.location.latitude
            },
            {
              url: 'longitude',
              valueDecimal: data.location.longitude
            },
            {
              url: 'accuracy',
              valueDecimal: data.location.accuracy
            },
            {
              url: 'altitude',
              valueDecimal: data.location.altitude
            }
          ]
        },
        {
          url: `${this.baseUrl}/StructureDefinition/environmental-conditions`,
          extension: [
            {
              url: 'temperature',
              valueQuantity: {
                value: data.environmental.temperature,
                unit: '°C',
                system: 'http://unitsofmeasure.org',
                code: 'Cel'
              }
            },
            {
              url: 'humidity',
              valueQuantity: {
                value: data.environmental.humidity,
                unit: '%',
                system: 'http://unitsofmeasure.org',
                code: '%'
              }
            },
            {
              url: 'soil-ph',
              valueQuantity: {
                value: data.environmental.soilPH,
                unit: 'pH',
                system: 'http://unitsofmeasure.org',
                code: '[pH]'
              }
            }
          ]
        },
        {
          url: `${this.baseUrl}/StructureDefinition/harvest-details`,
          extension: [
            {
              url: 'quantity',
              valueQuantity: {
                value: data.herb.quantity,
                unit: data.herb.unit,
                system: 'http://unitsofmeasure.org',
                code: data.herb.unit === 'kg' ? 'kg' : 'g'
              }
            },
            {
              url: 'season',
              valueString: data.herb.season
            },
            {
              url: 'weather-conditions',
              valueString: data.herb.weatherConditions
            },
            {
              url: 'soil-type',
              valueString: data.herb.soilType
            }
          ]
        },
        {
          url: `${this.baseUrl}/StructureDefinition/device-metadata`,
          extension: [
            {
              url: 'device-id',
              valueString: data.metadata.deviceId
            },
            {
              url: 'app-version',
              valueString: data.metadata.appVersion
            },
            {
              url: 'network-status',
              valueString: data.metadata.networkStatus
            },
            {
              url: 'battery-level',
              valueQuantity: {
                value: data.metadata.batteryLevel,
                unit: '%',
                system: 'http://unitsofmeasure.org',
                code: '%'
              }
            }
          ]
        }
      ]
    };

    return collectionEvent;
  }

  /**
   * Create FHIR-compliant Quality Test resource
   */
  createQualityTest(data) {
    const qualityTest = {
      resourceType: 'DiagnosticReport',
      id: data.id,
      meta: {
        profile: [this.profiles.qualityTest],
        lastUpdated: new Date().toISOString(),
        versionId: '1',
        source: 'trace-herb-lab-system'
      },
      identifier: [
        {
          use: 'official',
          system: `${this.baseUrl}/identifier/quality-test`,
          value: data.id
        }
      ],
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'LAB',
              display: 'Laboratory'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: this.codeSystems.qualityTestType,
            code: 'comprehensive-analysis',
            display: 'Comprehensive Quality Analysis'
          }
        ]
      },
      subject: {
        reference: `Substance/${data.batchId}`,
        display: data.productName
      },
      effectiveDateTime: data.testDate,
      issued: data.reportDate,
      performer: [
        {
          reference: `Organization/${data.laboratoryId}`,
          display: data.laboratoryName
        }
      ],
      result: data.testResults.map(result => ({
        reference: `Observation/${result.id}`,
        display: result.parameter
      })),
      conclusion: data.conclusion,
      conclusionCode: [
        {
          coding: [
            {
              system: this.codeSystems.qualityStatus,
              code: data.passed ? 'passed' : 'failed',
              display: data.passed ? 'Quality Test Passed' : 'Quality Test Failed'
            }
          ]
        }
      ],
      presentedForm: data.certificateUrl ? [
        {
          contentType: 'application/pdf',
          url: data.certificateUrl,
          title: 'Quality Test Certificate'
        }
      ] : undefined
    };

    return qualityTest;
  }

  /**
   * Create FHIR-compliant Processing Step resource
   */
  createProcessingStep(data) {
    const processingStep = {
      resourceType: 'Procedure',
      id: data.id,
      meta: {
        profile: [this.profiles.processingStep],
        lastUpdated: new Date().toISOString(),
        versionId: '1',
        source: 'trace-herb-processing-system'
      },
      identifier: [
        {
          use: 'official',
          system: `${this.baseUrl}/identifier/processing-step`,
          value: data.id
        }
      ],
      status: 'completed',
      category: {
        coding: [
          {
            system: this.codeSystems.processingType,
            code: data.processType,
            display: data.processName
          }
        ]
      },
      code: {
        coding: [
          {
            system: this.codeSystems.processingType,
            code: data.processType,
            display: data.processName
          }
        ]
      },
      subject: {
        reference: `Substance/${data.batchId}`,
        display: data.productName
      },
      performedDateTime: data.processDate,
      performer: [
        {
          actor: {
            reference: `Organization/${data.facilityId}`,
            display: data.facilityName
          }
        }
      ],
      location: {
        reference: `Location/${data.facilityId}-location`,
        display: data.facilityAddress
      },
      note: [
        {
          text: data.notes || 'Processing step completed'
        }
      ],
      extension: [
        {
          url: `${this.baseUrl}/StructureDefinition/processing-parameters`,
          extension: data.parameters.map(param => ({
            url: param.name,
            valueQuantity: {
              value: param.value,
              unit: param.unit,
              system: 'http://unitsofmeasure.org',
              code: param.unit
            }
          }))
        }
      ]
    };

    return processingStep;
  }

  /**
   * Create FHIR-compliant Provenance Bundle
   */
  createProvenanceBundle(data) {
    const bundle = {
      resourceType: 'Bundle',
      id: data.id,
      meta: {
        profile: [this.profiles.provenance],
        lastUpdated: new Date().toISOString(),
        versionId: '1',
        source: 'trace-herb-blockchain-system'
      },
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: []
    };

    // Add collection events
    if (data.collectionEvents) {
      data.collectionEvents.forEach(event => {
        bundle.entry.push({
          fullUrl: `${this.baseUrl}/Procedure/${event.id}`,
          resource: this.createCollectionEvent(event)
        });
      });
    }

    // Add quality tests
    if (data.qualityTests) {
      data.qualityTests.forEach(test => {
        bundle.entry.push({
          fullUrl: `${this.baseUrl}/DiagnosticReport/${test.id}`,
          resource: this.createQualityTest(test)
        });
      });
    }

    // Add processing steps
    if (data.processingSteps) {
      data.processingSteps.forEach(step => {
        bundle.entry.push({
          fullUrl: `${this.baseUrl}/Procedure/${step.id}`,
          resource: this.createProcessingStep(step)
        });
      });
    }

    // Add sustainability metrics
    if (data.sustainability) {
      bundle.entry.push({
        fullUrl: `${this.baseUrl}/Observation/sustainability-${data.id}`,
        resource: this.createSustainabilityObservation(data.sustainability, data.id)
      });
    }

    return bundle;
  }

  /**
   * Create sustainability metrics observation
   */
  createSustainabilityObservation(sustainability, subjectId) {
    return {
      resourceType: 'Observation',
      id: `sustainability-${subjectId}`,
      meta: {
        lastUpdated: new Date().toISOString(),
        versionId: '1'
      },
      status: 'final',
      category: [
        {
          coding: [
            {
              system: this.codeSystems.sustainabilityMetric,
              code: 'sustainability-assessment',
              display: 'Sustainability Assessment'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: this.codeSystems.sustainabilityMetric,
            code: 'overall-score',
            display: 'Overall Sustainability Score'
          }
        ]
      },
      subject: {
        reference: `Substance/${subjectId}`,
        display: 'Product Sustainability Metrics'
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: sustainability.overallScore || 0,
        unit: 'score',
        system: 'http://unitsofmeasure.org',
        code: '1'
      },
      component: [
        {
          code: {
            coding: [
              {
                system: this.codeSystems.sustainabilityMetric,
                code: 'carbon-footprint',
                display: 'Carbon Footprint'
              }
            ]
          },
          valueQuantity: {
            value: sustainability.carbonFootprint,
            unit: 'kg CO2',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        },
        {
          code: {
            coding: [
              {
                system: this.codeSystems.sustainabilityMetric,
                code: 'water-usage',
                display: 'Water Usage'
              }
            ]
          },
          valueQuantity: {
            value: sustainability.waterUsage,
            unit: 'L/kg',
            system: 'http://unitsofmeasure.org',
            code: 'L/kg'
          }
        },
        {
          code: {
            coding: [
              {
                system: this.codeSystems.sustainabilityMetric,
                code: 'biodiversity-score',
                display: 'Biodiversity Score'
              }
            ]
          },
          valueQuantity: {
            value: sustainability.biodiversityScore,
            unit: 'score',
            system: 'http://unitsofmeasure.org',
            code: '1'
          }
        }
      ]
    };
  }

  /**
   * Validate FHIR resource
   */
  validateResource(resource) {
    const errors = [];
    
    // Basic validation
    if (!resource.resourceType) {
      errors.push('Missing required field: resourceType');
    }
    
    if (!resource.id) {
      errors.push('Missing required field: id');
    }
    
    if (!resource.meta) {
      errors.push('Missing required field: meta');
    }
    
    // Resource-specific validation
    switch (resource.resourceType) {
      case 'Procedure':
        if (!resource.status) errors.push('Missing required field: status');
        if (!resource.subject) errors.push('Missing required field: subject');
        break;
      case 'DiagnosticReport':
        if (!resource.status) errors.push('Missing required field: status');
        if (!resource.code) errors.push('Missing required field: code');
        if (!resource.subject) errors.push('Missing required field: subject');
        break;
      case 'Bundle':
        if (!resource.type) errors.push('Missing required field: type');
        if (!resource.entry) errors.push('Missing required field: entry');
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Transform legacy data to FHIR format
   */
  transformLegacyData(legacyData) {
    // Implementation for transforming existing data to FHIR format
    // This would be used for migrating existing data to FHIR-compliant format
    
    const transformedData = {
      collectionEvents: [],
      qualityTests: [],
      processingSteps: [],
      sustainability: {}
    };
    
    // Transform collection events
    if (legacyData.collections) {
      transformedData.collectionEvents = legacyData.collections.map(collection => ({
        id: collection.id,
        qrCode: collection.qrCode,
        farmer: collection.farmer,
        herb: collection.herb,
        location: collection.location,
        environmental: collection.environmental,
        metadata: collection.metadata
      }));
    }
    
    return transformedData;
  }
}

module.exports = FHIRService;
