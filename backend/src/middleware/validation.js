/**
 * Validation middleware
 */

const Joi = require('joi');

// Collection event validation schema
const collectionEventSchema = Joi.object({
  id: Joi.string().required(),
  resourceType: Joi.string().valid('CollectionEvent').required(),
  status: Joi.string().valid('completed', 'in-progress', 'cancelled').required(),
  subject: Joi.object({
    botanicalName: Joi.string().required(),
    commonName: Joi.string(),
    ayurvedicName: Joi.string(),
    partUsed: Joi.array().items(Joi.string()).min(1).required()
  }).required(),
  performedDateTime: Joi.string().isoDate().required(),
  performer: Joi.object({
    identifier: Joi.string().required(),
    display: Joi.string().required(),
    type: Joi.string().required()
  }).required(),
  location: Joi.object({
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      altitude: Joi.number(),
      accuracy: Joi.number()
    }).required()
  }).required(),
  quantity: Joi.object({
    value: Joi.number().positive().required(),
    unit: Joi.string().required()
  }).required()
});

// Processing step validation schema
const processingStepSchema = Joi.object({
  id: Joi.string().required(),
  resourceType: Joi.string().valid('ProcessingStep').required(),
  status: Joi.string().valid('completed', 'in-progress', 'cancelled').required(),
  input: Joi.object({
    reference: Joi.string().required(),
    quantity: Joi.object({
      value: Joi.number().positive().required(),
      unit: Joi.string().required()
    }).required()
  }).required(),
  output: Joi.object({
    quantity: Joi.object({
      value: Joi.number().positive().required(),
      unit: Joi.string().required()
    }).required()
  }).required()
});

// Quality test validation schema
const qualityTestSchema = Joi.object({
  id: Joi.string().required(),
  resourceType: Joi.string().valid('QualityTest').required(),
  status: Joi.string().valid('final', 'preliminary', 'cancelled').required(),
  subject: Joi.object({
    reference: Joi.string().required(),
    sampleId: Joi.string().required()
  }).required(),
  performer: Joi.object({
    identifier: Joi.string().required(),
    display: Joi.string().required(),
    type: Joi.string().valid('laboratory').required()
  }).required()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  validate,
  collectionEventSchema,
  processingStepSchema,
  qualityTestSchema
};
