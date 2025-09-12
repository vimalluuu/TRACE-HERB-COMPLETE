import React from 'react';

interface SustainabilityMetric {
  category: string;
  score: number;
  target: number;
  unit: string;
  description: string;
  trend: 'improving' | 'declining' | 'stable';
}

interface SustainabilityDashboardProps {
  metrics?: SustainabilityMetric[];
}

export const SustainabilityDashboard: React.FC<SustainabilityDashboardProps> = ({ metrics }) => {
  // Mock data for demonstration
  const mockMetrics: SustainabilityMetric[] = metrics || [
    {
      category: 'Carbon Footprint',
      score: 2.3,
      target: 2.0,
      unit: 'kg CO2/kg',
      description: 'Carbon emissions per kg of herb',
      trend: 'improving'
    },
    {
      category: 'Water Usage',
      score: 45,
      target: 40,
      unit: 'L/kg',
      description: 'Water consumption per kg of herb',
      trend: 'stable'
    },
    {
      category: 'Biodiversity Index',
      score: 8.7,
      target: 8.0,
      unit: 'score',
      description: 'Farm biodiversity assessment',
      trend: 'improving'
    },
    {
      category: 'Soil Health',
      score: 92,
      target: 85,
      unit: '%',
      description: 'Soil quality and fertility',
      trend: 'improving'
    },
    {
      category: 'Fair Trade Score',
      score: 94,
      target: 90,
      unit: '%',
      description: 'Fair trade compliance',
      trend: 'stable'
    },
    {
      category: 'Renewable Energy',
      score: 78,
      target: 80,
      unit: '%',
      description: 'Renewable energy usage',
      trend: 'improving'
    },
  ];

  const getScoreColor = (score: number, target: number) => {
    const percentage = (score / target) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number, target: number) => {
    const percentage = (score / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  };

  const overallScore = Math.round(
    mockMetrics.reduce((sum, metric) => sum + (metric.score / metric.target) * 100, 0) / mockMetrics.length
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Sustainability Dashboard</h3>
        <div className="text-sm text-gray-600">
          ESG Compliance Score
        </div>
      </div>

      {/* Overall sustainability score */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Overall Sustainability Score</p>
          <div className="relative">
            <div className="w-24 h-24 mx-auto">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-300"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${overallScore}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">{overallScore}%</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Above industry average</p>
        </div>
      </div>

      {/* Sustainability metrics */}
      <div className="space-y-4">
        {mockMetrics.map((metric, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {metric.category}
                </h4>
                <span className="text-sm">{getTrendIcon(metric.trend)}</span>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${getScoreColor(metric.score, metric.target)}`}>
                  {metric.score} {metric.unit}
                </span>
                <p className="text-xs text-gray-500">Target: {metric.target} {metric.unit}</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">{metric.description}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.score, metric.target)}`}
                style={{ width: `${Math.min((metric.score / metric.target) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Sustainability initiatives */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Active Initiatives</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">
              Solar panel installation at 15 farms
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">
              Water conservation training program
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">
              Organic certification for 8 new farms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
