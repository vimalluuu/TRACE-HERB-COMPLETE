/**
 * Shared Authentication Utility
 * Used across all frontend portals for unified authentication
 */

class AuthManager {
  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    this.tokenKey = 'trace_herb_token';
    this.refreshTokenKey = 'trace_herb_refresh_token';
    this.userKey = 'trace_herb_user';
    this.portalKey = 'trace_herb_current_portal';
  }

  /**
   * Login user
   */
  async login(username, password, portal = 'dashboard') {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, portal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tokens and user data
      localStorage.setItem(this.tokenKey, data.data.token);
      localStorage.setItem(this.refreshTokenKey, data.data.refreshToken);
      localStorage.setItem(this.userKey, JSON.stringify(data.data.user));
      localStorage.setItem(this.portalKey, portal);

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch(`${this.apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.portalKey);
    }
  }

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Get stored user data
   */
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get current portal
   */
  getCurrentPortal() {
    return localStorage.getItem(this.portalKey) || 'dashboard';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission) {
    const user = this.getUser();
    if (!user || !user.permissions) {
      return false;
    }

    // Admin has all permissions
    if (user.permissions.includes('all')) {
      return true;
    }

    return user.permissions.includes(permission);
  }

  /**
   * Check if user can access portal
   */
  canAccessPortal(portal) {
    const user = this.getUser();
    if (!user || !user.portalAccess) {
      return false;
    }

    return user.portalAccess.includes(portal);
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      // Update stored token
      localStorage.setItem(this.tokenKey, data.data.token);

      return data.data.token;
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw error;
    }
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint, options = {}) {
    let token = this.getToken();

    if (!token) {
      throw new Error('No authentication token');
    }

    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      let response = await fetch(`${this.apiBaseUrl}${endpoint}`, config);

      // If token expired, try to refresh
      if (response.status === 401) {
        token = await this.refreshToken();
        config.headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(`${this.apiBaseUrl}${endpoint}`, config);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    try {
      const data = await this.apiRequest('/auth/me');
      
      // Update stored user data
      localStorage.setItem(this.userKey, JSON.stringify(data.data));
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const data = await this.apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      // Update stored user data
      localStorage.setItem(this.userKey, JSON.stringify(data.data));

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Switch portal (if user has access)
   */
  switchPortal(portal) {
    if (!this.canAccessPortal(portal)) {
      throw new Error(`Access denied to ${portal} portal`);
    }

    localStorage.setItem(this.portalKey, portal);
    
    // Redirect to portal
    const portalUrls = {
      'farmer': 'http://localhost:3002',
      'consumer': 'http://localhost:3001',
      'dashboard': 'http://localhost:3003',
      'processor': 'http://localhost:3004',
      'lab': 'http://localhost:3005',
      'regulator': 'http://localhost:3006'
    };

    if (portalUrls[portal]) {
      window.location.href = portalUrls[portal];
    }
  }

  /**
   * Get available portals for current user
   */
  getAvailablePortals() {
    const user = this.getUser();
    return user?.portalAccess || [];
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Export for use in different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = authManager;
} else if (typeof window !== 'undefined') {
  window.AuthManager = authManager;
}
