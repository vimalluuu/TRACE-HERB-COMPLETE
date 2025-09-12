import React from 'react';

interface QualityData {
  parameter: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface QualityMetricsProps {
  metrics?: QualityData[];
}

export const QualityMetrics: React.FC<QualityMetricsProps> = ({ metrics }) => {
  // Mock data for demonstration
  const mockMetrics: QualityData[] = metrics || [
    {
      parameter: 'Moisture Content',
      value: 8.5,
      unit: '%',
      status: 'excellent',
      trend: 'stable'
    },
    {
      parameter: 'Purity Level',
      value: 98.2,
      unit: '%',
      status: 'excellent',
      trend: 'up'
    },
    {
      parameter: 'Potency',
      value: 95.7,
      unit: '%',
      status: 'good',
      trend: 'up'
    },
    {
      parameter: 'Heavy Metals',
      value: 2.1,
      unit: 'ppm',
      status: 'good',
      trend: 'down'
    },
    {
      parameter: 'Pesticide Residue',
      value: 0.05,
      unit: 'ppm',
      status: 'excellent',
      trend: 'stable'
    },
    {
      parameter: 'Microbial Count',
      value: 150,
      unit: 'cfu/g',
      status: 'warning',
      trend: 'up'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string, status: string) => {
    if (status === 'critical' || status === 'warning') {
      return trend === 'down' ? 'text-green-600' : 'text-red-600';
    }
    return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quality Metrics</h3>
        <div className="text-sm text-gray-600">
          Last updated: 5 min ago
        </div>
      </div>

      {/* Overall quality score */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Overall Quality Score</p>
            <p className="text-3xl font-bold text-green-600">96.8%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Compliance Rate</p>
            <p className="text-2xl font-bold text-blue-600">99.2%</p>
          </div>
        </div>
      </div>

      {/* Quality parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockMetrics.map((metric, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">
                {metric.parameter}
              </h4>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </span>
                <span className="text-sm text-gray-600">
                  {metric.unit}
                </span>
              </div>
              
              <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend, metric.status)}`}>
                <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                <span className="text-xs font-medium capitalize">
                  {metric.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quality alerts */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quality Alerts</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">
              Microbial count trending upward in batch #456
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">
              All batches meeting purity standards this week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
