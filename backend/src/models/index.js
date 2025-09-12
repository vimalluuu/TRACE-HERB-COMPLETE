// TRACE HERB - Backend Models
// Blockchain-based herb traceability system models

const Collection = {
  id: String,
  farmerId: String,
  herbType: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  timestamp: Date,
  quantity: Number,
  qualityMetrics: {
    moisture: Number,
    purity: Number,
    potency: Number
  },
  blockchainTxId: String,
  status: String
};

const QualityTest = {
  id: String,
  collectionId: String,
  testType: String,
  results: Object,
  labId: String,
  timestamp: Date,
  certificate: String,
  blockchainTxId: String
};

const Farmer = {
  id: String,
  name: String,
  location: String,
  certifications: Array,
  contactInfo: Object,
  registrationDate: Date
};

const Product = {
  id: String,
  qrCode: String,
  collectionId: String,
  processingSteps: Array,
  currentLocation: String,
  status: String,
  blockchainTxId: String
};

module.exports = {
  Collection,
  CollectionEvent: Collection,
  QualityTest,
  Farmer,
  Product
};
