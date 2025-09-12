/**
 * Unified Login Form Component
 * Can be used across all portal applications
 */

import React, { useState } from 'react';
import { useAuth } from '../lib/useAuth';

const LoginForm = ({ 
  portal = 'dashboard', 
  onSuccess, 
  onError,
  showPortalSelector = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    selectedPortal: portal
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const portalOptions = [
    { value: 'dashboard', label: 'Dashboard', description: 'Main management portal' },
    { value: 'farmer', label: 'Farmer Portal', description: 'For herb farmers and growers' },
    { value: 'consumer', label: 'Consumer Portal', description: 'For product verification' },
    { value: 'processor', label: 'Processor Portal', description: 'For herb processors' },
    { value: 'lab', label: 'Lab Portal', description: 'For quality testing labs' },
    { value: 'regulator', label: 'Regulator Portal', description: 'For regulatory oversight' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authData = await login(
        formData.username, 
        formData.password, 
        formData.selectedPortal
      );

      if (onSuccess) {
        onSuccess(authData);
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">TRACE HERB</h2>
          <p className="text-gray-600 mt-2">
            {showPortalSelector ? 'Login to Access Portal' : `Login to ${portal.charAt(0).toUpperCase() + portal.slice(1)} Portal`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your username or email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your password"
            />
          </div>

          {showPortalSelector && (
            <div>
              <label htmlFor="selectedPortal" className="block text-sm font-medium text-gray-700">
                Select Portal
              </label>
              <select
                id="selectedPortal"
                name="selectedPortal"
                value={formData.selectedPortal}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                {portalOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Demo Accounts:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <strong>Admin:</strong> admin / password
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Farmer:</strong> farmer1 / password
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Processor:</strong> processor1 / password
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Consumer:</strong> consumer1 / password
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
