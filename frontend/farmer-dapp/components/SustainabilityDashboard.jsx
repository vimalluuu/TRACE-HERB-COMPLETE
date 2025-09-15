import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LeafIcon,
  SparklesIcon,
  TrophyIcon,
  GiftIcon,
  ChartBarIcon,
  FireIcon,
  WaterDropIcon,
  SunIcon,
  TreePineIcon,
  RecycleIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const SustainabilityDashboard = ({ farmerId = 'FARM-001' }) => {
  const [sustainabilityData, setSustainabilityData] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [reputationData, setReputationData] = useState(null);
  const [carbonCredits, setCarbonCredits] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchSustainabilityData();
  }, [farmerId]);

  const fetchSustainabilityData = async () => {
    try {
      // Fetch all sustainability data in parallel
      const [scoreRes, tokenRes, reputationRes, carbonRes, programsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/sustainability/score/${farmerId}`),
        fetch(`http://localhost:3000/api/sustainability/tokens/${farmerId}`),
        fetch(`http://localhost:3000/api/sustainability/reputation/${farmerId}`),
        fetch(`http://localhost:3000/api/sustainability/carbon-credits/${farmerId}`),
        fetch('http://localhost:3000/api/sustainability/programs')
      ]);

      const [score, tokens, reputation, carbon, programsList] = await Promise.all([
        scoreRes.json(),
        tokenRes.json(),
        reputationRes.json(),
        carbonRes.json(),
        programsRes.json()
      ]);

      if (score.success) setSustainabilityData(score.data);
      if (tokens.success) setTokenData(tokens.data);
      if (reputation.success) setReputationData(reputation.data);
      if (carbon.success) setCarbonCredits(carbon.data);
      if (programsList.success) setPrograms(programsList.data.programs);

    } catch (error) {
      console.error('Error fetching sustainability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateAction = async (actionType) => {
    setIsSimulating(true);
    setSelectedAction(actionType);

    try {
      const response = await fetch('http://localhost:3000/api/sustainability/simulate-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmerId,
          actionType
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh data to show updates
        await fetchSustainabilityData();
        
        // Show success notification
        alert(`🎉 Action completed! Earned ${result.data.tokenReward.reward} Green Tokens!`);
      }
    } catch (error) {
      console.error('Error simulating action:', error);
      alert('Failed to simulate action. Please try again.');
    } finally {
      setIsSimulating(false);
      setSelectedAction(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-green-400 to-green-600';
    if (score >= 75) return 'from-yellow-400 to-yellow-600';
    if (score >= 60) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl">
              <LeafIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">🌱 Sustainability Dashboard</h3>
              <p className="text-green-100">Track your environmental impact and earn rewards</p>
            </div>
          </div>
          
          {reputationData && (
            <div className="text-right">
              <div className="text-2xl font-bold">{reputationData.overall}/100</div>
              <div className="text-sm text-green-100">Overall Score</div>
              <div className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1 mt-1">
                {reputationData.level.level}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Green Tokens */}
        {tokenData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{tokenData.balance}</div>
                <div className="text-sm text-gray-600">Green Tokens</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              ≈ ${tokenData.usdValue.toFixed(2)} USD
            </div>
          </div>
        )}

        {/* Sustainability Score */}
        {sustainabilityData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className={`text-lg font-bold ${getScoreColor(sustainabilityData.overall)}`}>
                  {sustainabilityData.overall}/100
                </div>
                <div className="text-sm text-gray-600">Sustainability</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${getScoreGradient(sustainabilityData.overall)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${sustainabilityData.overall}%` }}
              />
            </div>
          </div>
        )}

        {/* Carbon Credits */}
        {carbonCredits && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TreePineIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{carbonCredits.availableCredits}</div>
                <div className="text-sm text-gray-600">Carbon Credits</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              ${carbonCredits.marketValue.toFixed(0)} market value
            </div>
          </div>
        )}

        {/* Reputation Rank */}
        {reputationData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrophyIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">#{reputationData.ranking.rank}</div>
                <div className="text-sm text-gray-600">Ranking</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Top {reputationData.ranking.percentile}%
            </div>
          </div>
        )}
      </div>

      {/* Sustainability Breakdown */}
      {sustainabilityData && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">🌍 Sustainability Breakdown</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(sustainabilityData.breakdown).map(([category, score]) => {
              const icons = {
                organicCertification: <LeafIcon className="w-5 h-5" />,
                waterConservation: <WaterDropIcon className="w-5 h-5" />,
                soilHealth: <SunIcon className="w-5 h-5" />,
                biodiversity: <TreePineIcon className="w-5 h-5" />,
                carbonSequestration: <FireIcon className="w-5 h-5" />,
                wasteReduction: <RecycleIcon className="w-5 h-5" />
              };

              return (
                <div key={category} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`p-1 rounded ${getScoreColor(score)} bg-opacity-10`}>
                      {icons[category]}
                    </div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                      {Math.round(score)}/100
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${getScoreGradient(score)} h-2 rounded-full`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Rewards */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-900">🎯 Earn Green Tokens</h4>
          <div className="text-sm text-gray-600">Click actions to simulate</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { action: 'organicHarvest', label: 'Organic Harvest', icon: '🌱', reward: 50, color: 'green' },
            { action: 'waterSaving', label: 'Water Saving', icon: '💧', reward: 25, color: 'blue' },
            { action: 'soilImprovement', label: 'Soil Health', icon: '🌍', reward: 30, color: 'yellow' },
            { action: 'carbonOffset', label: 'Carbon Offset', icon: '🌳', reward: 40, color: 'purple' },
            { action: 'biodiversityAction', label: 'Biodiversity', icon: '🦋', reward: 20, color: 'pink' },
            { action: 'wasteReduction', label: 'Waste Reduction', icon: '♻️', reward: 15, color: 'gray' },
            { action: 'qualityCompliance', label: 'Quality Check', icon: '⭐', reward: 35, color: 'indigo' },
            { action: 'timelyReporting', label: 'Timely Report', icon: '📊', reward: 10, color: 'teal' }
          ].map(item => (
            <motion.button
              key={item.action}
              onClick={() => simulateAction(item.action)}
              disabled={isSimulating}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 border-2 border-${item.color}-200 rounded-xl hover:border-${item.color}-400 hover:bg-${item.color}-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedAction === item.action ? 'animate-pulse' : ''
              }`}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-medium text-gray-900 mb-1">{item.label}</div>
              <div className={`text-xs text-${item.color}-600 font-semibold`}>
                +{item.reward} tokens
              </div>
              {selectedAction === item.action && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mx-auto"></div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Badges & Achievements */}
      {reputationData && reputationData.badges.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">🏆 Badges & Achievements</h4>
          
          <div className="flex flex-wrap gap-3">
            {reputationData.badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 rounded-full px-3 py-2"
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="text-sm font-medium text-yellow-800">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Incentive Programs */}
      {programs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">🎁 Available Programs</h4>
          
          <div className="space-y-3">
            {programs.slice(0, 3).map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">{program.name}</h5>
                    <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <GiftIcon className="w-4 h-4" />
                        <span>{program.tokenReward} tokens</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{program.duration}</span>
                      </span>
                      <span>{program.spotsRemaining} spots left</span>
                    </div>
                  </div>
                  
                  <button className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Join
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Token Transactions */}
      {tokenData && tokenData.recentTransactions && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">💰 Recent Token Earnings</h4>
          
          <div className="space-y-2">
            {tokenData.recentTransactions.slice(0, 5).map((tx, index) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {tx.action.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-600">
                  +{tx.amount} tokens
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityDashboard;
