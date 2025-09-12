/**
 * Database Service - Demo Mode
 * Simulates database operations for demonstration
 */

class DatabaseService {
  constructor() {
    this.data = new Map(); // In-memory storage for demo
    this.isConnected = false;
  }

  /**
   * Initialize database connection
   */
  async connect() {
    try {
      console.log('Connecting to database (demo mode)...');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isConnected = true;
      console.log('Database service connected successfully (demo mode)');

    } catch (error) {
      console.error('Failed to connect to database service:', error);
      throw error;
    }
  }

  /**
   * Save collection event
   */
  async saveCollectionEvent(collectionEvent) {
    try {
      if (!this.isConnected) {
        throw new Error('Database service not connected');
      }

      this.data.set(`collection-${collectionEvent.id}`, collectionEvent);
      console.log(`Collection event saved: ${collectionEvent.id}`);
      
      return { success: true, id: collectionEvent.id };

    } catch (error) {
      console.error('Error saving collection event:', error);
      throw error;
    }
  }

  /**
   * Get collection event by ID
   */
  async getCollectionEvent(id) {
    try {
      if (!this.isConnected) {
        throw new Error('Database service not connected');
      }

      const collectionEvent = this.data.get(`collection-${id}`);
      return collectionEvent || null;

    } catch (error) {
      console.error('Error getting collection event:', error);
      throw error;
    }
  }

  /**
   * Save provenance record
   */
  async saveProvenance(provenance) {
    try {
      if (!this.isConnected) {
        throw new Error('Database service not connected');
      }

      this.data.set(`provenance-${provenance.id}`, provenance);
      console.log(`Provenance saved: ${provenance.id}`);
      
      return { success: true, id: provenance.id };

    } catch (error) {
      console.error('Error saving provenance:', error);
      throw error;
    }
  }

  /**
   * Get provenance by QR code
   */
  async getProvenanceByQR(qrCode) {
    try {
      if (!this.isConnected) {
        throw new Error('Database service not connected');
      }

      // Search through all provenance records
      for (const [key, value] of this.data.entries()) {
        if (key.startsWith('provenance-') && value.target && value.target.qrCode === qrCode) {
          return value;
        }
      }

      return null;

    } catch (error) {
      console.error('Error getting provenance by QR:', error);
      throw error;
    }
  }

  /**
   * Get database status
   */
  async getStatus() {
    return {
      connected: this.isConnected,
      recordCount: this.data.size,
      status: this.isConnected ? 'HEALTHY' : 'DISCONNECTED'
    };
  }

  /**
   * Load demo data
   */
  async loadDemoData(demoData) {
    try {
      console.log('Loading demo data into database...');

      // Load collection event
      if (demoData.collectionEvent) {
        await this.saveCollectionEvent(demoData.collectionEvent);
      }

      // Load provenance
      if (demoData.provenance) {
        await this.saveProvenance(demoData.provenance);
      }

      console.log('Demo data loaded into database successfully');
      return { success: true, message: 'Demo data loaded' };

    } catch (error) {
      console.error('Error loading demo data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

// Export both the service and the connect function for compatibility
module.exports = databaseService;
module.exports.connectToDatabase = () => databaseService.connect();
