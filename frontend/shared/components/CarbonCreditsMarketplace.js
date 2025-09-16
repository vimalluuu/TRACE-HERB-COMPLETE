import React, { useState } from 'react';
import { 
  CloudIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TrophyIcon,
  ChartBarIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const CarbonCreditsMarketplace = ({ onPurchaseComplete, userProfile }) => {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCredits, setSelectedCredits] = useState([]);

  const purchaseCredits = async (creditData) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/purchase-carbon-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credits: creditData,
          userProfile,
          paymentMethod: 'blockchain',
          totalAmount: calculateTotal(creditData)
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (onPurchaseComplete) {
        onPurchaseComplete(data);
      }
    } catch (error) {
      console.error('Carbon credits purchase error:', error);
      setResult({
        success: false,
        error: 'Purchase failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = (credits) => {
    return credits.reduce((total, credit) => total + (credit.price * credit.quantity), 0);
  };

  const availableCredits = [
    {
      id: 'CC_ASH_001',
      project: 'Ashwagandha Sustainable Farming',
      location: 'Karnataka, India',
      type: 'Verified Carbon Standard (VCS)',
      price: 12.50,
      available: 500,
      impact: 'Organic farming practices, soil carbon sequestration',
      verification: 'Third-party verified',
      rating: 4.8,
      image: '🌿'
    },
    {
      id: 'CC_TUR_002',
      project: 'Turmeric Agroforestry Initiative',
      location: 'Tamil Nadu, India',
      type: 'Gold Standard',
      price: 15.75,
      available: 300,
      impact: 'Agroforestry, biodiversity conservation',
      verification: 'Gold Standard certified',
      rating: 4.9,
      image: '🌳'
    },
    {
      id: 'CC_NEE_003',
      project: 'Neem Tree Plantation Project',
      location: 'Rajasthan, India',
      type: 'Climate Action Reserve',
      price: 10.25,
      available: 750,
      impact: 'Reforestation, desert reclamation',
      verification: 'CAR verified',
      rating: 4.6,
      image: '🌲'
    }
  ];

  const userImpact = {
    totalCredits: 125,
    totalOffset: 12.5, // tonnes CO2
    monthlyOffset: 2.1,
    ranking: 'Top 5%',
    badges: ['Eco Warrior', 'Carbon Neutral', 'Green Champion']
  };

  const addToCart = (credit) => {
    const existing = selectedCredits.find(c => c.id === credit.id);
    if (existing) {
      setSelectedCredits(selectedCredits.map(c => 
        c.id === credit.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setSelectedCredits([...selectedCredits, { ...credit, quantity: 1 }]);
    }
  };

  const removeFromCart = (creditId) => {
    setSelectedCredits(selectedCredits.filter(c => c.id !== creditId));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <CloudIcon className="h-6 w-6 mr-2 text-green-600" />
            Carbon Credits Marketplace
            <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Consumer</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Purchase verified carbon credits to offset your environmental impact
          </p>
        </div>
        {selectedCredits.length > 0 && (
          <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg">
            Cart: {selectedCredits.length} items
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'marketplace', label: 'Marketplace', icon: ShoppingCartIcon },
          { id: 'impact', label: 'My Impact', icon: ChartBarIcon },
          { id: 'rewards', label: 'Rewards', icon: TrophyIcon }
        ].map((tab) => {
          const Icon = tab.icon;
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
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'marketplace' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Available Carbon Credits</h3>
            
            {/* Credits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableCredits.map((credit) => (
                <div key={credit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{credit.image}</span>
                      <div>
                        <h4 className="font-medium text-gray-800">{credit.project}</h4>
                        <p className="text-sm text-gray-600">{credit.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${credit.price}</div>
                      <div className="text-xs text-gray-500">per credit</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{credit.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{credit.available} credits</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">{credit.rating}</span>
                        <div className="flex text-yellow-400">
                          {'★'.repeat(Math.floor(credit.rating))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{credit.impact}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      {credit.verification}
                    </span>
                    <button
                      onClick={() => addToCart(credit)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Shopping Cart */}
            {selectedCredits.length > 0 && (
              <div className="mt-8 bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-4">Shopping Cart</h4>
                <div className="space-y-3">
                  {selectedCredits.map((credit) => (
                    <div key={credit.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{credit.image}</span>
                        <div>
                          <span className="font-medium text-gray-800">{credit.project}</span>
                          <div className="text-sm text-gray-600">
                            {credit.quantity} × ${credit.price} = ${(credit.quantity * credit.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(credit.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-800">Total:</span>
                    <span className="font-bold text-green-600 text-lg">
                      ${calculateTotal(selectedCredits).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => purchaseCredits(selectedCredits)}
                    disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    {isProcessing ? 'Processing Purchase...' : 'Purchase Credits'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'impact' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Your Environmental Impact</h3>
            
            {/* Impact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <CloudIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-800">{userImpact.totalCredits}</div>
                <div className="text-sm text-green-600">Total Credits</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-800">{userImpact.totalOffset}t</div>
                <div className="text-sm text-blue-600">CO₂ Offset</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-800">{userImpact.monthlyOffset}t</div>
                <div className="text-sm text-purple-600">This Month</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <TrophyIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-800">{userImpact.ranking}</div>
                <div className="text-sm text-yellow-600">Global Rank</div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Achievement Badges</h4>
              <div className="flex flex-wrap gap-2">
                {userImpact.badges.map((badge, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Rewards & Benefits</h3>
            
            {/* Rewards Program */}
            <div className="space-y-4">
              {[
                {
                  title: 'Carbon Neutral Badge',
                  description: 'Offset 10 tonnes of CO₂ to earn this badge',
                  progress: 85,
                  reward: 'Digital Certificate',
                  icon: HeartIcon
                },
                {
                  title: 'Eco Champion Status',
                  description: 'Purchase 100 carbon credits to unlock premium features',
                  progress: 65,
                  reward: 'Premium Dashboard',
                  icon: TrophyIcon
                },
                {
                  title: 'Green Investor',
                  description: 'Invest in 5 different carbon credit projects',
                  progress: 40,
                  reward: 'Investment Portfolio',
                  icon: GiftIcon
                }
              ].map((reward, index) => {
                const Icon = reward.icon;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Icon className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-800">{reward.title}</h4>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">{reward.reward}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${reward.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{reward.progress}% complete</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <CloudIcon className="h-6 w-6 mr-3 mt-1 text-green-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Purchase Complete</h4>
                {result.success ? (
                  <div className="space-y-2">
                    <p><strong>Transaction ID:</strong> {result.transactionId}</p>
                    <p><strong>Credits Purchased:</strong> {result.totalCredits}</p>
                    <p><strong>CO₂ Offset:</strong> {result.co2Offset} tonnes</p>
                    <p><strong>Total Amount:</strong> ${result.totalAmount}</p>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-800 text-sm">
                        🎉 Congratulations! You've offset {result.co2Offset} tonnes of CO₂ and contributed to sustainable farming practices.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600">{result.error}</p>
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
