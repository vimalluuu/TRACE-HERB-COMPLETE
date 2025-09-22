import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrophyIcon,
  ChartBarIcon,
  SparklesIcon,
  LeafIcon,
  FireIcon,
  WaterDropIcon,
  SunIcon,
  TreePineIcon,
  RecycleIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  GiftIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const SustainabilityLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [timeframe, setTimeframe] = useState('current');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'overall', name: 'Overall Score', icon: TrophyIcon, color: 'yellow' },
    { id: 'sustainability', name: 'Sustainability', icon: LeafIcon, color: 'green' },
    { id: 'quality', name: 'Quality', icon: StarIcon, color: 'blue' },
    { id: 'compliance', name: 'Compliance', icon: ChartBarIcon, color: 'purple' },
    { id: 'innovation', name: 'Innovation', icon: SparklesIcon, color: 'pink' },
    { id: 'community', name: 'Community', icon: UserGroupIcon, color: 'indigo' }
  ];

  useEffect(() => {
    fetchLeaderboardData();
    fetchDashboardStats();
  }, [selectedCategory, timeframe]);

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/sustainability/leaderboard?category=${selectedCategory}&limit=20`);
      const result = await response.json();
      
      if (result.success) {
        setLeaderboardData(result.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sustainability/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setDashboardStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-gray-600 bg-gray-100';
      case 3: return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Platinum': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Silver': return 'text-gray-500 bg-gray-50';
      case 'Bronze': return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
              <TrophyIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">🏆 Sustainability Leaderboard</h3>
              <p className="text-green-100">Top performing farmers in sustainable practices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Statistics */}
      {dashboardStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{dashboardStats.totalFarmers}</div>
                <div className="text-sm text-gray-600">Total Farmers</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LeafIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{dashboardStats.organicPercentage}%</div>
                <div className="text-sm text-gray-600">Organic Certified</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{dashboardStats.totalGreenTokens.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Green Tokens</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">{dashboardStats.avgSustainabilityScore}</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category and Timeframe Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-100 border-${category.color}-300 text-${category.color}-700`
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Timeframe Filter */}
          <div className="flex space-x-2">
            {[
              { id: 'current', name: 'Current' },
              { id: 'monthly', name: 'This Month' },
              { id: 'yearly', name: 'This Year' }
            ].map(period => (
              <button
                key={period.id}
                onClick={() => setTimeframe(period.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  timeframe === period.id
                    ? 'bg-blue-100 border border-blue-300 text-blue-700'
                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-bold text-gray-900">
            🏅 Top Performers - {categories.find(c => c.id === selectedCategory)?.name}
          </h4>
        </div>

        <div className="divide-y divide-gray-100">
          {leaderboardData.map((farmer, index) => (
            <motion.div
              key={farmer.farmerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${getRankColor(index + 1)}`}>
                  {getRankIcon(index + 1)}
                </div>

                {/* Farmer Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h5 className="font-semibold text-gray-900">{farmer.name}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(farmer.level.level)}`}>
                      {farmer.level.level}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>ID: {farmer.farmerId}</span>
                    <span className="flex items-center space-x-1">
                      <TrophyIcon className="w-4 h-4" />
                      <span>{farmer.badges} badges</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <SparklesIcon className="w-4 h-4" />
                      <span>{farmer.tokens.toLocaleString()} tokens</span>
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(farmer.score)}`}>
                    {farmer.score}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedCategory === 'overall' ? 'Overall' : categories.find(c => c.id === selectedCategory)?.name}
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center">
                  {Math.random() > 0.5 ? (
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 ml-16">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      farmer.score >= 90 ? 'bg-green-500' :
                      farmer.score >= 75 ? 'bg-yellow-500' :
                      farmer.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${farmer.score}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Performers Highlights */}
      {dashboardStats && dashboardStats.topPerformers && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">⭐ Hall of Fame</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardStats.topPerformers.slice(0, 3).map((performer, index) => (
              <motion.div
                key={performer.farmerId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-xl p-4 ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300' :
                  index === 1 ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300' :
                  'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300'
                }`}
              >
                {/* Crown for #1 */}
                {index === 0 && (
                  <div className="absolute top-2 right-2 text-2xl">👑</div>
                )}
                
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  
                  <h5 className="font-bold text-gray-900 mb-1">
                    Farmer {performer.farmerId.split('-')[1]}
                  </h5>
                  
                  <div className={`text-2xl font-bold mb-2 ${getScoreColor(performer.score)}`}>
                    {performer.score}/100
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(performer.level)}`}>
                      {performer.level}
                    </span>
                    <span>{performer.badges} badges</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sustainability Metrics Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">🌍 Sustainability Impact</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl mb-2">🌱</div>
            <div className="text-lg font-bold text-green-600">{dashboardStats?.organicFarmers || 0}</div>
            <div className="text-sm text-green-700">Organic Farms</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl mb-2">💧</div>
            <div className="text-lg font-bold text-blue-600">2.5M</div>
            <div className="text-sm text-blue-700">Liters Saved</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl mb-2">🌳</div>
            <div className="text-lg font-bold text-purple-600">{dashboardStats?.totalCarbonCredits || 0}</div>
            <div className="text-sm text-purple-700">Carbon Credits</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <div className="text-2xl mb-2">♻️</div>
            <div className="text-lg font-bold text-yellow-600">85%</div>
            <div className="text-sm text-yellow-700">Waste Reduced</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityLeaderboard;
