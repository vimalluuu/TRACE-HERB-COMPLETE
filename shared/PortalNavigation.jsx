/**
 * Portal Navigation Component
 * Allows users to switch between different portals they have access to
 */

import React, { useState } from 'react';
import { useAuth } from './useAuth';

const PortalNavigation = ({ currentPortal, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, getAvailablePortals, switchPortal, logout } = useAuth();

  const portalInfo = {
    'dashboard': {
      name: 'Dashboard',
      icon: '📊',
      description: 'Main management portal',
      color: 'bg-blue-500'
    },
    'farmer': {
      name: 'Farmer Portal',
      icon: '🌱',
      description: 'Herb registration & management',
      color: 'bg-green-500'
    },
    'consumer': {
      name: 'Consumer Portal',
      icon: '🔍',
      description: 'Product verification',
      color: 'bg-purple-500'
    },
    'processor': {
      name: 'Processor Portal',
      icon: '⚙️',
      description: 'Processing & quality control',
      color: 'bg-orange-500'
    },
    'lab': {
      name: 'Lab Portal',
      icon: '🧪',
      description: 'Testing & certification',
      color: 'bg-cyan-500'
    },
    'regulator': {
      name: 'Regulator Portal',
      icon: '🏛️',
      description: 'Compliance & oversight',
      color: 'bg-red-500'
    }
  };

  const availablePortals = getAvailablePortals();
  const currentPortalInfo = portalInfo[currentPortal] || portalInfo['dashboard'];

  const handlePortalSwitch = (portal) => {
    if (portal !== currentPortal) {
      switchPortal(portal);
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Current Portal Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <div className={`w-8 h-8 ${currentPortalInfo.color} rounded-full flex items-center justify-center text-white text-sm`}>
          {currentPortalInfo.icon}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {currentPortalInfo.name}
          </div>
          <div className="text-xs text-gray-500">
            {user?.name}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
              Available Portals
            </div>
            
            {availablePortals.map(portal => {
              const info = portalInfo[portal];
              const isCurrent = portal === currentPortal;
              
              return (
                <button
                  key={portal}
                  onClick={() => handlePortalSwitch(portal)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left hover:bg-gray-50 ${
                    isCurrent ? 'bg-green-50 border-l-4 border-green-500' : ''
                  }`}
                >
                  <div className={`w-8 h-8 ${info.color} rounded-full flex items-center justify-center text-white text-sm`}>
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${isCurrent ? 'text-green-700' : 'text-gray-900'}`}>
                      {info.name}
                      {isCurrent && <span className="ml-2 text-xs">(Current)</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {info.description}
                    </div>
                  </div>
                  {!isCurrent && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default PortalNavigation;
