/**
 * Model Index - Exports all FHIR-style data models
 */

const CollectionEvent = require('./CollectionEvent');
const ProcessingStep = require('./ProcessingStep');
const QualityTest = require('./QualityTest');
const Provenance = require('./Provenance');

module.exports = {
  CollectionEvent,
  ProcessingStep,
  QualityTest,
  Provenance
};

/**
 * Model factory function to create instances based on resource type
 * @param {string} resourceType - The type of resource to create
 * @param {Object} data - The data to initialize the resource with
 * @returns {Object} - Instance of the appropriate model class
 */
function createResource(resourceType, data = {}) {
  switch (resourceType) {
    case 'CollectionEvent':
      return new CollectionEvent(data);
    case 'ProcessingStep':
      return new ProcessingStep(data);
    case 'QualityTest':
      return new QualityTest(data);
    case 'Provenance':
      return new Provenance(data);
    default:
      throw new Error(`Unknown resource type: ${resourceType}`);
  }
}

/**
 * Validation helper for all resources
 * @param {Object} resource - The resource to validate
 * @returns {Object} - Validation result with isValid flag and errors array
 */
function validateResource(resource) {
  if (!resource || typeof resource.validate !== 'function') {
    return {
      isValid: false,
      errors: ['Invalid resource or missing validate method']
    };
  }
  
  return resource.validate();
}

/**
 * Convert resource to blockchain-ready format
 * @param {Object} resource - The resource to convert
 * @returns {Object} - Blockchain-ready JSON representation
 */
function toBlockchainFormat(resource) {
  if (!resource || typeof resource.toJSON !== 'function') {
    throw new Error('Invalid resource or missing toJSON method');
  }
  
  const json = resource.toJSON();
  
  // Add blockchain-specific metadata
  json._blockchainMetadata = {
    version: '1.0',
    schema: `http://trace-herb.com/fhir/StructureDefinition/${resource.resourceType}`,
    created: new Date().toISOString(),
    hash: generateResourceHash(json)
  };
  
  return json;
}

/**
 * Generate a hash for a resource (simplified version)
 * In production, use a proper cryptographic hash function
 * @param {Object} resource - The resource to hash
 * @returns {string} - Hash string
 */
function generateResourceHash(resource) {
  const crypto = require('crypto');
  const resourceString = JSON.stringify(resource, Object.keys(resource).sort());
  return crypto.createHash('sha256').update(resourceString).digest('hex');
}

/**
 * Create a provenance bundle from multiple resources
 * @param {Array} resources - Array of resources to include in provenance
 * @param {Object} productInfo - Final product information
 * @returns {Provenance} - Complete provenance record
 */
function createProvenanceBundle(resources, productInfo) {
  const provenance = new Provenance({
    target: productInfo,
    occurredPeriod: {
      start: null,
      end: new Date().toISOString()
    }
  });
  
  // Add all events to provenance
  resources.forEach(resource => {
    if (resource && typeof resource.toJSON === 'function') {
      provenance.addEvent(resource);
    }
  });
  
  // Calculate traceability metrics
  provenance.traceability.completeness = calculateCompleteness(resources);
  provenance.traceability.accuracy = calculateAccuracy(resources);
  provenance.traceability.transparency = calculateTransparency(resources);
  
  return provenance;
}

/**
 * Calculate completeness score based on available data
 * @param {Array} resources - Array of supply chain resources
 * @returns {number} - Completeness score (0-100)
 */
function calculateCompleteness(resources) {
  const requiredSteps = ['CollectionEvent', 'ProcessingStep', 'QualityTest'];
  const availableSteps = [...new Set(resources.map(r => r.resourceType))];
  
  return (availableSteps.filter(step => requiredSteps.includes(step)).length / requiredSteps.length) * 100;
}

/**
 * Calculate accuracy score based on data validation
 * @param {Array} resources - Array of supply chain resources
 * @returns {number} - Accuracy score (0-100)
 */
function calculateAccuracy(resources) {
  const validResources = resources.filter(resource => {
    const validation = validateResource(resource);
    return validation.isValid;
  });
  
  return resources.length > 0 ? (validResources.length / resources.length) * 100 : 0;
}

/**
 * Calculate transparency score based on available documentation
 * @param {Array} resources - Array of supply chain resources
 * @returns {number} - Transparency score (0-100)
 */
function calculateTransparency(resources) {
  let totalDocuments = 0;
  let availableDocuments = 0;
  
  resources.forEach(resource => {
    if (resource.documentation) {
      const docFields = ['photos', 'certificates', 'reports', 'notes'];
      docFields.forEach(field => {
        totalDocuments++;
        if (resource.documentation[field] && 
            (Array.isArray(resource.documentation[field]) ? 
             resource.documentation[field].length > 0 : 
             resource.documentation[field].length > 0)) {
          availableDocuments++;
        }
      });
    }
  });
  
  return totalDocuments > 0 ? (availableDocuments / totalDocuments) * 100 : 0;
}

module.exports.createResource = createResource;
module.exports.validateResource = validateResource;
module.exports.toBlockchainFormat = toBlockchainFormat;
module.exports.generateResourceHash = generateResourceHash;
module.exports.createProvenanceBundle = createProvenanceBundle;
