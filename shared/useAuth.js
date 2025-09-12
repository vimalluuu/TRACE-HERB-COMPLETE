/**
 * React Hook for Unified Authentication
 * Can be used across all portal applications
 */

import { useState, useEffect, useContext, createContext } from 'react';

// Import the auth manager (adjust path as needed)
const authManager = require('./auth');

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const initAuth = async () => {
      try {
        if (authManager.isAuthenticated()) {
          const userData = authManager.getUser();
          setUser(userData);
          setIsAuthenticated(true);
          
          // Try to refresh user profile
          try {
            const freshProfile = await authManager.getUserProfile();
            setUser(freshProfile);
          } catch (error) {
            console.warn('Could not refresh user profile:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        authManager.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password, portal) => {
    try {
      setLoading(true);
      const authData = await authManager.login(username, password, portal);
      setUser(authData.user);
      setIsAuthenticated(true);
      return authData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authManager.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authManager.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const hasPermission = (permission) => {
    return authManager.hasPermission(permission);
  };

  const canAccessPortal = (portal) => {
    return authManager.canAccessPortal(portal);
  };

  const switchPortal = (portal) => {
    authManager.switchPortal(portal);
  };

  const getAvailablePortals = () => {
    return authManager.getAvailablePortals();
  };

  const apiRequest = async (endpoint, options) => {
    return authManager.apiRequest(endpoint, options);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    hasPermission,
    canAccessPortal,
    switchPortal,
    getAvailablePortals,
    apiRequest
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
export const withAuth = (WrappedComponent, requiredPermissions = []) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, hasPermission, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access this page.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    // Check permissions if required
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      );

      if (!hasRequiredPermissions) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You don't have the required permissions to access this page.
              </p>
              <p className="text-sm text-gray-500">
                Required permissions: {requiredPermissions.join(', ')}
              </p>
            </div>
          </div>
        );
      }
    }

    return <WrappedComponent {...props} />;
  };
};

// Portal access guard component
export const PortalGuard = ({ portal, children, fallback }) => {
  const { canAccessPortal, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!canAccessPortal(portal)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Portal Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have access to the {portal} portal.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

// Permission guard component
export const PermissionGuard = ({ permissions, children, fallback }) => {
  const { hasPermission } = useAuth();

  const hasRequiredPermissions = permissions.every(permission => 
    hasPermission(permission)
  );

  if (!hasRequiredPermissions) {
    return fallback || (
      <div className="text-center p-4">
        <p className="text-gray-600">
          You don't have permission to view this content.
        </p>
      </div>
    );
  }

  return children;
};

export default useAuth;
