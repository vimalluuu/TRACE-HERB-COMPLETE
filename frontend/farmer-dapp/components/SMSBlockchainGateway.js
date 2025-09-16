import React, { useState, useEffect } from 'react';
import { 
  SignalIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CpuChipIcon,
  WifiIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

const SMSBlockchainGateway = ({ onGatewayComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('devices'); // 'devices', 'simulate', 'stats'
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentData, setRecentData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Simulation form data
  const [simulationData, setSimulationData] = useState({
    deviceId: 'IOT_WG_001',
    species: 'ASHWAGANDHA',
    quantity: '5.0',
    quality: 'A'
  });

  useEffect(() => {
    loadDevices();
    loadStats();
    loadRecentData();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/sms/devices');
      const data = await response.json();
      if (data.success) {
        setDevices(data.data.devices);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/sms/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadRecentData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/sms/recent-data?limit=5');
      const data = await response.json();
      if (data.success) {
        setRecentData(data.data.recentTransmissions);
      }
    } catch (error) {
      console.error('Failed to load recent data:', error);
    }
  };

  const simulateCollection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/sms/simulate-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simulationData)
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Reload data to show updated stats
        await loadStats();
        await loadRecentData();
        
        if (onGatewayComplete) {
          onGatewayComplete(data);
        }
      }

    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to simulate collection event',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSignalIcon = (strength) => {
    switch (strength) {
      case 'HIGH': return <SignalIcon className="h-5 w-5 text-green-600" />;
      case 'MEDIUM': return <SignalIcon className="h-5 w-5 text-yellow-600" />;
      case 'LOW': return <SignalIcon className="h-5 w-5 text-red-600" />;
      default: return <NoSymbolIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getBatteryColor = (level) => {
    if (level > 80) return 'text-green-600';
    if (level > 50) return 'text-yellow-600';
    if (level > 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <DevicePhoneMobileIcon className="h-6 w-6 mr-2 text-blue-600" />
            SMS-over-Blockchain Gateway
          </h2>
          <p className="text-gray-600 mt-1">
            IoT devices transmitting collection data via SMS when internet is sparse
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'devices', label: 'IoT Devices', icon: CpuChipIcon },
          { id: 'simulate', label: 'Simulate Collection', icon: DevicePhoneMobileIcon },
          { id: 'stats', label: 'Gateway Stats', icon: ChartBarIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <CpuChipIcon className="h-5 w-5 mr-2" />
            Remote IoT Collection Devices
          </h3>
          
          {devices.map((device) => (
            <div key={device.deviceId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-800">{device.deviceId}</h4>
                  <p className="text-sm text-gray-600">{device.location.region}</p>
                  <p className="text-sm text-gray-500">
                    Collector: {device.collectorName} ({device.collectorId})
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getSignalIcon(device.signalStrength)}
                  <span className={`text-sm font-medium ${getBatteryColor(device.batteryLevel)}`}>
                    {device.batteryLevel}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Location:</span>
                  <div className="font-medium">
                    {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Elevation:</span>
                  <div className="font-medium">{device.location.elevation}m</div>
                </div>
                <div>
                  <span className="text-gray-500">Species:</span>
                  <div className="font-medium">{device.species.join(', ')}</div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className={`font-medium ${device.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                    {device.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'simulate' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
            Simulate Collection Event via SMS
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">SMS Data Format</p>
                <p>IoT devices send structured data via SMS: <code>CE|DeviceID|Lat|Lng|Species|Quantity|Quality|Timestamp|CollectorID</code></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device ID
              </label>
              <select
                value={simulationData.deviceId}
                onChange={(e) => setSimulationData({...simulationData, deviceId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {devices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.deviceId} - {device.location.region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Species
              </label>
              <select
                value={simulationData.species}
                onChange={(e) => setSimulationData({...simulationData, species: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ASHWAGANDHA">Ashwagandha</option>
                <option value="TURMERIC">Turmeric</option>
                <option value="BRAHMI">Brahmi</option>
                <option value="SHANKHPUSHPI">Shankhpushpi</option>
                <option value="SAFED_MUSLI">Safed Musli</option>
                <option value="SHATAVARI">Shatavari</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={simulationData.quantity}
                onChange={(e) => setSimulationData({...simulationData, quantity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Grade
              </label>
              <select
                value={simulationData.quality}
                onChange={(e) => setSimulationData({...simulationData, quality: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Grade A - Premium</option>
                <option value="B">Grade B - Standard</option>
                <option value="C">Grade C - Basic</option>
              </select>
            </div>
          </div>

          <button
            onClick={simulateCollection}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Transmitting via SMS...
              </>
            ) : (
              <>
                <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                Simulate SMS Collection Event
              </>
            )}
          </button>

          {result && (
            <div className={`border rounded-lg p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? 'SMS Transmission Successful' : 'SMS Transmission Failed'}
                  </h4>
                  {result.success && result.data && (
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>SMS Message:</strong> {result.data.simulatedSMS}</p>
                      <p><strong>Blockchain TX:</strong> {result.data.result.blockchainTxId}</p>
                      <p><strong>Data Type:</strong> {result.data.result.dataType}</p>
                    </div>
                  )}
                  {result.error && (
                    <p className="mt-1 text-sm text-red-700">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            SMS Gateway Statistics
          </h3>
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CpuChipIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-blue-800">{stats.totalDevices}</div>
                    <div className="text-sm text-blue-600">Total Devices</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <WifiIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-green-800">{stats.activeDevices}</div>
                    <div className="text-sm text-green-600">Active Devices</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-800">{stats.bufferedMessages}</div>
                    <div className="text-sm text-yellow-600">Buffered Messages</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-purple-800">{stats.transmittedMessages}</div>
                    <div className="text-sm text-purple-600">Transmitted</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Recent SMS Transmissions</h4>
            <div className="space-y-2">
              {recentData.map((transmission, index) => (
                <div key={transmission.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-800">{transmission.deviceId}</span>
                      <span className="ml-2 text-sm text-gray-600">({transmission.dataType})</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transmission.receivedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  {transmission.data && transmission.data.species && (
                    <div className="mt-1 text-sm text-gray-600">
                      {transmission.data.species} - {transmission.data.quantity}kg - Grade {transmission.data.qualityGrade}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMSBlockchainGateway;
