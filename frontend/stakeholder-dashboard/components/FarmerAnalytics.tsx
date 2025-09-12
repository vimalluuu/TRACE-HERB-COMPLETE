import React from 'react';

interface FarmerData {
  id: string;
  name: string;
  location: string;
  totalCollections: number;
  qualityScore: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

interface FarmerAnalyticsProps {
  farmers?: FarmerData[];
}

export const FarmerAnalytics: React.FC<FarmerAnalyticsProps> = ({ farmers }) => {
  // Mock data for demonstration
  const mockFarmers: FarmerData[] = farmers || [
    {
      id: '1',
      name: 'Rajesh Kumar',
      location: 'Madhya Pradesh',
      totalCollections: 45,
      qualityScore: 98,
      lastActivity: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      location: 'Rajasthan',
      totalCollections: 38,
      qualityScore: 96,
      lastActivity: '4 hours ago',
      status: 'active'
    },
    {
      id: '3',
      name: 'Amit Patel',
      location: 'Maharashtra',
      totalCollections: 52,
      qualityScore: 94,
      lastActivity: '1 day ago',
      status: 'inactive'
    },
    {
      id: '4',
      name: 'Sunita Devi',
      location: 'Madhya Pradesh',
      totalCollections: 41,
      qualityScore: 99,
      lastActivity: '3 hours ago',
      status: 'active'
    },
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'text-green-600 bg-green-100' 
      : 'text-gray-600 bg-gray-100';
  };

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Farmer Analytics</h3>
        <div className="text-sm text-gray-600">
          {mockFarmers.filter(f => f.status === 'active').length} active farmers
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {mockFarmers.length}
          </p>
          <p className="text-sm text-gray-600">Total Farmers</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {mockFarmers.reduce((sum, f) => sum + f.totalCollections, 0)}
          </p>
          <p className="text-sm text-gray-600">Collections</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(mockFarmers.reduce((sum, f) => sum + f.qualityScore, 0) / mockFarmers.length)}%
          </p>
          <p className="text-sm text-gray-600">Avg Quality</p>
        </div>
      </div>

      {/* Farmer list */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Top Performers</h4>
        {mockFarmers
          .sort((a, b) => b.qualityScore - a.qualityScore)
          .map((farmer) => (
            <div key={farmer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">
                    {farmer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{farmer.name}</p>
                  <p className="text-xs text-gray-600">{farmer.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{farmer.totalCollections}</p>
                  <p className="text-xs text-gray-600">Collections</p>
                </div>
                
                <div className="text-center">
                  <p className={`text-sm font-medium ${getQualityColor(farmer.qualityScore)}`}>
                    {farmer.qualityScore}%
                  </p>
                  <p className="text-xs text-gray-600">Quality</p>
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(farmer.status)}`}>
                    {farmer.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{farmer.lastActivity}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
