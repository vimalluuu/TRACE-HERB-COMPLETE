import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const SMSDashboard = () => {
  const [smsStats, setSmsStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [syncQueue, setSyncQueue] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchSMSData();
    const interval = setInterval(fetchSMSData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSMSData = async () => {
    try {
      // Fetch SMS statistics
      const statsResponse = await fetch('http://localhost:3000/api/sms/statistics');
      const statsResult = await statsResponse.json();
      
      if (statsResult.success) {
        setSmsStats(statsResult.data);
      }

      // Fetch sync queue
      const queueResponse = await fetch('http://localhost:3000/api/sms/sync-queue');
      const queueResult = await queueResponse.json();
      
      if (queueResult.success) {
        setSyncQueue(queueResult.data.pendingEntries);
      }

      // Fetch farmers
      const farmersResponse = await fetch('http://localhost:3000/api/sms/farmers');
      const farmersResult = await farmersResponse.json();
      
      if (farmersResult.success) {
        setFarmers(farmersResult.data.farmers);
      }

      // Mock recent messages
      setRecentMessages([
        {
          id: 'MSG-001',
          phoneNumber: '+919876543210',
          farmerName: 'Rajesh Kumar',
          message: 'HARVEST Ashwagandha 15KG LAT 12.9716 LNG 77.5946 Good quality',
          response: '✅ Harvest recorded! Entry ID: ENT-A1B2C3D4, OTP: F5G6H7',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'processed',
          type: 'harvest'
        },
        {
          id: 'MSG-002',
          phoneNumber: '+919876543211',
          farmerName: 'Priya Sharma',
          message: 'STATUS ENT-A1B2C3D4',
          response: '📊 Status for ENT-A1B2C3D4: ✅ SYNCED, Species: ashwagandha, Quantity: 15kg',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'processed',
          type: 'status'
        },
        {
          id: 'MSG-003',
          phoneNumber: '+919876543212',
          farmerName: 'Amit Patel',
          message: 'HELP',
          response: '📱 TRACE HERB SMS Commands: 🌾 HARVEST [Species] [Qty]KG LAT [Lat] LNG [Lng]...',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'processed',
          type: 'help'
        }
      ]);

    } catch (error) {
      console.error('Error fetching SMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceBulkSync = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sms/bulk-sync', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Initiated sync for ${result.entriesCount} entries`);
        fetchSMSData(); // Refresh data
      }
    } catch (error) {
      console.error('Error initiating bulk sync:', error);
      alert('Failed to initiate bulk sync');
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'harvest': return 'text-green-600 bg-green-100';
      case 'status': return 'text-blue-600 bg-blue-100';
      case 'help': return 'text-purple-600 bg-purple-100';
      case 'otp': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'pending': return <ClockIcon className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      default: return <DocumentTextIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <PhoneIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">📱 SMS Gateway Dashboard</h3>
              <p className="text-sm text-gray-600">Monitor rural connectivity and SMS-to-blockchain activities</p>
            </div>
          </div>
          
          <button
            onClick={fetchSMSData}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Statistics Cards */}
        {smsStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{smsStats.totalFarmers}</div>
              <div className="text-sm text-blue-700">Registered Farmers</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{smsStats.totalEntries}</div>
              <div className="text-sm text-green-700">SMS Entries</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{smsStats.pendingEntries}</div>
              <div className="text-sm text-yellow-700">Pending Sync</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{smsStats.syncRate}%</div>
              <div className="text-sm text-purple-700">Sync Success Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'messages', label: 'Recent Messages', icon: ChatBubbleLeftRightIcon },
              { id: 'sync', label: 'Sync Queue', icon: ArrowPathIcon },
              { id: 'farmers', label: 'Farmers', icon: UserGroupIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Sync Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Synced Entries
                  </h4>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {smsStats?.syncedEntries || 0}
                  </div>
                  <p className="text-sm text-green-700">Successfully synced to blockchain</p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    Pending Sync
                  </h4>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {smsStats?.pendingEntries || 0}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-yellow-700">Waiting for network</p>
                    {syncQueue.length > 0 && (
                      <button
                        onClick={forceBulkSync}
                        className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                      >
                        Force Sync
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active OTPs */}
              <div className="bg-indigo-50 rounded-xl p-4">
                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Active Paper QR Slips
                </h4>
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {smsStats?.activeOTPs || 0}
                </div>
                <p className="text-sm text-indigo-700">Paper slips awaiting activation</p>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {selectedTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">Recent SMS Messages</h4>
                <span className="text-sm text-gray-600">{recentMessages.length} messages</span>
              </div>

              <div className="space-y-3">
                {recentMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeColor(msg.type)}`}>
                          {msg.type.toUpperCase()}
                        </span>
                        {getStatusIcon(msg.status)}
                        <span className="font-medium text-gray-900">{msg.farmerName}</span>
                        <span className="text-sm text-gray-600">{msg.phoneNumber}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 mb-1">Incoming SMS:</p>
                        <code className="text-sm font-mono text-gray-800">{msg.message}</code>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-600 mb-1">System Response:</p>
                        <p className="text-sm text-blue-800">{msg.response}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Sync Queue Tab */}
          {selectedTab === 'sync' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">Blockchain Sync Queue</h4>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{syncQueue.length} pending</span>
                  {syncQueue.length > 0 && (
                    <button
                      onClick={forceBulkSync}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Sync All
                    </button>
                  )}
                </div>
              </div>

              {syncQueue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <SignalIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No entries pending sync</p>
                  <p className="text-sm">All SMS entries are synced to blockchain</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {syncQueue.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{entry.id}</span>
                          <span className="text-sm text-gray-600">{entry.farmerName}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Species:</span>
                          <span className="ml-2 font-medium">{entry.species}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <span className="ml-2 font-medium">{entry.quantity} kg</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 font-medium">
                            {entry.location?.lat?.toFixed(4)}, {entry.location?.lng?.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className="ml-2 font-medium text-yellow-600">{entry.status}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Farmers Tab */}
          {selectedTab === 'farmers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">Registered SMS Farmers</h4>
                <span className="text-sm text-gray-600">{farmers.length} farmers</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farmers.map((farmer, index) => (
                  <motion.div
                    key={farmer.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <UserGroupIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{farmer.name}</h5>
                          <p className="text-sm text-gray-600">{farmer.id}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        farmer.verified ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                      }`}>
                        {farmer.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{farmer.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{farmer.location}</span>
                      </div>
                      {farmer.registeredAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registered:</span>
                          <span className="font-medium">
                            {new Date(farmer.registeredAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SMSDashboard;
