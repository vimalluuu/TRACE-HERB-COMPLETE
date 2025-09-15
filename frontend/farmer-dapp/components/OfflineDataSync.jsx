import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  WifiIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const OfflineDataSync = ({ farmerId }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState(null);
  const [smsQueue, setSmsQueue] = useState([]);
  const [showSMSInterface, setShowSMSInterface] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      if (offlineData.length > 0) {
        syncOfflineData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data from localStorage
    loadOfflineData();
    loadSMSQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline data from localStorage
  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('trace-herb-offline-data');
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineData(data);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  // Load SMS queue from localStorage
  const loadSMSQueue = () => {
    try {
      const stored = localStorage.getItem('trace-herb-sms-queue');
      if (stored) {
        const data = JSON.parse(stored);
        setSmsQueue(data);
      }
    } catch (error) {
      console.error('Error loading SMS queue:', error);
    }
  };

  // Save data offline
  const saveOfflineData = (data) => {
    const offlineEntry = {
      id: `offline-${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
      status: 'pending_sync',
      source: 'offline'
    };

    const updatedData = [...offlineData, offlineEntry];
    setOfflineData(updatedData);
    
    // Save to localStorage
    localStorage.setItem('trace-herb-offline-data', JSON.stringify(updatedData));
    
    return offlineEntry;
  };

  // Add SMS to queue
  const addToSMSQueue = (smsData) => {
    const smsEntry = {
      id: `sms-${Date.now()}`,
      ...smsData,
      timestamp: new Date().toISOString(),
      status: 'queued'
    };

    const updatedQueue = [...smsQueue, smsEntry];
    setSmsQueue(updatedQueue);
    
    // Save to localStorage
    localStorage.setItem('trace-herb-sms-queue', JSON.stringify(updatedQueue));
    
    return smsEntry;
  };

  // Sync offline data to server
  const syncOfflineData = async () => {
    if (!isOnline || offlineData.length === 0) return;

    setSyncStatus('syncing');
    setSyncProgress(0);

    try {
      const totalItems = offlineData.length;
      let syncedItems = 0;

      for (const item of offlineData) {
        if (item.status === 'synced') {
          syncedItems++;
          continue;
        }

        try {
          // Simulate API call to sync data
          const response = await fetch('http://localhost:3000/api/collection/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...item,
              farmerId,
              syncedFromOffline: true
            })
          });

          if (response.ok) {
            item.status = 'synced';
            item.syncedAt = new Date().toISOString();
            syncedItems++;
          } else {
            item.status = 'sync_failed';
            item.error = 'Server error';
          }
        } catch (error) {
          item.status = 'sync_failed';
          item.error = error.message;
        }

        setSyncProgress((syncedItems / totalItems) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update localStorage
      localStorage.setItem('trace-herb-offline-data', JSON.stringify(offlineData));
      setOfflineData([...offlineData]);
      
      setLastSync(new Date().toISOString());
      setSyncStatus('completed');
      
      // Clear completed items after 5 seconds
      setTimeout(() => {
        const remainingData = offlineData.filter(item => item.status !== 'synced');
        setOfflineData(remainingData);
        localStorage.setItem('trace-herb-offline-data', JSON.stringify(remainingData));
      }, 5000);

    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  };

  // Send SMS command
  const sendSMSCommand = async (command) => {
    try {
      const response = await fetch('http://localhost:3000/api/sms/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+919876543210', // Mock farmer phone
          message: command
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Add to SMS queue for tracking
        addToSMSQueue({
          command,
          response: result.data.message,
          status: 'sent'
        });
        
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      // If offline, queue the SMS
      addToSMSQueue({
        command,
        status: 'queued',
        error: error.message
      });
      throw error;
    }
  };

  // Generate SMS command for harvest
  const generateHarvestSMS = (harvestData) => {
    const { species, quantity, location, notes } = harvestData;
    return `HARVEST ${species} ${quantity}KG LAT ${location.lat} LNG ${location.lng} ${notes || ''}`.trim();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'synced': return 'text-green-600 bg-green-100';
      case 'pending_sync': return 'text-yellow-600 bg-yellow-100';
      case 'sync_failed': return 'text-red-600 bg-red-100';
      case 'syncing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'synced': return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending_sync': return <ClockIcon className="w-4 h-4" />;
      case 'sync_failed': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'syncing': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
              {isOnline ? (
                <WifiIcon className="w-6 h-6 text-green-600" />
              ) : (
                <SignalIcon className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {isOnline ? '🌐 Online' : '📱 Offline Mode'}
              </h3>
              <p className="text-sm text-gray-600">
                {isOnline ? 'Connected to internet' : 'Working offline - data will sync when connected'}
              </p>
            </div>
          </div>
          
          {isOnline && offlineData.length > 0 && (
            <button
              onClick={syncOfflineData}
              disabled={syncStatus === 'syncing'}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Sync Now</span>
            </button>
          )}
        </div>

        {/* Sync Progress */}
        {syncStatus === 'syncing' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Syncing offline data...</span>
              <span>{Math.round(syncProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Last Sync */}
        {lastSync && (
          <div className="text-sm text-gray-600">
            Last sync: {new Date(lastSync).toLocaleString()}
          </div>
        )}
      </div>

      {/* Offline Data Queue */}
      {offlineData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900">
              📦 Offline Data Queue ({offlineData.length})
            </h4>
            <button
              onClick={loadOfflineData}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {offlineData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status.replace('_', ' ').toUpperCase()}</span>
                      </span>
                      <span className="text-sm text-gray-600">{item.source}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Species:</span>
                        <span className="ml-2 font-medium">{item.species || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <span className="ml-2 font-medium">{item.quantity || 'N/A'} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {item.syncedAt && (
                        <div>
                          <span className="text-gray-600">Synced:</span>
                          <span className="ml-2 font-medium">
                            {new Date(item.syncedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {item.error && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-2">
                        Error: {item.error}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SMS Interface */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <PhoneIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">📱 SMS Backup</h4>
              <p className="text-sm text-gray-600">Send harvest data via SMS when offline</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSMSInterface(!showSMSInterface)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            {showSMSInterface ? 'Hide' : 'Show'} SMS
          </button>
        </div>

        <AnimatePresence>
          {showSMSInterface && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* SMS Commands */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h5 className="font-semibold text-purple-900 mb-2">Available SMS Commands:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <code className="bg-white px-2 py-1 rounded text-purple-800">
                      HARVEST [Species] [Qty]KG LAT [Lat] LNG [Lng]
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-white px-2 py-1 rounded text-purple-800">
                      STATUS [EntryID]
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-white px-2 py-1 rounded text-purple-800">
                      HELP
                    </code>
                  </div>
                </div>
              </div>

              {/* SMS Queue */}
              {smsQueue.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">SMS Queue ({smsQueue.length}):</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {smsQueue.slice(-5).map((sms, index) => (
                      <div key={sms.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{sms.command}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            sms.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sms.status}
                          </span>
                        </div>
                        {sms.response && (
                          <div className="text-gray-600 text-xs">
                            Response: {sms.response}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs">
                          {new Date(sms.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h5 className="font-semibold text-blue-900 mb-2">📞 SMS Instructions:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Send SMS to: <strong>+91-TRACE-HERB</strong></li>
                  <li>• Use commands above to record harvest data</li>
                  <li>• Data will sync to blockchain when network is available</li>
                  <li>• You'll receive confirmation SMS with entry ID</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">🚀 Quick Actions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const mockHarvest = {
                species: 'Ashwagandha',
                quantity: 15,
                location: { lat: 12.9716, lng: 77.5946 },
                notes: 'Good quality'
              };
              saveOfflineData(mockHarvest);
            }}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <DocumentTextIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Save Test Data</span>
          </button>
          
          <button
            onClick={() => {
              const command = 'HARVEST Ashwagandha 15KG LAT 12.9716 LNG 77.5946 Good quality';
              sendSMSCommand(command).catch(console.error);
            }}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <PhoneIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Test SMS</span>
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem('trace-herb-offline-data');
              localStorage.removeItem('trace-herb-sms-queue');
              setOfflineData([]);
              setSmsQueue([]);
            }}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Clear All</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineDataSync;
