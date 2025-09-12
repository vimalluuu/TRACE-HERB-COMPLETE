/*
 * TRACE HERB Smart Contract (Chaincode)
 * Hyperledger Fabric chaincode for herb traceability
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class HerbTraceabilityContract extends Contract {

    /**
     * Initialize the ledger with sample data
     */
    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        const herbs = [
            {
                id: 'herb001',
                botanicalName: 'Withania somnifera',
                commonName: 'Ashwagandha',
                collectionDate: '2024-01-15T08:30:00.000Z',
                location: {
                    latitude: 19.7645,
                    longitude: 74.4769,
                    address: 'Shirdi, Ahmednagar, Maharashtra, India'
                },
                collector: 'Farmer001',
                quantity: 25.5,
                status: 'collected',
                certifications: ['organic', 'fair-trade'],
                timestamp: new Date().toISOString()
            }
        ];

        for (let i = 0; i < herbs.length; i++) {
            herbs[i].docType = 'herb';
            await ctx.stub.putState(herbs[i].id, Buffer.from(JSON.stringify(herbs[i])));
            console.info('Added <--> ', herbs[i]);
        }
        
        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * Create a new collection event
     */
    async CreateCollectionEvent(ctx, collectionEventId, collectionEventData) {
        console.info('============= START : Create Collection Event ===========');

        const exists = await this.HerbExists(ctx, collectionEventId);
        if (exists) {
            throw new Error(`The collection event ${collectionEventId} already exists`);
        }

        const collectionEvent = JSON.parse(collectionEventData);
        collectionEvent.docType = 'collectionEvent';
        collectionEvent.id = collectionEventId;
        collectionEvent.timestamp = new Date().toISOString();
        collectionEvent.txId = ctx.stub.getTxID();
        collectionEvent.creator = ctx.clientIdentity.getID();

        // Validate required fields
        if (!collectionEvent.botanicalName || !collectionEvent.location || !collectionEvent.quantity) {
            throw new Error('Missing required fields: botanicalName, location, quantity');
        }

        await ctx.stub.putState(collectionEventId, Buffer.from(JSON.stringify(collectionEvent)));
        
        // Emit event
        ctx.stub.setEvent('CollectionEventCreated', Buffer.from(JSON.stringify({
            id: collectionEventId,
            botanicalName: collectionEvent.botanicalName,
            location: collectionEvent.location,
            timestamp: collectionEvent.timestamp
        })));

        console.info('============= END : Create Collection Event ===========');
        return JSON.stringify(collectionEvent);
    }

    /**
     * Create a processing step
     */
    async CreateProcessingStep(ctx, processingStepId, processingStepData) {
        console.info('============= START : Create Processing Step ===========');

        const exists = await this.HerbExists(ctx, processingStepId);
        if (exists) {
            throw new Error(`The processing step ${processingStepId} already exists`);
        }

        const processingStep = JSON.parse(processingStepData);
        processingStep.docType = 'processingStep';
        processingStep.id = processingStepId;
        processingStep.timestamp = new Date().toISOString();
        processingStep.txId = ctx.stub.getTxID();
        processingStep.creator = ctx.clientIdentity.getID();

        // Validate input reference exists
        if (processingStep.inputReference) {
            const inputExists = await this.HerbExists(ctx, processingStep.inputReference);
            if (!inputExists) {
                throw new Error(`Input reference ${processingStep.inputReference} does not exist`);
            }
        }

        await ctx.stub.putState(processingStepId, Buffer.from(JSON.stringify(processingStep)));
        
        // Emit event
        ctx.stub.setEvent('ProcessingStepCreated', Buffer.from(JSON.stringify({
            id: processingStepId,
            processType: processingStep.processType,
            inputReference: processingStep.inputReference,
            timestamp: processingStep.timestamp
        })));

        console.info('============= END : Create Processing Step ===========');
        return JSON.stringify(processingStep);
    }

    /**
     * Create a quality test record
     */
    async CreateQualityTest(ctx, qualityTestId, qualityTestData) {
        console.info('============= START : Create Quality Test ===========');

        const exists = await this.HerbExists(ctx, qualityTestId);
        if (exists) {
            throw new Error(`The quality test ${qualityTestId} already exists`);
        }

        const qualityTest = JSON.parse(qualityTestData);
        qualityTest.docType = 'qualityTest';
        qualityTest.id = qualityTestId;
        qualityTest.timestamp = new Date().toISOString();
        qualityTest.txId = ctx.stub.getTxID();
        qualityTest.creator = ctx.clientIdentity.getID();

        // Validate subject reference exists
        if (qualityTest.subjectReference) {
            const subjectExists = await this.HerbExists(ctx, qualityTest.subjectReference);
            if (!subjectExists) {
                throw new Error(`Subject reference ${qualityTest.subjectReference} does not exist`);
            }
        }

        await ctx.stub.putState(qualityTestId, Buffer.from(JSON.stringify(qualityTest)));
        
        // Emit event
        ctx.stub.setEvent('QualityTestCreated', Buffer.from(JSON.stringify({
            id: qualityTestId,
            testType: qualityTest.testType,
            result: qualityTest.result,
            subjectReference: qualityTest.subjectReference,
            timestamp: qualityTest.timestamp
        })));

        console.info('============= END : Create Quality Test ===========');
        return JSON.stringify(qualityTest);
    }

    /**
     * Create a complete provenance record
     */
    async CreateProvenance(ctx, provenanceId, provenanceData) {
        console.info('============= START : Create Provenance ===========');

        const exists = await this.HerbExists(ctx, provenanceId);
        if (exists) {
            throw new Error(`The provenance record ${provenanceId} already exists`);
        }

        const provenance = JSON.parse(provenanceData);
        provenance.docType = 'provenance';
        provenance.id = provenanceId;
        provenance.timestamp = new Date().toISOString();
        provenance.txId = ctx.stub.getTxID();
        provenance.creator = ctx.clientIdentity.getID();
        provenance.blockNumber = ctx.stub.getTxTimestamp().seconds;

        // Generate blockchain-specific metadata
        provenance.blockchain = {
            networkId: 'trace-herb-network',
            channelId: ctx.stub.getChannelID(),
            chaincodeId: 'herb-traceability',
            transactionId: ctx.stub.getTxID(),
            blockNumber: ctx.stub.getTxTimestamp().seconds,
            timestamp: new Date().toISOString(),
            creator: ctx.clientIdentity.getID(),
            mspId: ctx.clientIdentity.getMSPID()
        };

        await ctx.stub.putState(provenanceId, Buffer.from(JSON.stringify(provenance)));
        
        // Create QR code mapping
        if (provenance.target && provenance.target.qrCode) {
            const qrMapping = {
                qrCode: provenance.target.qrCode,
                provenanceId: provenanceId,
                timestamp: new Date().toISOString()
            };
            await ctx.stub.putState(`qr_${provenance.target.qrCode}`, Buffer.from(JSON.stringify(qrMapping)));
        }
        
        // Emit event
        ctx.stub.setEvent('ProvenanceCreated', Buffer.from(JSON.stringify({
            id: provenanceId,
            qrCode: provenance.target?.qrCode,
            productName: provenance.product?.name,
            timestamp: provenance.timestamp
        })));

        console.info('============= END : Create Provenance ===========');
        return JSON.stringify(provenance);
    }

    /**
     * Read a herb record by ID
     */
    async ReadHerb(ctx, id) {
        const herbJSON = await ctx.stub.getState(id);
        if (!herbJSON || herbJSON.length === 0) {
            throw new Error(`The herb ${id} does not exist`);
        }
        return herbJSON.toString();
    }

    /**
     * Get provenance by QR code
     */
    async GetProvenanceByQR(ctx, qrCode) {
        console.info('============= START : Get Provenance By QR ===========');
        
        // First get the QR mapping
        const qrMappingJSON = await ctx.stub.getState(`qr_${qrCode}`);
        if (!qrMappingJSON || qrMappingJSON.length === 0) {
            throw new Error(`QR code ${qrCode} not found`);
        }
        
        const qrMapping = JSON.parse(qrMappingJSON.toString());
        
        // Then get the actual provenance record
        const provenanceJSON = await ctx.stub.getState(qrMapping.provenanceId);
        if (!provenanceJSON || provenanceJSON.length === 0) {
            throw new Error(`Provenance record ${qrMapping.provenanceId} not found`);
        }
        
        const provenance = JSON.parse(provenanceJSON.toString());
        
        // Update scan count
        if (!provenance.consumer) {
            provenance.consumer = { scanCount: 0 };
        }
        provenance.consumer.scanCount += 1;
        provenance.consumer.lastScan = new Date().toISOString();
        if (!provenance.consumer.firstScan) {
            provenance.consumer.firstScan = new Date().toISOString();
        }
        
        // Update the record
        await ctx.stub.putState(qrMapping.provenanceId, Buffer.from(JSON.stringify(provenance)));
        
        console.info('============= END : Get Provenance By QR ===========');
        return JSON.stringify(provenance);
    }

    /**
     * Check if a herb record exists
     */
    async HerbExists(ctx, id) {
        const herbJSON = await ctx.stub.getState(id);
        return herbJSON && herbJSON.length > 0;
    }

    /**
     * Get all herbs (with pagination)
     */
    async GetAllHerbs(ctx, startKey, endKey) {
        const resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
        const results = await this._getAllResults(resultsIterator, false);
        return JSON.stringify(results);
    }

    /**
     * Get herb history
     */
    async GetHerbHistory(ctx, id) {
        console.info('- start getHerbHistory: %s\n', id);

        const resultsIterator = await ctx.stub.getHistoryForKey(id);
        const results = await this._getAllResults(resultsIterator, true);

        return JSON.stringify(results);
    }

    /**
     * Helper function to get all results from iterator
     */
    async _getAllResults(iterator, isHistory) {
        let allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.txId;
                    jsonRes.Timestamp = res.value.timestamp;
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        iterator.close();
        return allResults;
    }
}

module.exports = HerbTraceabilityContract;
