import React from 'react';

interface NetworkHealthChartProps {
  data?: Array<{
    time: string;
    health: number;
    transactions: number;
  }>;
}

export const NetworkHealthChart: React.FC<NetworkHealthChartProps> = ({ data }) => {
  // Mock data for demonstration
  const mockData = data || [
    { time: '00:00', health: 98, transactions: 45 },
    { time: '04:00', health: 97, transactions: 52 },
    { time: '08:00', health: 99, transactions: 78 },
    { time: '12:00', health: 98, transactions: 89 },
    { time: '16:00', health: 96, transactions: 67 },
    { time: '20:00', health: 99, transactions: 43 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Network Health</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Healthy</span>
        </div>
      </div>

      {/* Simple chart visualization */}
      <div className="space-y-4">
        {mockData.map((point, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 w-12">{point.time}</span>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${point.health}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900 w-8">
              {point.health}%
            </span>
            <span className="text-xs text-gray-500 w-12 text-right">
              {point.transactions} tx
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">98.2%</p>
            <p className="text-xs text-gray-600">Avg Health</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">1,247</p>
            <p className="text-xs text-gray-600">Total TX</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">5</p>
            <p className="text-xs text-gray-600">Nodes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
