/**
 * Authentication routes
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Enhanced demo users with more roles and profile data
const demoUsers = [
  {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@traceherb.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    name: 'System Administrator',
    permissions: ['all'],
    profile: {
      organization: 'TRACE HERB System',
      department: 'IT Administration',
      phone: '+1-555-0001',
      address: 'System HQ'
    }
  },
  {
    id: 'farmer-001',
    username: 'farmer1',
    email: 'farmer1@traceherb.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'farmer',
    name: 'John Smith',
    permissions: ['herb_register', 'herb_manage', 'qr_generate', 'profile_manage'],
    profile: {
      farmName: 'Green Valley Farm',
      farmId: 'FARM-001',
      location: 'California, USA',
      phone: '+1-555-0101',
      address: '123 Farm Road, Green Valley, CA',
      certifications: ['Organic', 'Fair Trade'],
      specialties: ['Medicinal Herbs', 'Aromatic Plants']
    }
  },
  {
    id: 'farmer-demo',
    username: 'farmerdemo',
    email: 'farmer@traceherbdemo.com',
    password: '$2a$10$tp.icDi1lm071.vG30rTG.NUhDCVlSyGvLiFh68GAsMGgt6G.bQsC', // password123
    role: 'farmer',
    name: 'Ravi Kumar',
    permissions: ['herb_register', 'herb_manage', 'qr_generate', 'profile_manage'],
    profile: {
      farmName: 'Organic Spice Farm',
      farmId: 'FARM-DEMO',
      location: 'Kerala, India',
      phone: '+91-9876543210',
      address: 'Village Kumbakonam, Kerala 686001',
      certifications: ['USDA Organic', 'Fair Trade'],
      specialties: ['Turmeric', 'Cardamom', 'Black Pepper']
    }
  },
  {
    id: 'farmer-002',
    username: 'farmer2',
    email: 'farmer2@traceherb.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'farmer',
    name: 'Maria Garcia',
    permissions: ['herb_register', 'herb_manage', 'qr_generate', 'profile_manage'],
    profile: {
      farmName: 'Sunrise Herbs',
      farmId: 'FARM-002',
      location: 'Oregon, USA',
      phone: '+1-555-0102',
      address: '456 Herb Lane, Sunrise, OR',
      certifications: ['Organic', 'Biodynamic'],
      specialties: ['Culinary Herbs', 'Tea Plants']
    }
  },
  {
    id: 'processor-001',
    username: 'processor1',
    email: 'processor1@traceherb.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'processor',
    name: 'David Chen',
    permissions: ['herb_process', 'quality_check', 'batch_manage', 'profile_manage'],
    profile: {
      companyName: 'Natural Processing Co.',
      processorId: 'PROC-001',
      location: 'Colorado, USA',
      phone: '+1-555-0201',
      address: '789 Processing Ave, Denver, CO',
      certifications: ['GMP', 'ISO 9001'],
      specialties: ['Extraction', 'Drying', 'Packaging']
    }
  },
  {
    id: 'lab-001',
    username: 'lab1',
    email: 'lab1@traceherb.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'lab',
    name: 'Dr. Sarah Johnson',
    permissions: ['quality_test', 'lab_report', 'certification', 'profile_manage'],
    profile: {
      labName: 'HerbTest Laboratories',
      labId: 'LAB-001',
      location: 'New York, USA',
      phone: '+1-555-0301',
      address: '321 Science Blvd, New York, NY',
      certifications: ['ISO 17025', 'FDA Registered'],
      specialties: ['Potency Testing', 'Contaminant Analysis', 'Authenticity Verification']
    }
  },
  {
    id: 'regulator-001',
    username: 'regulator1',
    email: 'regulator1@traceherb.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'regulator',
    name: 'Michael Brown',
    permissions: ['audit', 'compliance_check', 'report_view', 'profile_manage'],
    profile: {
      agency: 'Herbal Products Regulatory Agency',
      regulatorId: 'REG-001',
      location: 'Washington, DC',
      phone: '+1-555-0401',
      address: '555 Regulatory Plaza, Washington, DC',
      jurisdiction: 'Federal',
      specialties: ['Compliance Auditing', 'Safety Assessment', 'Market Surveillance']
    }
  },
  {
    id: 'consumer-001',
    username: 'consumer1',
    email: 'consumer1@traceherb.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'consumer',
    name: 'Emily Wilson',
    permissions: ['product_verify', 'trace_view', 'profile_manage'],
    profile: {
      consumerId: 'CONS-001',
      location: 'Texas, USA',
      phone: '+1-555-0501',
      preferences: ['Organic Products', 'Local Sourcing'],
      interests: ['Wellness', 'Natural Health']
    }
  }
];

/**
 * @route   POST /api/auth/login
 * @desc    Login user with enhanced profile data
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password, portal } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide username and password'
      });
    }

    // Find user (support both username and email)
    const user = demoUsers.find(u =>
      u.username === username || u.email === username
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Validate portal access based on role
    const portalAccess = {
      'farmer': ['farmer', 'dashboard'],
      'processor': ['processor', 'dashboard'],
      'lab': ['lab', 'dashboard'],
      'regulator': ['regulator', 'dashboard'],
      'consumer': ['consumer'],
      'admin': ['farmer', 'processor', 'lab', 'regulator', 'consumer', 'dashboard']
    };

    if (portal && !portalAccess[user.role]?.includes(portal)) {
      return res.status(403).json({
        success: false,
        error: `Access denied: ${user.role} cannot access ${portal} portal`
      });
    }

    // Create enhanced JWT token with more user data
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      portal: portal || 'dashboard'
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '7d' } // Extended to 7 days for persistent sessions
    );

    // Create refresh token for long-term sessions
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'demo-refresh-secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          name: user.name,
          permissions: user.permissions,
          profile: user.profile,
          portalAccess: portalAccess[user.role]
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new farmer user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, farmName, location, contactNumber, specialization, role = 'farmer' } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = demoUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique IDs
    const userId = `${role}-${Date.now()}`;
    const username = email.split('@')[0] + Date.now();
    const farmId = farmName ? `FARM-${Date.now()}` : null;

    // Create new user
    const newUser = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      role,
      name,
      permissions: role === 'farmer' ? ['herb_register', 'herb_manage', 'qr_generate', 'profile_manage'] : [],
      profile: {
        farmName: farmName || '',
        farmId,
        location: location || '',
        phone: contactNumber || '',
        address: '',
        certifications: [],
        specialties: specialization || []
      }
    };

    // Add to users array (in production, this would be saved to database)
    demoUsers.push(newUser);

    // Generate JWT token
    const tokenPayload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      permissions: newUser.permissions,
      portal: 'farmer'
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '7d' }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      { id: newUser.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'demo-refresh-secret',
      { expiresIn: '30d' }
    );

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        refreshToken,
        user: {
          ...userWithoutPassword,
          portalAccess: ['farmer', 'dashboard']
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'demo-refresh-secret');

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Find user
    const user = demoUsers.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create new access token
    const newToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    // Find user from token
    const user = demoUsers.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        permissions: user.permissions,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, profile } = req.body;

    // Find user
    const userIndex = demoUsers.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user data
    if (name) demoUsers[userIndex].name = name;
    if (profile) {
      demoUsers[userIndex].profile = {
        ...demoUsers[userIndex].profile,
        ...profile
      };
    }

    res.json({
      success: true,
      data: {
        id: demoUsers[userIndex].id,
        username: demoUsers[userIndex].username,
        email: demoUsers[userIndex].email,
        role: demoUsers[userIndex].role,
        name: demoUsers[userIndex].name,
        permissions: demoUsers[userIndex].permissions,
        profile: demoUsers[userIndex].profile
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate tokens)
 * @access  Private
 */
router.post('/logout', protect, async (req, res) => {
  try {
    // In a real implementation, you would add the token to a blacklist
    // For demo purposes, we'll just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/users', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Admin role required'
      });
    }

    // Return users without passwords
    const users = demoUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions,
      profile: user.profile
    }));

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
