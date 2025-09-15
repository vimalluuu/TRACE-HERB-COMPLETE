import React, { useState } from 'react';
import { 
  DevicePhoneMobileIcon,
  WifiIcon,
  DocumentTextIcon,
  QrCodeIcon,
  SignalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowUpIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const RuralConnectivityWidget = ({ onConnectivityComplete, batchData }) => {
  const [activeTab, setActiveTab] = useState('sms'); // 'sms', 'offline', 'paper'
  const [smsData, setSmsData] = useState({
    phoneNumber: '',
    message: '',
    language: 'hi'
  });
  const [offlineData, setOfflineData] = useState({
    deviceId: '',
    entries: []
  });
  const [paperQRResult, setPaperQRResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // SMS Commands help
  const smsCommands = [
    { command: 'REG <FarmerID> <Name>', description: 'Register as farmer', example: 'REG F001 Rajesh Kumar' },
    { command: 'HRV <HerbCode> <Qty> [Unit]', description: 'Report harvest', example: 'HRV ASH 5 KG' },
    { command: 'STS <BatchID>', description: 'Check batch status', example: 'STS B12345' },
    { command: 'QLT <BatchID> <Score>', description: 'Report quality score', example: 'QLT B12345 85' },
    { command: 'LOC <BatchID> <Lat> <Lng>', description: 'Update location', example: 'LOC B12345 15.123 75.456' },
    { command: 'HELP', description: 'Show help', example: 'HELP' }
  ];

  // Supported languages
  const languages = [
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
  ];

  // Process SMS to blockchain
  const processSMS = async () => {
    if (!smsData.phoneNumber || !smsData.message) {
      alert('Please enter phone number and message');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/sms-to-blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(smsData)
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onConnectivityComplete) {
          onConnectivityComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'SMS processing failed');
      }

    } catch (error) {
      console.error('SMS Processing Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync offline data
  const syncOfflineData = async () => {
    if (!offlineData.deviceId) {
      alert('Please enter device ID');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Mock offline data entries
      const mockEntries = [
        {
          id: 'OFF_001',
          type: 'harvest',
          herbCode: 'ASH',
          quantity: 3.5,
          unit: 'kg',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 'OFF_002',
          type: 'quality',
          batchId: 'B12345',
          qualityScore: 88,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        }
      ];

      const syncData = {
        deviceData: {
          deviceId: offlineData.deviceId,
          entries: mockEntries
        },
        deviceId: offlineData.deviceId
      };

      const response = await fetch('http://localhost:3000/api/ai/sync-offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(syncData)
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onConnectivityComplete) {
          onConnectivityComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'Offline sync failed');
      }

    } catch (error) {
      console.error('Offline Sync Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate paper QR
  const generatePaperQR = async () => {
    if (!batchData) {
      alert('Batch data is required to generate paper QR');
      return;
    }

    setIsProcessing(true);
    setPaperQRResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-paper-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchData,
          farmerId: batchData.farmerId || 'F001'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPaperQRResult(data.data);
        setResult(data.data);
        if (onConnectivityComplete) {
          onConnectivityComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'Paper QR generation failed');
      }

    } catch (error) {
      console.error('Paper QR Generation Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getResultIcon = () => {
    if (result?.success) return CheckCircleIcon;
    if (result?.error) return ExclamationTriangleIcon;
    return InformationCircleIcon;
  };

  const getResultColor = () => {
    if (result?.success) return 'text-green-600';
    if (result?.error) return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <SignalIcon className="h-6 w-6 mr-2 text-blue-600" />
            Rural Connectivity
          </h2>
          <p className="text-gray-600 mt-1">
            SMS gateway, offline sync, and paper QR solutions for rural areas
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'sms', label: 'SMS Gateway', icon: ChatBubbleLeftRightIcon },
          { id: 'offline', label: 'Offline Sync', icon: CloudArrowUpIcon },
          { id: 'paper', label: 'Paper QR', icon: PrinterIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
                setPaperQRResult(null);
              }}
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
      <div className="min-h-[400px]">
        {activeTab === 'sms' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📱 SMS-to-Blockchain Gateway</h3>
              <p className="text-blue-700 text-sm">
                Send SMS commands to report harvest, check status, and update blockchain records. 
                Works with any mobile phone - no internet required!
              </p>
            </div>

            {/* SMS Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={smsData.phoneNumber}
                    onChange={(e) => setSmsData({...smsData, phoneNumber: e.target.value})}
                    className="flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="9876543210"
                    maxLength="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={smsData.language}
                  onChange={(e) => setSmsData({...smsData, language: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMS Message
                </label>
                <textarea
                  value={smsData.message}
                  onChange={(e) => setSmsData({...smsData, message: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  placeholder="HRV ASH 5 KG Fresh harvest from organic farm"
                />
              </div>

              <button
                onClick={processSMS}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                {isProcessing ? 'Processing SMS...' : 'Process SMS Command'}
              </button>
            </div>

            {/* SMS Commands Help */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">📋 Available SMS Commands</h4>
              <div className="space-y-2">
                {smsCommands.map((cmd, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <code className="text-sm font-mono text-blue-600">{cmd.command}</code>
                        <p className="text-sm text-gray-600 mt-1">{cmd.description}</p>
                      </div>
                      <button
                        onClick={() => setSmsData({...smsData, message: cmd.example})}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Use Example
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Example: <code>{cmd.example}</code></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offline' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">🌐 Offline Data Synchronization</h3>
              <p className="text-green-700 text-sm">
                Sync data from LoRaWAN devices and offline collection systems. 
                Perfect for remote areas with limited connectivity.
              </p>
            </div>

            {/* Offline Sync Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device ID
                </label>
                <input
                  type="text"
                  value={offlineData.deviceId}
                  onChange={(e) => setOfflineData({...offlineData, deviceId: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-green-500 focus:ring-green-500"
                  placeholder="LORA_DEV_001"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">📊 Mock Offline Data Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Harvest Entry:</span>
                    <span className="text-green-600">Ashwagandha 3.5kg (2h ago)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality Report:</span>
                    <span className="text-blue-600">Batch B12345 - Score 88 (1h ago)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={syncOfflineData}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                {isProcessing ? 'Syncing Data...' : 'Sync Offline Data'}
              </button>
            </div>

            {/* LoRaWAN Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">📡 LoRaWAN Configuration</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Network:</span>
                  <span className="ml-2 font-mono">ttn.in</span>
                </div>
                <div>
                  <span className="text-gray-600">Frequency:</span>
                  <span className="ml-2 font-mono">865-867 MHz</span>
                </div>
                <div>
                  <span className="text-gray-600">Range:</span>
                  <span className="ml-2">Up to 15km</span>
                </div>
                <div>
                  <span className="text-gray-600">Battery:</span>
                  <span className="ml-2 text-green-600">10+ years</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'paper' && (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">📄 Paper QR with OTP Activation</h3>
              <p className="text-orange-700 text-sm">
                Generate printable QR codes that can be activated later via SMS, call, or web. 
                Perfect for farmers without smartphones.
              </p>
            </div>

            {/* Paper QR Generation */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">📋 Batch Information</h4>
                {batchData ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Farmer:</span>
                      <span className="ml-2">{batchData.farmerName || 'Rajesh Kumar'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Herb:</span>
                      <span className="ml-2">{batchData.commonName || 'Ashwagandha'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <span className="ml-2">{batchData.quantity || '5'} {batchData.unit || 'kg'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2">{new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Complete batch information to generate paper QR</p>
                )}
              </div>

              <button
                onClick={generatePaperQR}
                disabled={isProcessing || !batchData}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <PrinterIcon className="h-5 w-5 mr-2" />
                {isProcessing ? 'Generating QR...' : 'Generate Paper QR Slip'}
              </button>
            </div>

            {/* Paper QR Result */}
            {paperQRResult && (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4 text-center">🖨️ Paper QR Slip</h4>
                
                <div className="text-center mb-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <QrCodeIcon className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">QR Code: {paperQRResult.qrContent}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">QR ID:</span>
                    <span className="font-mono">{paperQRResult.qrId?.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OTP:</span>
                    <span className="font-mono text-lg font-bold text-red-600">{paperQRResult.otp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span>{new Date(paperQRResult.expiresAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h5 className="font-medium text-yellow-800 mb-2">📱 Activation Instructions</h5>
                  <div className="space-y-1 text-xs text-yellow-700">
                    <p><strong>SMS:</strong> {paperQRResult.activationInstructions?.sms}</p>
                    <p><strong>Call:</strong> {paperQRResult.activationInstructions?.call}</p>
                    <p><strong>Web:</strong> {paperQRResult.activationInstructions?.web}</p>
                  </div>
                </div>

                <button className="w-full mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print QR Slip
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start">
            {React.createElement(getResultIcon(), {
              className: `h-6 w-6 mr-3 mt-1 ${getResultColor()}`
            })}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-2">
                {result.success ? 'Operation Successful!' : 'Operation Failed'}
              </h4>
              
              {result.success ? (
                <div className="space-y-2 text-sm text-gray-600">
                  {activeTab === 'sms' && result.command && (
                    <p><strong>Command:</strong> {result.command.toUpperCase()}</p>
                  )}
                  {activeTab === 'offline' && result.totalEntries && (
                    <p><strong>Synced Entries:</strong> {result.totalEntries}</p>
                  )}
                  {activeTab === 'paper' && result.qrId && (
                    <p><strong>QR Generated:</strong> {result.qrId.substring(0, 8)}</p>
                  )}
                  <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString('en-IN')}</p>
                </div>
              ) : (
                <p className="text-sm text-red-600">{result.error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuralConnectivityWidget;
