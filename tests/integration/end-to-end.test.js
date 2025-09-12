/**
 * End-to-End Integration Tests for TRACE HERB System
 * Tests complete supply chain flow from collection to consumer verification
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

// Import test data and utilities
const { getAllDemoData, generateDemoData } = require('../demo-data');
const app = require('../../backend/src/app');

describe('TRACE HERB End-to-End Integration Tests', function() {
  this.timeout(30000); // 30 second timeout for blockchain operations

  let demoData;
  let collectionEventId;
  let processingStepId;
  let qualityTestId;
  let provenanceId;
  let qrCode;

  before(async function() {
    // Generate fresh demo data for testing
    demoData = generateDemoData('e2e-test');
    console.log('Generated demo data for E2E testing');
  });

  describe('1. Collection Event Recording', function() {
    it('should record a collection event successfully', async function() {
      const response = await chai
        .request(app)
        .post('/api/collection')
        .set('Authorization', 'Bearer test-token') // Mock auth token
        .send(demoData.collectionEvent);

      expect(response).to.have.status(201);
      expect(response.body).to.have.property('success', true);
      expect(response.body.data).to.have.property('id');
      expect(response.body.data).to.have.property('blockchainId');

      collectionEventId = response.body.data.id;
      console.log(`Collection event recorded: ${collectionEventId}`);
    });

    it('should validate sustainability compliance', async function() {
      const response = await chai
        .request(app)
        .get(`/api/collection/${collectionEventId}/sustainability`);

      expect(response).to.have.status(200);
      expect(response.body.data).to.have.property('sustainability');
      expect(response.body.data.sustainability).to.have.property('compliance');
    });

    it('should retrieve collection event by ID', async function() {
      const response = await chai
        .request(app)
        .get(`/api/collection/${collectionEventId}`);

      expect(response).to.have.status(200);
      expect(response.body.data).to.have.property('id', collectionEventId);
      expect(response.body.data.subject).to.have.property('botanicalName', 'Withania somnifera');
    });
  });

  describe('2. Processing Step Recording', function() {
    it('should record a processing step successfully', async function() {
      // Update processing step to reference the created collection event
      const processingStep = {
        ...demoData.processingStep,
        input: {
          ...demoData.processingStep.input,
          reference: collectionEventId
        }
      };

      const response = await chai
        .request(app)
        .post('/api/processing')
        .set('Authorization', 'Bearer test-token')
        .send(processingStep);

      expect(response).to.have.status(201);
      expect(response.body).to.have.property('success', true);
      expect(response.body.data).to.have.property('id');

      processingStepId = response.body.data.id;
      console.log(`Processing step recorded: ${processingStepId}`);
    });

    it('should validate processing parameters', async function() {
      const response = await chai
        .request(app)
        .get(`/api/processing/${processingStepId}`);

      expect(response).to.have.status(200);
      expect(response.body.data.parameters).to.have.property('temperature');
      expect(response.body.data.output).to.have.property('yield');
      expect(response.body.data.output.yield).to.be.a('number');
    });
  });

  describe('3. Quality Test Recording', function() {
    it('should record quality test results successfully', async function() {
      // Update quality test to reference the processing step
      const qualityTest = {
        ...demoData.qualityTest,
        subject: {
          ...demoData.qualityTest.subject,
          reference: processingStepId
        }
      };

      const response = await chai
        .request(app)
        .post('/api/quality')
        .set('Authorization', 'Bearer test-token')
        .send(qualityTest);

      expect(response).to.have.status(201);
      expect(response.body).to.have.property('success', true);
      expect(response.body.data).to.have.property('id');

      qualityTestId = response.body.data.id;
      console.log(`Quality test recorded: ${qualityTestId}`);
    });

    it('should validate test results against standards', async function() {
      const response = await chai
        .request(app)
        .get(`/api/quality/${qualityTestId}/compliance`);

      expect(response).to.have.status(200);
      expect(response.body.data.compliance).to.have.property('pharmacopoeia');
      expect(response.body.data.compliance.pharmacopoeia).to.have.property('ip', true);
    });
  });

  describe('4. Provenance Creation', function() {
    it('should create complete provenance record successfully', async function() {
      // Create provenance with all recorded events
      const provenance = {
        ...demoData.provenance,
        events: [
          {
            id: collectionEventId,
            type: 'CollectionEvent',
            timestamp: new Date().toISOString(),
            reference: collectionEventId,
            summary: 'Collection event recorded'
          },
          {
            id: processingStepId,
            type: 'ProcessingStep',
            timestamp: new Date().toISOString(),
            reference: processingStepId,
            summary: 'Processing step completed'
          },
          {
            id: qualityTestId,
            type: 'QualityTest',
            timestamp: new Date().toISOString(),
            reference: qualityTestId,
            summary: 'Quality test completed'
          }
        ]
      };

      const response = await chai
        .request(app)
        .post('/api/provenance')
        .set('Authorization', 'Bearer test-token')
        .send(provenance);

      expect(response).to.have.status(201);
      expect(response.body).to.have.property('success', true);
      expect(response.body.data).to.have.property('provenanceId');
      expect(response.body.data).to.have.property('qrCode');

      provenanceId = response.body.data.provenanceId;
      qrCode = response.body.data.qrCode;
      console.log(`Provenance created: ${provenanceId}, QR: ${qrCode}`);
    });

    it('should calculate traceability metrics correctly', async function() {
      const response = await chai
        .request(app)
        .get(`/api/provenance/${provenanceId}/metrics`);

      expect(response).to.have.status(200);
      expect(response.body.data.traceability).to.have.property('completeness');
      expect(response.body.data.traceability).to.have.property('accuracy');
      expect(response.body.data.traceability.completeness).to.be.above(90);
    });
  });

  describe('5. Consumer QR Code Verification', function() {
    it('should retrieve provenance data by QR code', async function() {
      const response = await chai
        .request(app)
        .get(`/api/provenance/qr/${qrCode}`);

      expect(response).to.have.status(200);
      expect(response.body.data).to.have.property('target');
      expect(response.body.data.target).to.have.property('qrCode', qrCode);
      expect(response.body.data).to.have.property('events');
      expect(response.body.data.events).to.have.length(3);
    });

    it('should update consumer scan metrics', async function() {
      // Scan QR code multiple times
      await chai.request(app).get(`/api/provenance/qr/${qrCode}`);
      await chai.request(app).get(`/api/provenance/qr/${qrCode}`);
      
      const response = await chai
        .request(app)
        .get(`/api/provenance/qr/${qrCode}`);

      expect(response).to.have.status(200);
      expect(response.body.data.consumer).to.have.property('scanCount');
      expect(response.body.data.consumer.scanCount).to.be.above(0);
    });

    it('should provide complete supply chain journey', async function() {
      const response = await chai
        .request(app)
        .get(`/api/provenance/qr/${qrCode}`);

      const provenance = response.body.data;
      
      // Verify all supply chain stages are present
      expect(provenance.events.some(e => e.type === 'CollectionEvent')).to.be.true;
      expect(provenance.events.some(e => e.type === 'ProcessingStep')).to.be.true;
      expect(provenance.events.some(e => e.type === 'QualityTest')).to.be.true;
      
      // Verify product information
      expect(provenance.product).to.have.property('botanicalName', 'Withania somnifera');
      expect(provenance.product).to.have.property('name');
      
      // Verify geographic information
      expect(provenance.geography).to.have.property('origin');
      expect(provenance.geography.origin).to.have.property('coordinates');
      
      // Verify quality information
      expect(provenance.quality).to.have.property('compliance');
      expect(provenance.quality.compliance).to.have.property('organic', true);
      
      // Verify sustainability information
      expect(provenance.sustainability).to.have.property('conservation');
      expect(provenance.sustainability).to.have.property('social');
    });
  });

  describe('6. Data Integrity and Blockchain Verification', function() {
    it('should maintain data integrity across all records', async function() {
      // Verify collection event integrity
      const collectionResponse = await chai
        .request(app)
        .get(`/api/collection/${collectionEventId}/history`);
      
      expect(collectionResponse).to.have.status(200);
      expect(collectionResponse.body.data.history).to.be.an('array');
      
      // Verify processing step links to collection
      const processingResponse = await chai
        .request(app)
        .get(`/api/processing/${processingStepId}`);
      
      expect(processingResponse.body.data.input.reference).to.equal(collectionEventId);
      
      // Verify quality test links to processing
      const qualityResponse = await chai
        .request(app)
        .get(`/api/quality/${qualityTestId}`);
      
      expect(qualityResponse.body.data.subject.reference).to.equal(processingStepId);
    });

    it('should provide blockchain transaction details', async function() {
      const response = await chai
        .request(app)
        .get(`/api/provenance/${provenanceId}/blockchain`);

      expect(response).to.have.status(200);
      expect(response.body.data.blockchain).to.have.property('transactionIds');
      expect(response.body.data.blockchain).to.have.property('blockNumbers');
      expect(response.body.data.blockchain.transactionIds).to.be.an('array');
    });
  });

  describe('7. Error Handling and Edge Cases', function() {
    it('should handle invalid QR code gracefully', async function() {
      const response = await chai
        .request(app)
        .get('/api/provenance/qr/INVALID_QR_CODE');

      expect(response).to.have.status(404);
      expect(response.body).to.have.property('error');
    });

    it('should validate required fields in collection event', async function() {
      const invalidCollection = {
        ...demoData.collectionEvent,
        subject: {
          ...demoData.collectionEvent.subject,
          botanicalName: '' // Missing required field
        }
      };

      const response = await chai
        .request(app)
        .post('/api/collection')
        .set('Authorization', 'Bearer test-token')
        .send(invalidCollection);

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error');
    });

    it('should prevent processing without valid input reference', async function() {
      const invalidProcessing = {
        ...demoData.processingStep,
        input: {
          ...demoData.processingStep.input,
          reference: 'non-existent-collection'
        }
      };

      const response = await chai
        .request(app)
        .post('/api/processing')
        .set('Authorization', 'Bearer test-token')
        .send(invalidProcessing);

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error');
    });
  });

  describe('8. Performance and Scalability', function() {
    it('should handle multiple concurrent QR scans', async function() {
      const promises = [];
      
      // Simulate 10 concurrent QR scans
      for (let i = 0; i < 10; i++) {
        promises.push(
          chai.request(app).get(`/api/provenance/qr/${qrCode}`)
        );
      }
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response).to.have.status(200);
        expect(response.body.data).to.have.property('target');
      });
    });

    it('should respond within acceptable time limits', async function() {
      const startTime = Date.now();
      
      const response = await chai
        .request(app)
        .get(`/api/provenance/qr/${qrCode}`);
      
      const responseTime = Date.now() - startTime;
      
      expect(response).to.have.status(200);
      expect(responseTime).to.be.below(2000); // Should respond within 2 seconds
    });
  });

  after(function() {
    console.log('E2E Integration Tests completed successfully');
    console.log(`Test Results Summary:`);
    console.log(`- Collection Event ID: ${collectionEventId}`);
    console.log(`- Processing Step ID: ${processingStepId}`);
    console.log(`- Quality Test ID: ${qualityTestId}`);
    console.log(`- Provenance ID: ${provenanceId}`);
    console.log(`- QR Code: ${qrCode}`);
  });
});
