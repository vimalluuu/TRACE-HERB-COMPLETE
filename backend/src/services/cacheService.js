/**
 * Cache Service - Demo Mode
 * Simulates cache operations for demonstration
 */

class CacheService {
  constructor() {
    this.cache = new Map(); // In-memory cache for demo
    this.isConnected = false;
  }

  /**
   * Initialize cache connection
   */
  async connect() {
    try {
      console.log('Connecting to cache service (demo mode)...');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      this.isConnected = true;
      console.log('Cache service connected successfully (demo mode)');

    } catch (error) {
      console.error('Failed to connect to cache service:', error);
      throw error;
    }
  }

  /**
   * Set cache value
   */
  async set(key, value, ttl = 3600) {
    try {
      if (!this.isConnected) {
        throw new Error('Cache service not connected');
      }

      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(key, { value, expiry });
      
      return true;

    } catch (error) {
      console.error('Error setting cache value:', error);
      throw error;
    }
  }

  /**
   * Get cache value
   */
  async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Cache service not connected');
      }

      const cached = this.cache.get(key);
      
      if (!cached) {
        return null;
      }

      // Check if expired
      if (Date.now() > cached.expiry) {
        this.cache.delete(key);
        return null;
      }

      return cached.value;

    } catch (error) {
      console.error('Error getting cache value:', error);
      throw error;
    }
  }

  /**
   * Delete cache value
   */
  async del(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Cache service not connected');
      }

      return this.cache.delete(key);

    } catch (error) {
      console.error('Error deleting cache value:', error);
      throw error;
    }
  }

  /**
   * Get cache status
   */
  async getStatus() {
    return {
      connected: this.isConnected,
      keyCount: this.cache.size,
      status: this.isConnected ? 'HEALTHY' : 'DISCONNECTED'
    };
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Export both the service and the connect function for compatibility
module.exports = cacheService;
module.exports.connectToRedis = () => cacheService.connect();
