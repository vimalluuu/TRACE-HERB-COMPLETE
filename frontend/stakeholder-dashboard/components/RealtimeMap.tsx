import React from 'react';

interface RealtimeMapProps {
  activities?: Array<{
    id: string;
    type: 'collection' | 'processing' | 'quality' | 'transport';
    location: string;
    farmer: string;
    timestamp: string;
    status: 'active' | 'completed' | 'pending';
  }>;
}

export const RealtimeMap: React.FC<RealtimeMapProps> = ({ activities }) => {
  // Mock data for demonstration
  const mockActivities = activities || [
    {
      id: '1',
      type: 'collection' as const,
      location: 'Madhya Pradesh',
      farmer: 'Farmer #123',
      timestamp: '2 min ago',
      status: 'active' as const
    },
    {
      id: '2',
      type: 'quality' as const,
      location: 'Rajasthan',
      farmer: 'Farmer #456',
      timestamp: '5 min ago',
      status: 'completed' as const
    },
    {
      id: '3',
      type: 'processing' as const,
      location: 'Maharashtra',
      farmer: 'Farmer #789',
      timestamp: '8 min ago',
      status: 'pending' as const
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'collection':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'quality':
        return 'bg-yellow-500';
      case 'transport':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Real-time Activities</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live Updates</span>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-gray-100 rounded-lg h-64 mb-6 flex items-center justify-center relative overflow-hidden">
        <div className="text-gray-500 text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm">Interactive Map</p>
          <p className="text-xs text-gray-400">Showing herb collection locations</p>
        </div>

        {/* Activity indicators */}
        {mockActivities.map((activity, index) => (
          <div
            key={activity.id}
            className={`absolute w-3 h-3 rounded-full ${getActivityColor(activity.type)} animate-ping`}
            style={{
              top: `${20 + index * 25}%`,
              left: `${30 + index * 20}%`,
            }}
          ></div>
        ))}
      </div>

      {/* Activity list */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activities</h4>
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getActivityColor(activity.type)}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {activity.type} - {activity.location}
                </p>
                <p className="text-xs text-gray-600">{activity.farmer}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                {activity.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
