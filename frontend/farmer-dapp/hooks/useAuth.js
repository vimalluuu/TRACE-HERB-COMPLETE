/**
 * Enhanced Authentication Hook
 * Handles user authentication, profile management, and session persistence
 */

import { useState, useEffect, createContext, useContext } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('traceherb_user');
        const storedToken = localStorage.getItem('traceherb_token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('traceherb_user');
        localStorage.removeItem('traceherb_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password, portal = 'farmer') => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password, portal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user and token
      const { user: userData, accessToken: token } = data.data;
      
      setUser(userData);
      setAccessToken(token);
      
      // Persist to localStorage
      localStorage.setItem('traceherb_user', JSON.stringify(userData));
      localStorage.setItem('traceherb_token', token);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Auto-login after registration
      const { user: newUser, accessToken: token } = data.data;
      
      setUser(newUser);
      setAccessToken(token);
      
      // Persist to localStorage
      localStorage.setItem('traceherb_user', JSON.stringify(newUser));
      localStorage.setItem('traceherb_token', token);

      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if token exists
      if (accessToken) {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local state
      setUser(null);
      setAccessToken(null);
      
      // Clear localStorage
      localStorage.removeItem('traceherb_user');
      localStorage.removeItem('traceherb_token');
      localStorage.removeItem('traceherb_refresh_token');
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update local user state
      const updatedUser = data.data.user;
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('traceherb_user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Get current user profile
  const getCurrentUser = async () => {
    try {
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      const userData = data.data.user;
      setUser(userData);
      localStorage.setItem('traceherb_user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Get current user error:', error);
      // If token is invalid, logout
      if (error.message.includes('token') || error.message.includes('unauthorized')) {
        logout();
      }
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(user && accessToken);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    return accessToken ? {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    };
  };

  // Make authenticated API call
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // If unauthorized, logout
        if (response.status === 401 || response.status === 403) {
          logout();
        }
        throw new Error(data.message || 'API call failed');
      }

      return data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    accessToken,
    login,
    register,
    logout,
    updateProfile,
    getCurrentUser,
    isAuthenticated,
    hasRole,
    getAuthHeaders,
    apiCall,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (WrappedComponent, requiredRole = null) => {
  return function AuthenticatedComponent(props) {
    const { user, loading, isAuthenticated, hasRole } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (!isAuthenticated()) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Enhanced standalone auth hook for farmer portal with signup and profile management
export const useStandaloneAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('traceHerbUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('traceHerbUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials, portalType) => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if logging in with phone number
      const loginField = credentials.username || credentials.phoneNumber

      if (loginField && credentials.password) {
        // Check if user exists in localStorage (for demo purposes)
        const existingUsers = JSON.parse(localStorage.getItem('traceHerbUsers') || '[]')
        let foundUser = null

        // Find user by phone number or username
        foundUser = existingUsers.find(u =>
          u.phoneNumber === loginField ||
          u.username === loginField ||
          u.email === loginField
        )

        if (foundUser && foundUser.password === credentials.password) {
          const userData = {
            ...foundUser,
            loginTime: new Date().toISOString(),
            portalType: portalType || 'farmer'
          }

          setUser(userData)
          localStorage.setItem('traceHerbUser', JSON.stringify(userData))
          setLoading(false)
          return { success: true, user: userData }
        } else if (loginField === 'demo' && credentials.password === 'demo123') {
          // Demo user fallback
          const userData = {
            id: 'demo-user',
            username: 'demo',
            firstName: 'Demo',
            lastName: 'Farmer',
            phoneNumber: '1234567890',
            email: 'demo@farmer.com',
            farmName: 'Demo Farm',
            farmLocation: 'Demo Location',
            portalType: portalType || 'farmer',
            loginTime: new Date().toISOString(),
            role: getRoleByPortal(portalType || 'farmer')
          }

          setUser(userData)
          localStorage.setItem('traceHerbUser', JSON.stringify(userData))
          setLoading(false)
          return { success: true, user: userData }
        } else {
          setLoading(false)
          return { success: false, error: 'Invalid phone number or password' }
        }
      } else {
        setLoading(false)
        return { success: false, error: 'Phone number and password are required' }
      }
    } catch (error) {
      setLoading(false)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const signup = async (formData) => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('traceHerbUsers') || '[]')
      const userExists = existingUsers.find(u =>
        u.phoneNumber === formData.phoneNumber ||
        u.email === formData.email
      )

      if (userExists) {
        setLoading(false)
        return { success: false, error: 'User with this phone number or email already exists' }
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username: formData.phoneNumber, // Use phone number as username
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        farmSize: formData.farmSize,
        cropTypes: formData.cropTypes,
        experience: formData.experience,
        certifications: formData.certifications,
        portalType: 'farmer',
        role: 'Farmer',
        createdAt: new Date().toISOString()
      }

      // Save to localStorage
      existingUsers.push(newUser)
      localStorage.setItem('traceHerbUsers', JSON.stringify(existingUsers))

      // Auto-login the new user
      const userData = { ...newUser, loginTime: new Date().toISOString() }
      setUser(userData)
      localStorage.setItem('traceHerbUser', JSON.stringify(userData))

      setLoading(false)
      return { success: true, user: userData }
    } catch (error) {
      setLoading(false)
      return { success: false, error: 'Signup failed. Please try again.' }
    }
  }

  const updateProfile = async (profileData) => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update user in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('traceHerbUsers') || '[]')
      const userIndex = existingUsers.findIndex(u => u.id === user.id)

      if (userIndex !== -1) {
        existingUsers[userIndex] = { ...existingUsers[userIndex], ...profileData }
        localStorage.setItem('traceHerbUsers', JSON.stringify(existingUsers))

        // Update current user
        const updatedUser = { ...user, ...profileData }
        setUser(updatedUser)
        localStorage.setItem('traceHerbUser', JSON.stringify(updatedUser))
      }

      setLoading(false)
      return { success: true }
    } catch (error) {
      setLoading(false)
      return { success: false, error: 'Profile update failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('traceHerbUser')
  }

  const getRoleByPortal = (portalType) => {
    const roleMap = {
      'processor': 'Processor',
      'laboratory': 'Lab Technician',
      'regulatory': 'Regulator',
      'stakeholder': 'Stakeholder',
      'management': 'Manager',
      'farmer': 'Farmer'
    }
    return roleMap[portalType] || 'User'
  }

  return {
    user,
    loading,
    login,
    signup,
    updateProfile,
    logout,
    isAuthenticated: !!user
  }
}

export default useAuth;
