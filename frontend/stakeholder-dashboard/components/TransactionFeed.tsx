import React from 'react';

interface Transaction {
  id: string;
  type: 'collection' | 'quality' | 'processing' | 'transport';
  description: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  blockHash?: string;
}

interface TransactionFeedProps {
  transactions?: Transaction[];
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  // Mock data for demonstration
  const mockTransactions: Transaction[] = transactions || [
    {
      id: '1',
      type: 'collection',
      description: 'Ashwagandha collected by Farmer #123',
      timestamp: '2 min ago',
      status: 'confirmed',
      blockHash: '0x1a2b3c...'
    },
    {
      id: '2',
      type: 'quality',
      description: 'Quality test completed for batch #456',
      timestamp: '5 min ago',
      status: 'confirmed',
      blockHash: '0x4d5e6f...'
    },
    {
      id: '3',
      type: 'processing',
      description: 'Processing started for batch #789',
      timestamp: '8 min ago',
      status: 'pending'
    },
    {
      id: '4',
      type: 'transport',
      description: 'Shipment dispatched to distributor',
      timestamp: '12 min ago',
      status: 'confirmed',
      blockHash: '0x7g8h9i...'
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'collection':
        return '🌿';
      case 'quality':
        return '🔬';
      case 'processing':
        return '⚙️';
      case 'transport':
        return '🚚';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Transaction Feed</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {mockTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">{getTypeIcon(transaction.type)}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {transaction.type} Transaction
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mt-1">
                {transaction.description}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {transaction.timestamp}
                </span>
                {transaction.blockHash && (
                  <span className="text-xs text-blue-600 font-mono">
                    Block: {transaction.blockHash}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {mockTransactions.filter(t => t.status === 'confirmed').length} confirmed today
          </span>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View all transactions →
          </button>
        </div>
      </div>
    </div>
  );
};
