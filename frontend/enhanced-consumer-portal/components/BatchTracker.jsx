/**
 * Amazon-Style Batch Tracker Component
 * Shows real-time batch tracking with timeline visualization
 */

import React, { useState, useEffect } from 'react';

const BatchTracker = ({ batchId, onClose }) => {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (batchId) {
      fetchBatchTimeline();
    }
  }, [batchId]);

  const fetchBatchTimeline = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:3000/api/workflow/track/${batchId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch batch timeline');
      }
      
      setTimeline(data.data.timeline);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStateIcon = (state) => {
    const icons = {
      'CREATED': '📝',
      'HARVESTED': '🌾',
      'IN_TRANSIT_TO_PROCESSOR': '🚛',
      'RECEIVED_BY_PROCESSOR': '🏭',
      'PROCESSING': '⚙️',
      'PROCESSED': '📦',
      'IN_TRANSIT_TO_LAB': '🚛',
      'RECEIVED_BY_LAB': '🔬',
      'TESTING': '🧪',
      'TESTED': '✅',
      'IN_TRANSIT_TO_REGULATOR': '🚛',
      'RECEIVED_BY_REGULATOR': '🏛️',
      'COMPLIANCE_REVIEW': '📋',
      'APPROVED': '✅',
      'REJECTED': '❌',
      'READY_FOR_MARKET': '🛒'
    };
    return icons[state] || '📍';
  };

  const getStateColor = (state, isCurrent = false) => {
    if (isCurrent) {
      return 'bg-blue-500 text-white';
    }
    
    const colors = {
      'APPROVED': 'bg-green-500 text-white',
      'READY_FOR_MARKET': 'bg-green-500 text-white',
      'REJECTED': 'bg-red-500 text-white',
      'TESTING': 'bg-yellow-500 text-white',
      'PROCESSING': 'bg-orange-500 text-white',
      'COMPLIANCE_REVIEW': 'bg-purple-500 text-white'
    };
    
    return colors[state] || 'bg-gray-500 text-white';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    if (!timeline) return 0;
    return timeline.progress || 0;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Batch Not Found</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Batch Tracking</h2>
              <p className="text-gray-600">Track your {timeline?.herbType} batch in real-time</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Batch Info */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Batch ID</div>
              <div className="font-semibold text-gray-900">{timeline?.batchId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Product</div>
              <div className="font-semibold text-gray-900">{timeline?.herbType}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Quantity</div>
              <div className="font-semibold text-gray-900">{timeline?.quantity}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Location</div>
              <div className="font-semibold text-gray-900">{timeline?.currentLocation}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Current Status */}
        <div className="px-6 py-4 bg-blue-50">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{getStateIcon(timeline?.currentState)}</div>
            <div>
              <div className="font-semibold text-blue-900">
                {timeline?.currentState?.replace(/_/g, ' ')}
              </div>
              <div className="text-sm text-blue-700">
                Currently at: {timeline?.currentLocation}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h3>
          
          <div className="space-y-4">
            {timeline?.timeline?.map((event, index) => {
              const isLast = index === timeline.timeline.length - 1;
              const isCurrent = event.state === timeline.currentState;
              
              return (
                <div key={index} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg ${getStateColor(event.state, isCurrent)}`}>
                      {getStateIcon(event.state)}
                    </div>
                    
                    {/* Content */}
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                          {event.state.replace(/_/g, ' ')}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </div>
                        
                        <div className="flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {event.actor}
                        </div>
                        
                        {event.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            {event.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estimated Completion */}
        {timeline?.estimatedCompletion && (
          <div className="px-6 py-4 bg-green-50 border-t border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-medium text-green-900">Estimated Completion</div>
                <div className="text-sm text-green-700">
                  {new Date(timeline.estimatedCompletion).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Last updated: {timeline?.timeline?.[timeline.timeline.length - 1] ? 
                formatDate(timeline.timeline[timeline.timeline.length - 1].timestamp) : 'N/A'}
            </div>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTracker;
