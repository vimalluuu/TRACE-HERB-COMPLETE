/**
 * Unified Authentication Service
 * Handles authentication across all portals with persistent sessions
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.activeTokens = new Map(); // In-memory token store (use Redis in production)
    this.refreshTokens = new Map(); // In-memory refresh token store
  }

  /**
   * Generate access token
   */
  generateAccessToken(user, portal = 'dashboard') {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      portal: portal,
      type: 'access'
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '7d' }
    );

    // Store token in active tokens
    this.activeTokens.set(token, {
      userId: user.id,
      portal: portal,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return token;
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user.id,
      type: 'refresh'
    };

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'demo-refresh-secret',
      { expiresIn: '30d' }
    );

    // Store refresh token
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    return refreshToken;
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      // Check if token is in active tokens
      if (!this.activeTokens.has(token)) {
        throw new Error('Token not found in active tokens');
      }

      const tokenData = this.activeTokens.get(token);
      
      // Check if token is expired
      if (new Date() > tokenData.expiresAt) {
        this.activeTokens.delete(token);
        throw new Error('Token expired');
      }

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(refreshToken) {
    try {
      // Check if refresh token exists
      if (!this.refreshTokens.has(refreshToken)) {
        throw new Error('Refresh token not found');
      }

      const tokenData = this.refreshTokens.get(refreshToken);
      
      // Check if token is expired
      if (new Date() > tokenData.expiresAt) {
        this.refreshTokens.delete(refreshToken);
        throw new Error('Refresh token expired');
      }

      // Verify JWT
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'demo-refresh-secret');
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Invalidate token (logout)
   */
  invalidateToken(token) {
    this.activeTokens.delete(token);
  }

  /**
   * Invalidate refresh token
   */
  invalidateRefreshToken(refreshToken) {
    this.refreshTokens.delete(refreshToken);
  }

  /**
   * Invalidate all tokens for a user
   */
  invalidateAllUserTokens(userId) {
    // Remove all access tokens for user
    for (const [token, data] of this.activeTokens.entries()) {
      if (data.userId === userId) {
        this.activeTokens.delete(token);
      }
    }

    // Remove all refresh tokens for user
    for (const [refreshToken, data] of this.refreshTokens.entries()) {
      if (data.userId === userId) {
        this.refreshTokens.delete(refreshToken);
      }
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(user, permission) {
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
  canAccessPortal(user, portal) {
    const portalAccess = {
      'farmer': ['farmer', 'dashboard'],
      'processor': ['processor', 'dashboard'],
      'lab': ['lab', 'dashboard'],
      'regulator': ['regulator', 'dashboard'],
      'consumer': ['consumer'],
      'admin': ['farmer', 'processor', 'lab', 'regulator', 'consumer', 'dashboard']
    };

    return portalAccess[user.role]?.includes(portal) || false;
  }

  /**
   * Get user's accessible portals
   */
  getUserPortals(user) {
    const portalAccess = {
      'farmer': ['farmer', 'dashboard'],
      'processor': ['processor', 'dashboard'],
      'lab': ['lab', 'dashboard'],
      'regulator': ['regulator', 'dashboard'],
      'consumer': ['consumer'],
      'admin': ['farmer', 'processor', 'lab', 'regulator', 'consumer', 'dashboard']
    };

    return portalAccess[user.role] || [];
  }

  /**
   * Clean up expired tokens (should be called periodically)
   */
  cleanupExpiredTokens() {
    const now = new Date();

    // Clean up expired access tokens
    for (const [token, data] of this.activeTokens.entries()) {
      if (now > data.expiresAt) {
        this.activeTokens.delete(token);
      }
    }

    // Clean up expired refresh tokens
    for (const [refreshToken, data] of this.refreshTokens.entries()) {
      if (now > data.expiresAt) {
        this.refreshTokens.delete(refreshToken);
      }
    }
  }

  /**
   * Get active sessions count for a user
   */
  getActiveSessionsCount(userId) {
    let count = 0;
    for (const [token, data] of this.activeTokens.entries()) {
      if (data.userId === userId) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get all active sessions for a user
   */
  getUserActiveSessions(userId) {
    const sessions = [];
    for (const [token, data] of this.activeTokens.entries()) {
      if (data.userId === userId) {
        sessions.push({
          portal: data.portal,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt
        });
      }
    }
    return sessions;
  }
}

// Create singleton instance
const authService = new AuthService();

// Clean up expired tokens every hour
setInterval(() => {
  authService.cleanupExpiredTokens();
}, 60 * 60 * 1000);

module.exports = authService;
