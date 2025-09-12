import React from 'react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  acknowledged: boolean;
}

interface AlertsPanelProps {
  alerts?: Alert[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  // Mock data for demonstration
  const mockAlerts: Alert[] = alerts || [
    {
      id: '1',
      type: 'critical',
      title: 'Quality Threshold Exceeded',
      message: 'Batch #456 has moisture content above acceptable limits (12.5%)',
      timestamp: '5 min ago',
      source: 'Quality Control Lab',
      acknowledged: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Geo-fence Violation',
      message: 'Collection detected outside approved harvesting zone',
      timestamp: '15 min ago',
      source: 'GPS Monitoring',
      acknowledged: false
    },
    {
      id: '3',
      type: 'info',
      title: 'New Farmer Registration',
      message: 'Farmer #789 has completed onboarding process',
      timestamp: '1 hour ago',
      source: 'Registration System',
      acknowledged: true
    },
    {
      id: '4',
      type: 'success',
      title: 'Quality Certification Complete',
      message: 'Batch #123 has passed all quality tests',
      timestamp: '2 hours ago',
      source: 'Quality Control Lab',
      acknowledged: true
    },
    {
      id: '5',
      type: 'warning',
      title: 'Low Inventory Alert',
      message: 'Ashwagandha stock below minimum threshold',
      timestamp: '3 hours ago',
      source: 'Inventory Management',
      acknowledged: false
    },
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '📄';
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-gray-800';
    }
  };

  const unacknowledgedAlerts = mockAlerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = mockAlerts.filter(alert => alert.acknowledged);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {unacknowledgedAlerts.length} unread
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
      </div>

      {/* Alert summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-lg font-bold text-red-600">
            {mockAlerts.filter(a => a.type === 'critical').length}
          </p>
          <p className="text-xs text-gray-600">Critical</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-lg font-bold text-yellow-600">
            {mockAlerts.filter(a => a.type === 'warning').length}
          </p>
          <p className="text-xs text-gray-600">Warning</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-lg font-bold text-blue-600">
            {mockAlerts.filter(a => a.type === 'info').length}
          </p>
          <p className="text-xs text-gray-600">Info</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-600">
            {mockAlerts.filter(a => a.type === 'success').length}
          </p>
          <p className="text-xs text-gray-600">Success</p>
        </div>
      </div>

      {/* Unacknowledged alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Requires Attention ({unacknowledgedAlerts.length})
          </h4>
          <div className="space-y-3">
            {unacknowledgedAlerts.map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
                <div className="flex items-start space-x-3">
                  <span className="text-lg flex-shrink-0">{getAlertIcon(alert.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className={`text-sm font-medium ${getAlertTextColor(alert.type)}`}>
                        {alert.title}
                      </h5>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                    <p className={`text-sm mt-1 ${getAlertTextColor(alert.type)}`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        Source: {alert.source}
                      </span>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent acknowledged alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Recent Activity ({acknowledgedAlerts.length})
          </h4>
          <div className="space-y-2">
            {acknowledgedAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg opacity-75">
                <span className="text-sm">{getAlertIcon(alert.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{alert.title}</p>
                  <p className="text-xs text-gray-500">{alert.timestamp} • {alert.source}</p>
                </div>
                <span className="text-xs text-green-600">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
