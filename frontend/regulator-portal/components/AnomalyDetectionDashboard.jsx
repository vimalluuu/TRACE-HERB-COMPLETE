import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  BeakerIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const AnomalyDetectionDashboard = () => {
  const [anomalyStats, setAnomalyStats] = useState(null);
  const [recentAnomalies, setRecentAnomalies] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch anomaly statistics
  useEffect(() => {
    fetchAnomalyStats();
    fetchRecentAnomalies();
  }, []);

  const fetchAnomalyStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/anomaly-stats');
      const result = await response.json();
      
      if (result.success) {
        setAnomalyStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching anomaly stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentAnomalies = async () => {
    // Mock recent anomalies - in production, fetch from actual API
    const mockAnomalies = [
      {
        id: 'ANO-001',
        type: 'VOLUME_SPIKE',
        severity: 'HIGH',
        farmerId: 'FARM-123',
        farmerName: 'Rajesh Kumar',
        description: 'Harvest volume 300% above normal',
        location: 'Karnataka, India',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        riskScore: 85,
        status: 'UNDER_REVIEW'
      },
      {
        id: 'ANO-002',
        type: 'LOCATION_ANOMALY',
        severity: 'MEDIUM',
        farmerId: 'FARM-456',
        farmerName: 'Priya Sharma',
        description: 'Harvest location 75km from registered farm',
        location: 'Tamil Nadu, India',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        riskScore: 65,
        status: 'FLAGGED'
      },
      {
        id: 'ANO-003',
        type: 'QUALITY_DROP',
        severity: 'LOW',
        farmerId: 'FARM-789',
        farmerName: 'Amit Patel',
        description: 'Quality grade dropped from A to C',
        location: 'Gujarat, India',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        riskScore: 35,
        status: 'RESOLVED'
      }
    ];
    
    setRecentAnomalies(mockAnomalies);
  };

  const simulateThreat = async (threatType) => {
    setIsSimulating(true);
    setSelectedThreat(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/simulate-threat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ threatType, severity: 'medium' })
      });

      const result = await response.json();
      
      if (result.success) {
        setSelectedThreat(result.data);
      }
    } catch (error) {
      console.error('Error simulating threat:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'UNDER_REVIEW': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'FLAGGED': return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'RESOLVED': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
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
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-red-100 rounded-xl">
            <ShieldExclamationIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Anomaly Detection</h3>
            <p className="text-sm text-gray-600">Real-time monitoring and threat detection</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {anomalyStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{anomalyStats.totalScans}</div>
              <div className="text-sm text-blue-700">Total Scans</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{anomalyStats.anomaliesDetected}</div>
              <div className="text-sm text-red-700">Anomalies Detected</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{anomalyStats.highRiskBlocked}</div>
              <div className="text-sm text-yellow-700">High Risk Blocked</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{anomalyStats.accuracyRate}%</div>
              <div className="text-sm text-green-700">Accuracy Rate</div>
            </div>
          </div>
        )}

        {/* Threat Simulation */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">🎯 Threat Simulation (Demo)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'fake-qr', label: 'Fake QR Code', icon: '🔍' },
              { type: 'double-spending', label: 'Double Spending', icon: '💰' },
              { type: 'location-spoofing', label: 'GPS Spoofing', icon: '📍' },
              { type: 'volume-manipulation', label: 'Volume Fraud', icon: '📊' }
            ].map(threat => (
              <button
                key={threat.type}
                onClick={() => simulateThreat(threat.type)}
                disabled={isSimulating}
                className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <span className="text-lg">{threat.icon}</span>
                <span className="text-sm font-medium text-gray-700">{threat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Threat Simulation Result */}
      {selectedThreat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-red-200 p-6"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-red-900 mb-2">
                🚨 Threat Detected: {selectedThreat.threat.name}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800 mb-1">Description:</p>
                  <p className="text-red-700">{selectedThreat.threat.description}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-orange-800 mb-1">Detection Method:</p>
                  <p className="text-orange-700">{selectedThreat.threat.detection}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-green-800 mb-1">System Response:</p>
                <p className="text-green-700">{selectedThreat.threat.action}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Detection Time:</span>
                  <span className="font-medium">{selectedThreat.systemResponse.detectionTime.toFixed(2)}s</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{Math.round(selectedThreat.systemResponse.confidence * 100)}%</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className={`font-bold ${selectedThreat.threat.riskLevel === 'HIGH' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {selectedThreat.threat.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Anomalies */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-900">Recent Anomalies</h4>
          <button
            onClick={fetchRecentAnomalies}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {recentAnomalies.map((anomaly, index) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                    <span className="text-sm text-gray-600">{anomaly.type.replace('_', ' ')}</span>
                    {getStatusIcon(anomaly.status)}
                  </div>
                  
                  <h5 className="font-semibold text-gray-900 mb-1">{anomaly.description}</h5>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{anomaly.farmerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{anomaly.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{new Date(anomaly.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChartBarIcon className="w-4 h-4" />
                      <span className={`font-medium ${getRiskColor(anomaly.riskScore)}`}>
                        Risk: {anomaly.riskScore}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Anomaly Types Breakdown */}
      {anomalyStats?.topAnomalyTypes && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Anomaly Types Breakdown</h4>
          
          <div className="space-y-3">
            {anomalyStats.topAnomalyTypes.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-red-500' :
                    index === 1 ? 'bg-yellow-500' :
                    index === 2 ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {type.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{type.count} cases</span>
                  <span className="text-sm font-medium text-gray-900">{type.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyDetectionDashboard;
