#!/usr/bin/env node

/**
 * Create Test Data Script
 * Creates sample data for testing all portals
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

console.log('🌱 TRACE HERB - Creating Test Data');
console.log('==================================');

const testBatches = [
  {
    name: 'Ashwagandha Premium',
    botanical: 'Withania somnifera',
    farmer: 'Rajesh Kumar',
    location: 'Nashik, Maharashtra',
    status: 'approved'
  },
  {
    name: 'Turmeric Organic',
    botanical: 'Curcuma longa',
    farmer: 'Priya Sharma',
    location: 'Mysore, Karnataka',
    status: 'tested'
  },
  {
    name: 'Brahmi Fresh',
    botanical: 'Bacopa monnieri',
    farmer: 'Suresh Patel',
    location: 'Ahmedabad, Gujarat',
    status: 'processed'
  },
  {
    name: 'Neem Extract',
    botanical: 'Azadirachta indica',
    farmer: 'Lakshmi Devi',
    location: 'Chennai, Tamil Nadu',
    status: 'collected'
  }
];

async function createTestBatch(batch, index) {
  try {
    console.log(`\n${index + 1}️⃣ Creating ${batch.name}...`);
    
    // Create farmer collection
    const farmerData = {
      collectionId: `COL_TEST_${Date.now()}_${index}`,
      farmer: {
        name: batch.farmer,
        phone: `+91 987654321${index}`,
        village: `Test Village ${index + 1}`,
        district: batch.location.split(',')[0],
        state: batch.location.split(',')[1]?.trim() || 'Karnataka'
      },
      herb: {
        botanicalName: batch.botanical,
        commonName: batch.name,
        quantity: 2.0 + index,
        unit: "kg",
        partUsed: index % 2 === 0 ? "Root" : "Leaf"
      },
      location: {
        latitude: 12.9716 + (index * 0.1),
        longitude: 77.5946 + (index * 0.1),
        accuracy: 5
      },
      environmental: {
        temperature: 25 + index,
        humidity: 60 + (index * 2),
        soilPH: 6.5 + (index * 0.1),
        rainfall: index % 2 === 0 ? "Moderate" : "High"
      },
      timestamp: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString()
    };

    const farmerResponse = await axios.post(`${BASE_URL}/api/collection/events`, farmerData);
    const qrCode = farmerResponse.data.data.qrCode;
    console.log(`   ✅ Farmer Event: ${qrCode}`);

    if (batch.status === 'collected') {
      console.log(`   ⏸️ Stopping at collected stage`);
      return qrCode;
    }

    // Add processing if needed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const processingData = {
      originalQrCode: qrCode,
      processingId: `PROC_TEST_${Date.now()}_${index}`,
      processor: {
        name: `${batch.name} Processing Unit`,
        facilityId: `PROC_${index + 1}`,
        contact: `+91 876543210${index}`,
        certification: "GMP",
        license: `PRC202400${index + 1}`,
        location: `Processing Center, ${batch.location}`
      },
      processing: {
        method: index % 2 === 0 ? "Steam Distillation" : "Air Drying",
        equipment: `Equipment-${index + 1}`,
        temperature: `${80 + (index * 5)}`,
        duration: `${4 + index} hours`,
        humidity: `${65 + index}%`,
        batchSize: `${2.0 + index} kg`,
        yield: `${85 + index}%`,
        notes: `Processing completed for ${batch.name}`
      },
      quality: {
        moisture: `${7 + (index * 0.2)}%`,
        color: "Excellent",
        texture: "Good",
        aroma: "Strong",
        contamination: "None detected",
        packaging: "Vacuum sealed",
        storageConditions: "Cool & Dry",
        notes: "Quality parameters within range"
      },
      timestamp: new Date(Date.now() - ((index * 24 * 60 * 60 * 1000) - (6 * 60 * 60 * 1000))).toISOString()
    };

    await axios.post(`${BASE_URL}/api/processing/events`, processingData);
    console.log(`   ✅ Processing Event`);

    if (batch.status === 'processed') {
      console.log(`   ⏸️ Stopping at processed stage`);
      return qrCode;
    }

    // Add lab testing if needed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const labData = {
      originalQrCode: qrCode,
      testId: `TEST_${Date.now()}_${index}`,
      lab: {
        name: `${batch.name} Quality Labs`,
        labId: `LAB_${index + 1}`,
        contact: `+91 765432109${index}`,
        certification: "ISO/IEC 17025",
        technician: `Dr. Analyst ${index + 1}`,
        location: `Testing Lab, ${batch.location}`
      },
      tests: {
        moisture: `${6.5 + (index * 0.3)}%`,
        pesticides: "Not Detected",
        heavyMetals: "Within Limits",
        microbial: "Acceptable",
        dnaAuthenticity: "Confirmed",
        activeCompounds: `${3.0 + (index * 0.2)}%`,
        purity: `${96 + index}%`,
        contamination: "None",
        notes: `All tests passed for ${batch.name}`
      },
      certificate: {
        certificateId: `CERT_${Date.now()}_${index}`,
        testDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        overallGrade: index === 0 ? "A+" : index === 1 ? "A" : "B+",
        compliance: "Fully Compliant",
        recommendations: "Maintain storage conditions",
        notes: `High quality ${batch.name} sample`,
        issued: new Date().toISOString(),
        issuedBy: `${batch.name} Quality Labs`
      },
      timestamp: new Date(Date.now() - ((index * 24 * 60 * 60 * 1000) - (12 * 60 * 60 * 1000))).toISOString()
    };

    await axios.post(`${BASE_URL}/api/lab/events`, labData);
    console.log(`   ✅ Lab Testing Event`);

    if (batch.status === 'tested') {
      console.log(`   ⏸️ Stopping at tested stage`);
      return qrCode;
    }

    // Add regulatory approval if needed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const regulatoryData = {
      qrCode: qrCode,
      decision: "approved",
      reviewerId: `REV_${Date.now()}_${index}`,
      reviewer: {
        name: "Test Regulatory Authority",
        regulatorId: `REG_${index + 1}`,
        contact: `+91 654321098${index}`,
        certification: "FDA Approved",
        license: `REG202400${index + 1}`,
        location: "Regulatory Office"
      },
      reason: `${batch.name} meets all regulatory standards with ${index === 0 ? 'A+' : index === 1 ? 'A' : 'B+'} grade certification.`,
      timestamp: new Date(Date.now() - ((index * 24 * 60 * 60 * 1000) - (18 * 60 * 60 * 1000))).toISOString()
    };

    await axios.post(`${BASE_URL}/api/regulator/review`, regulatoryData);
    console.log(`   ✅ Regulatory Approval`);
    console.log(`   🎉 Complete workflow: ${qrCode}`);

    return qrCode;

  } catch (error) {
    console.error(`   ❌ Failed to create ${batch.name}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function createAllTestData() {
  try {
    console.log('Checking backend connection...');
    await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Backend connected');

    const qrCodes = [];
    
    for (let i = 0; i < testBatches.length; i++) {
      const qrCode = await createTestBatch(testBatches[i], i);
      if (qrCode) {
        qrCodes.push({
          name: testBatches[i].name,
          qrCode: qrCode,
          status: testBatches[i].status
        });
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 TEST DATA CREATION COMPLETED!');
    console.log('=================================');
    console.log('\n📋 Created Test Batches:');
    
    qrCodes.forEach((batch, index) => {
      console.log(`${index + 1}. ${batch.name}`);
      console.log(`   QR Code: ${batch.qrCode}`);
      console.log(`   Status: ${batch.status}`);
      console.log('');
    });

    console.log('🌐 Test in Portals:');
    console.log('   Consumer Portal: http://localhost:3001');
    console.log('   Farmer Portal: http://localhost:3002');
    console.log('   Processor Portal: http://localhost:3004');
    console.log('   Lab Portal: http://localhost:3005');
    console.log('   Regulator Portal: http://localhost:3007');
    console.log('   Management Portal: http://localhost:3008');

  } catch (error) {
    console.error('❌ Failed to create test data:', error.message);
    console.log('\n🔧 Make sure the backend is running:');
    console.log('   npm run dev:backend');
  }
}

createAllTestData();
