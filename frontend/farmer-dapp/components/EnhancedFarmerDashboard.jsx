/**
 * Enhanced Farmer Dashboard with Batch Tracking
 * Shows farmer profile, batch management, and real-time tracking
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const EnhancedFarmerDashboard = () => {
  const { user, logout, apiCall } = useAuth();
  const [batches, setBatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [newBatch, setNewBatch] = useState({
    herbType: '',
    quantity: '',
    harvestDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Load farmer data
  useEffect(() => {
    loadFarmerData();
  }, []);

  const loadFarmerData = async () => {
    try {
      setLoading(true);
      
      // Load batches
      const batchesResponse = await apiCall(`http://localhost:3000/api/workflow/portal/farmer/batches?userId=${user.id}`);
      setBatches(batchesResponse.data.batches || []);

      // Load notifications
      const notificationsResponse = await apiCall(`http://localhost:3000/api/workflow/notifications/${user.id}/farmer`);
      setNotifications(notificationsResponse.data.notifications || []);
      
    } catch (error) {
      console.error('Error loading farmer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    
    try {
      const batchData = {
        farmerId: user.id,
        farmerName: user.name,
        herbType: newBatch.herbType,
        quantity: newBatch.quantity,
        harvestDate: newBatch.harvestDate,
        farmLocation: user.profile?.location || 'Unknown Location'
      };

      await apiCall('http://localhost:3000/api/workflow/batches/create', {
        method: 'POST',
        body: JSON.stringify(batchData)
      });

      // Reset form and reload data
      setNewBatch({
        herbType: '',
        quantity: '',
        harvestDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowCreateBatch(false);
      loadFarmerData();
      
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Failed to create batch: ' + error.message);
    }
  };

  const handleBatchAction = async (batchId, action) => {
    try {
      await apiCall(`http://localhost:3000/api/workflow/batches/${batchId}/actions/${action}`, {
        method: 'POST',
        body: JSON.stringify({
          actor: user.name,
          location: user.profile?.location || 'Farm Location'
        })
      });

      // Reload data
      loadFarmerData();
      
    } catch (error) {
      console.error('Error updating batch:', error);
      alert('Failed to update batch: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Farmer Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
                  </svg>
                </button>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-green-600">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.profile?.farmName || 'Farmer'}</p>
                <p className="text-sm text-gray-500">{user.profile?.location}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Batches</div>
              <div className="text-2xl font-bold text-green-600">{batches.length}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setShowCreateBatch(true)}
            className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Batch
          </button>
          
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="text-blue-600 text-sm font-medium">Active Batches</div>
            <div className="text-2xl font-bold text-blue-700">
              {batches.filter(b => !['APPROVED', 'REJECTED', 'READY_FOR_MARKET'].includes(b.currentState)).length}
            </div>
          </div>
          
          <div className="bg-emerald-50 p-6 rounded-xl">
            <div className="text-emerald-600 text-sm font-medium">Completed Batches</div>
            <div className="text-2xl font-bold text-emerald-700">
              {batches.filter(b => ['APPROVED', 'READY_FOR_MARKET'].includes(b.currentState)).length}
            </div>
          </div>
        </div>

        {/* Batches List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Batches</h3>
          </div>
          
          {batches.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h4>
              <p className="text-gray-500 mb-4">Create your first batch to start tracking your herbs</p>
              <button
                onClick={() => setShowCreateBatch(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create First Batch
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {batches.map((batch) => (
                <div key={batch.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900 mr-3">
                          {batch.id}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          batch.currentState === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          batch.currentState === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          batch.currentState === 'TESTING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {batch.currentState.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">{batch.herbType}</span> • {batch.quantity} • 
                        <span className="ml-1">{batch.currentLocation}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Harvest Date: {new Date(batch.harvestDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {batch.currentState === 'CREATED' && (
                        <button
                          onClick={() => handleBatchAction(batch.id, 'harvest')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Mark as Harvested
                        </button>
                      )}
                      
                      <a
                        href={`http://localhost:3001/track/${batch.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Track
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Batch Modal */}
      {showCreateBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Batch</h3>
            
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Herb Type
                </label>
                <select
                  value={newBatch.herbType}
                  onChange={(e) => setNewBatch({...newBatch, herbType: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select herb type</option>
                  <option value="Turmeric">Turmeric</option>
                  <option value="Cardamom">Cardamom</option>
                  <option value="Black Pepper">Black Pepper</option>
                  <option value="Ginger">Ginger</option>
                  <option value="Cinnamon">Cinnamon</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="text"
                  value={newBatch.quantity}
                  onChange={(e) => setNewBatch({...newBatch, quantity: e.target.value})}
                  required
                  placeholder="e.g., 500 kg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harvest Date
                </label>
                <input
                  type="date"
                  value={newBatch.harvestDate}
                  onChange={(e) => setNewBatch({...newBatch, harvestDate: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateBatch(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFarmerDashboard;
