import React, { useState } from 'react';
import {
  CurrencyDollarIcon,
  TrophyIcon,
  StarIcon,
  ChartBarIcon,
  GiftIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CloudIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const SustainabilityWidget = ({ onSustainabilityComplete, batchData, farmerId }) => {
  const [activeTab, setActiveTab] = useState('tokens'); // 'tokens', 'reputation', 'carbon'
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // Early return for testing
  if (!onSustainabilityComplete) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <SparklesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Sustainability Widget Loading...</p>
        </div>
      </div>
    );
  }

  // Mock farmer performance data
  const mockPerformanceData = {
    qualityHistory: ['A+', 'A', 'A+', 'A', 'B+'],
    sustainabilityPractices: ['waterConservation', 'soilHealth', 'organicFarming'],
    complianceHistory: [
      { compliant: true, date: '2024-01-15' },
      { compliant: true, date: '2024-02-15' },
      { compliant: true, date: '2024-03-15' }
    ],
    deliveryHistory: [
      { onTime: true, date: '2024-01-20' },
      { onTime: true, date: '2024-02-20' },
      { onTime: false, date: '2024-03-20' }
    ],
    certifications: [
      { type: 'organic', active: true },
      { type: 'fair_trade', active: true }
    ],
    communityEngagement: {
      trainingParticipation: true,
      knowledgeSharing: true,
      cooperativeMembership: true,
      mentorship: false
    },
    technologyAdoption: {
      blockchainUsage: true,
      iotDevices: false,
      mobileApps: true,
      precisionAgriculture: false
    }
  };

  // Mock sustainable practices data
  const mockPracticeData = {
    practices: [
      { type: 'organicFarming', area: 2.5, duration: 1 }, // 2.5 hectares for 1 year
      { type: 'waterConservation', area: 2.5, duration: 1 },
      { type: 'composting', area: 2.5, duration: 1 }
    ]
  };

  // Award Green Tokens
  const awardGreenTokens = async (actionType) => {
    setIsProcessing(true);
    setResult(null);

    try {
      let actionData;
      
      switch (actionType) {
        case 'harvest':
          actionData = {
            type: 'harvest',
            qualityGrade: 'A+',
            quantity: parseFloat(batchData?.quantity) || 5
          };
          break;
        case 'certification':
          actionData = {
            type: 'certification',
            certificationType: 'organic'
          };
          break;
        case 'sustainability':
          actionData = {
            type: 'sustainability',
            practices: ['waterConservation', 'soilHealth', 'organicFarming']
          };
          break;
        case 'compliance':
          actionData = {
            type: 'compliance'
          };
          break;
        case 'community':
          actionData = {
            type: 'community',
            activity: 'Training workshop participation'
          };
          break;
        default:
          throw new Error('Invalid action type');
      }

      const response = await fetch('http://localhost:3000/api/ai/award-green-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmerId: farmerId || 'F001',
          actionData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onSustainabilityComplete) {
          onSustainabilityComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'Token award failed');
      }

    } catch (error) {
      console.error('Green Token Award Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate Reputation Score
  const calculateReputation = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/calculate-reputation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmerId: farmerId || 'F001',
          performanceData: mockPerformanceData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onSustainabilityComplete) {
          onSustainabilityComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'Reputation calculation failed');
      }

    } catch (error) {
      console.error('Reputation Calculation Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate Carbon Credits
  const calculateCarbonCredits = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/calculate-carbon-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmerId: farmerId || 'F001',
          practiceData: mockPracticeData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (onSustainabilityComplete) {
          onSustainabilityComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'Carbon credit calculation failed');
      }

    } catch (error) {
      console.error('Carbon Credit Calculation Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getResultIcon = () => {
    if (result?.success) return SparklesIcon;
    if (result?.error) return ShieldCheckIcon;
    return GiftIcon;
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
            <SparklesIcon className="h-6 w-6 mr-2 text-green-600" />
            Sustainability & Incentives
          </h2>
          <p className="text-gray-600 mt-1">
            Green Token rewards, reputation scoring, and carbon credits marketplace
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'tokens', label: 'Green Tokens', icon: CurrencyDollarIcon },
          { id: 'reputation', label: 'Reputation', icon: TrophyIcon },
          { id: 'carbon', label: 'Carbon Credits', icon: CloudIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
              }}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
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
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">💰 Green Herb Token (GHT) Economy</h3>
              <p className="text-green-700 text-sm mb-3">
                Earn GHT tokens for sustainable practices, quality harvests, and community engagement. 
                Tokens can be redeemed for rewards or traded in the marketplace.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>Current Balance: <strong>1,250 GHT</strong></span>
                </div>
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>This Month: <strong>+180 GHT</strong></span>
                </div>
              </div>
            </div>

            {/* Token Earning Actions */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">🎯 Earn Tokens</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    action: 'harvest',
                    title: 'Quality Harvest',
                    description: 'Earn tokens based on quality grade',
                    tokens: '40-50 GHT',
                    icon: SparklesIcon,
                    color: 'bg-green-100 text-green-700'
                  },
                  { 
                    action: 'certification', 
                    title: 'Organic Certification', 
                    description: 'One-time bonus for certification',
                    tokens: '100 GHT',
                    icon: ShieldCheckIcon,
                    color: 'bg-blue-100 text-blue-700'
                  },
                  { 
                    action: 'sustainability', 
                    title: 'Sustainable Practices', 
                    description: 'Water conservation, soil health, etc.',
                    tokens: '25-35 GHT',
                    icon: HeartIcon,
                    color: 'bg-purple-100 text-purple-700'
                  },
                  { 
                    action: 'compliance', 
                    title: 'Traceability Compliance', 
                    description: 'Complete blockchain records',
                    tokens: '15 GHT',
                    icon: ChartBarIcon,
                    color: 'bg-yellow-100 text-yellow-700'
                  },
                  { 
                    action: 'community', 
                    title: 'Community Engagement', 
                    description: 'Training, mentorship, sharing',
                    tokens: '20 GHT',
                    icon: StarIcon,
                    color: 'bg-orange-100 text-orange-700'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.action} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${item.color} mr-3`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800">{item.title}</h5>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-600">{item.tokens}</span>
                      </div>
                      <button
                        onClick={() => awardGreenTokens(item.action)}
                        disabled={isProcessing}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {isProcessing ? 'Processing...' : 'Claim Tokens'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reputation' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">🏆 Farmer Reputation System</h3>
              <p className="text-yellow-700 text-sm mb-3">
                Build your reputation through consistent quality, sustainable practices, and community engagement. 
                Higher reputation unlocks better opportunities and premium pricing.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrophyIcon className="h-6 w-6 text-yellow-600 mr-2" />
                  <span className="font-medium">Current Badge: <strong>Gold Farmer 🥇</strong></span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">87/100</span>
              </div>
            </div>

            {/* Reputation Factors */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">📊 Reputation Factors</h4>
              <div className="space-y-3">
                {[
                  { factor: 'Quality Consistency', weight: '25%', score: 92, color: 'bg-green-500' },
                  { factor: 'Sustainability Practices', weight: '20%', score: 85, color: 'bg-green-500' },
                  { factor: 'Traceability Compliance', weight: '15%', score: 95, color: 'bg-green-500' },
                  { factor: 'Timely Delivery', weight: '15%', score: 78, color: 'bg-yellow-500' },
                  { factor: 'Certification Maintenance', weight: '10%', score: 90, color: 'bg-green-500' },
                  { factor: 'Community Impact', weight: '10%', score: 82, color: 'bg-green-500' },
                  { factor: 'Innovation Adoption', weight: '5%', score: 70, color: 'bg-yellow-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{item.factor}</span>
                        <span className="text-sm text-gray-600">Weight: {item.weight}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-4 text-sm font-bold text-gray-700">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={calculateReputation}
              disabled={isProcessing}
              className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <TrophyIcon className="h-5 w-5 mr-2" />
              {isProcessing ? 'Calculating...' : 'Recalculate Reputation Score'}
            </button>
          </div>
        )}

        {activeTab === 'carbon' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🌍 Carbon Credits Marketplace</h3>
              <p className="text-blue-700 text-sm mb-3">
                Earn verified carbon credits for sustainable farming practices. 
                Trade credits in the global marketplace for additional income.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <CloudIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Credits Earned: <strong>12.5 tons CO2</strong></span>
                </div>
                <div className="flex items-center">
                  <BanknotesIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Market Value: <strong>$187.50</strong></span>
                </div>
              </div>
            </div>

            {/* Sustainable Practices */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">🌱 Your Sustainable Practices</h4>
              <div className="space-y-3">
                {[
                  { practice: 'Organic Farming', area: '2.5 hectares', credits: '6.25 tons CO2', rate: '2.5 tons/ha/year' },
                  { practice: 'Water Conservation', area: '2.5 hectares', credits: '2.0 tons CO2', rate: '0.8 tons/ha/year' },
                  { practice: 'Composting', area: '2.5 hectares', credits: '3.0 tons CO2', rate: '1.2 tons/ha/year' }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800">{item.practice}</h5>
                      <span className="text-sm font-bold text-green-600">{item.credits}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>Area: {item.area}</div>
                      <div>Rate: {item.rate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carbon Credit Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">📋 Certification Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Standard:</span>
                  <span className="ml-2">Verified Carbon Standard (VCS)</span>
                </div>
                <div>
                  <span className="text-gray-600">Validity:</span>
                  <span className="ml-2">2024-2031</span>
                </div>
                <div>
                  <span className="text-gray-600">Current Price:</span>
                  <span className="ml-2 text-green-600 font-medium">$15.00 per credit</span>
                </div>
                <div>
                  <span className="text-gray-600">Market Trend:</span>
                  <span className="ml-2 text-green-600">↗ +12% this month</span>
                </div>
              </div>
            </div>

            <button
              onClick={calculateCarbonCredits}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <CloudIcon className="h-5 w-5 mr-2" />
              {isProcessing ? 'Calculating...' : 'Calculate Carbon Credits'}
            </button>
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
                {result.success ? 'Success!' : 'Operation Failed'}
              </h4>
              
              {result.success ? (
                <div className="space-y-2 text-sm text-gray-600">
                  {activeTab === 'tokens' && result.tokensEarned && (
                    <>
                      <p><strong>Tokens Earned:</strong> {result.tokensEarned} GHT</p>
                      <p><strong>New Balance:</strong> {result.newBalance} GHT</p>
                      {result.rewardBreakdown && (
                        <div className="mt-2">
                          <p className="font-medium">Reward Breakdown:</p>
                          {result.rewardBreakdown.map((reward, index) => (
                            <div key={index} className="ml-4 text-xs">
                              • {reward.category}: {reward.tokens} GHT ({reward.details})
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === 'reputation' && result.reputationScore && (
                    <>
                      <p><strong>Reputation Score:</strong> {result.reputationScore}/100</p>
                      <p><strong>Badge:</strong> {result.badge?.name} {result.badge?.icon}</p>
                      {result.recommendations && result.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Recommendations:</p>
                          {result.recommendations.map((rec, index) => (
                            <div key={index} className="ml-4 text-xs">• {rec}</div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === 'carbon' && result.creditsEarned && (
                    <>
                      <p><strong>Credits Earned:</strong> {result.creditsEarned} tons CO2</p>
                      <p><strong>Market Value:</strong> ${result.marketValue}</p>
                      <p><strong>Total Credits:</strong> {result.totalCredits} tons CO2</p>
                    </>
                  )}
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

export default SustainabilityWidget;
