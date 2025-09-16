import React, { useState } from 'react';

const CarbonCreditsMarketplace = ({ onPurchaseComplete, userProfile }) => {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCredits, setSelectedCredits] = useState(0);

  const purchaseCredits = async (amount) => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        success: true,
        transactionId: `TXN_${Date.now()}`,
        amount: amount,
        cost: amount * 25, // $25 per credit
        offsetTons: amount * 1.2,
        project: 'Sustainable Herb Farming Initiative'
      };

      setResult(mockResult);
      
      if (onPurchaseComplete) {
        onPurchaseComplete(mockResult);
      }
    } catch (error) {
      console.error('Carbon credit purchase error:', error);
      setResult({
        success: false,
        error: 'Purchase failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const creditProjects = [
    {
      id: 'herb-farming',
      name: 'Sustainable Herb Farming',
      description: 'Support organic farming practices that reduce carbon emissions',
      price: 25,
      impact: '1.2 tons CO₂ per credit',
      location: 'Karnataka, India',
      verified: true
    },
    {
      id: 'reforestation',
      name: 'Medicinal Plant Reforestation',
      description: 'Plant native medicinal trees and herbs in degraded lands',
      price: 30,
      impact: '1.5 tons CO₂ per credit',
      location: 'Kerala, India',
      verified: true
    },
    {
      id: 'soil-health',
      name: 'Soil Health Improvement',
      description: 'Enhance soil carbon sequestration through regenerative practices',
      price: 20,
      impact: '1.0 tons CO₂ per credit',
      location: 'Tamil Nadu, India',
      verified: true
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2 text-green-600">🌍</span>
            Carbon Credits Marketplace
            <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
              Consumer
            </span>
          </h2>
          <p className="text-gray-600 mt-1">
            Purchase verified carbon credits to offset your environmental impact
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
          { id: 'portfolio', label: 'My Credits', icon: '📊' },
          { id: 'impact', label: 'Impact', icon: '🌱' }
        ].map((tab) => {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'marketplace' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Available Carbon Credit Projects</h3>
            <div className="space-y-4">
              {creditProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🌿</span>
                      <div>
                        <h4 className="font-medium text-gray-800 flex items-center">
                          {project.name}
                          {project.verified && <span className="ml-2 text-green-600">✅</span>}
                        </h4>
                        <p className="text-sm text-gray-600">{project.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${project.price}</div>
                      <div className="text-xs text-gray-500">per credit</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">{project.impact}</span>
                    <div className="flex items-center space-x-2">
                      <select 
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        onChange={(e) => setSelectedCredits(parseInt(e.target.value))}
                      >
                        <option value={0}>Select quantity</option>
                        {[1, 2, 5, 10, 20].map(num => (
                          <option key={num} value={num}>{num} credit{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => purchaseCredits(selectedCredits)}
                        disabled={isProcessing || selectedCredits === 0}
                        className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Purchase'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">My Carbon Credits Portfolio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">25</div>
                <div className="text-sm text-green-700">Total Credits Owned</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">30.5t</div>
                <div className="text-sm text-blue-700">CO₂ Offset</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">$625</div>
                <div className="text-sm text-purple-700">Total Investment</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Sustainable Herb Farming</h4>
                    <p className="text-sm text-gray-600">10 credits • 12.0t CO₂ offset</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Environmental Impact</h3>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">30.5 tons</div>
                <div className="text-gray-700">Total CO₂ Offset This Year</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">15</div>
                  <div className="text-sm text-gray-600">Trees Equivalent</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">8</div>
                  <div className="text-sm text-gray-600">Farmers Supported</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3 mt-1">
                {result.success ? '✅' : '❌'}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {result.success ? 'Purchase Successful!' : 'Purchase Failed'}
                </h4>
                {result.success ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Transaction ID:</strong> {result.transactionId}</p>
                    <p><strong>Credits Purchased:</strong> {result.amount}</p>
                    <p><strong>Total Cost:</strong> ${result.cost}</p>
                    <p><strong>CO₂ Offset:</strong> {result.offsetTons} tons</p>
                    <p><strong>Project:</strong> {result.project}</p>
                  </div>
                ) : (
                  <p className="text-red-600 text-sm">{result.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarbonCreditsMarketplace;
