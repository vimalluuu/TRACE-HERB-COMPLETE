/**
 * Enhanced User Service with Profiles
 * Handles user registration, authentication, and profile management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService {
  constructor() {
    // Enhanced user database with detailed profiles
    this.users = [
      {
        id: 1,
        email: 'farmer@traceherbdemo.com',
        password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqK', // 'password123'
        role: 'farmer',
        name: 'Ravi Kumar',
        verified: true,
        createdAt: new Date('2024-01-15'),
        profile: {
          farmName: 'Organic Spice Farm',
          location: 'Kerala, India',
          farmSize: '25 acres',
          certifications: ['USDA Organic', 'Fair Trade'],
          contactNumber: '+91-9876543210',
          address: 'Village Kumbakonam, Kerala 686001',
          specialization: ['Turmeric', 'Cardamom', 'Black Pepper'],
          experience: '15 years',
          bankAccount: 'HDFC Bank - ****1234',
          avatar: '/images/avatars/farmer1.jpg'
        }
      },
      {
        id: 2,
        email: 'processor@traceherbdemo.com',
        password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqK', // 'password123'
        role: 'processor',
        name: 'Amit Patel',
        verified: true,
        createdAt: new Date('2024-01-20'),
        profile: {
          companyName: 'Herbal Processing Industries Ltd.',
          location: 'Mumbai, Maharashtra',
          capacity: '500 tons/month',
          certifications: ['ISO 22000', 'HACCP', 'GMP'],
          contactNumber: '+91-9876543211',
          address: 'Industrial Area, Andheri East, Mumbai 400069',
          specialization: ['Powder Processing', 'Oil Extraction', 'Packaging'],
          established: '2010',
          licenseNumber: 'FSSAI-12345678901234',
          avatar: '/images/avatars/processor1.jpg'
        }
      },
      {
        id: 3,
        email: 'lab@traceherbdemo.com',
        password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqK', // 'password123'
        role: 'lab',
        name: 'Dr. Priya Sharma',
        verified: true,
        createdAt: new Date('2024-01-25'),
        profile: {
          labName: 'Advanced Herbal Testing Laboratory',
          location: 'Bangalore, Karnataka',
          accreditation: ['NABL', 'ISO 17025'],
          contactNumber: '+91-9876543212',
          address: 'Whitefield, Bangalore 560066',
          testingCapabilities: ['Pesticide Analysis', 'Heavy Metals', 'Microbial Testing', 'Potency Analysis'],
          established: '2015',
          licenseNumber: 'NABL-TC-1234',
          avatar: '/images/avatars/lab1.jpg'
        }
      },
      {
        id: 4,
        email: 'regulator@traceherbdemo.com',
        password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqK', // 'password123'
        role: 'regulator',
        name: 'Dr. Meera Singh',
        verified: true,
        createdAt: new Date('2024-02-01'),
        profile: {
          department: 'Food Safety and Standards Authority of India',
          designation: 'Senior Food Safety Officer',
          location: 'New Delhi',
          contactNumber: '+91-9876543213',
          address: 'FDA Bhawan, Kotla Road, New Delhi 110002',
          jurisdiction: ['Maharashtra', 'Karnataka', 'Kerala'],
          experience: '12 years',
          employeeId: 'FSSAI-REG-5678',
          avatar: '/images/avatars/regulator1.jpg'
        }
      },
      {
        id: 5,
        email: 'consumer@traceherbdemo.com',
        password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqKqKqKqKqOzJqKqKqKqKqK', // 'password123'
        role: 'consumer',
        name: 'Sarah Johnson',
        verified: true,
        createdAt: new Date('2024-02-10'),
        profile: {
          location: 'New York, USA',
          contactNumber: '+1-555-123-4567',
          address: '123 Health Street, New York, NY 10001',
          preferences: ['Organic Products', 'Fair Trade', 'Sustainable'],
          memberSince: '2023',
          loyaltyPoints: 1250,
          avatar: '/images/avatars/consumer1.jpg'
        }
      }
    ];
    
    this.nextUserId = 6;
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = this.users.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create new user
      const newUser = {
        id: this.nextUserId++,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        name: userData.name,
        verified: false,
        createdAt: new Date(),
        profile: this.createDefaultProfile(userData.role, userData)
      };

      this.users.push(newUser);

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Find user
      const user = this.users.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  getUserById(id) {
    const user = this.users.find(u => u.id === parseInt(id));
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email) {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  updateProfile(userId, profileData) {
    const userIndex = this.users.findIndex(u => u.id === parseInt(userId));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update profile
    this.users[userIndex].profile = {
      ...this.users[userIndex].profile,
      ...profileData
    };

    // Return updated user without password
    const { password, ...userWithoutPassword } = this.users[userIndex];
    return userWithoutPassword;
  }

  /**
   * Create default profile based on role
   */
  createDefaultProfile(role, userData) {
    const baseProfile = {
      avatar: `/images/avatars/${role}1.jpg`,
      createdAt: new Date()
    };

    switch (role) {
      case 'farmer':
        return {
          ...baseProfile,
          farmName: userData.farmName || '',
          location: userData.location || '',
          farmSize: userData.farmSize || '',
          certifications: userData.certifications || [],
          contactNumber: userData.contactNumber || '',
          address: userData.address || '',
          specialization: userData.specialization || [],
          experience: userData.experience || '',
          bankAccount: userData.bankAccount || ''
        };

      case 'processor':
        return {
          ...baseProfile,
          companyName: userData.companyName || '',
          location: userData.location || '',
          capacity: userData.capacity || '',
          certifications: userData.certifications || [],
          contactNumber: userData.contactNumber || '',
          address: userData.address || '',
          specialization: userData.specialization || [],
          established: userData.established || '',
          licenseNumber: userData.licenseNumber || ''
        };

      case 'lab':
        return {
          ...baseProfile,
          labName: userData.labName || '',
          location: userData.location || '',
          accreditation: userData.accreditation || [],
          contactNumber: userData.contactNumber || '',
          address: userData.address || '',
          testingCapabilities: userData.testingCapabilities || [],
          established: userData.established || '',
          licenseNumber: userData.licenseNumber || ''
        };

      case 'regulator':
        return {
          ...baseProfile,
          department: userData.department || '',
          designation: userData.designation || '',
          location: userData.location || '',
          contactNumber: userData.contactNumber || '',
          address: userData.address || '',
          jurisdiction: userData.jurisdiction || [],
          experience: userData.experience || '',
          employeeId: userData.employeeId || ''
        };

      case 'consumer':
        return {
          ...baseProfile,
          location: userData.location || '',
          contactNumber: userData.contactNumber || '',
          address: userData.address || '',
          preferences: userData.preferences || [],
          memberSince: new Date().getFullYear().toString(),
          loyaltyPoints: 0
        };

      default:
        return baseProfile;
    }
  }

  /**
   * Get all users by role
   */
  getUsersByRole(role) {
    return this.users
      .filter(u => u.role === role)
      .map(({ password, ...user }) => user);
  }

  /**
   * Verify user email
   */
  verifyUser(userId) {
    const userIndex = this.users.findIndex(u => u.id === parseInt(userId));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users[userIndex].verified = true;
    
    // Return updated user without password
    const { password, ...userWithoutPassword } = this.users[userIndex];
    return userWithoutPassword;
  }
}

// Create singleton instance
const userService = new UserService();

module.exports = userService;
