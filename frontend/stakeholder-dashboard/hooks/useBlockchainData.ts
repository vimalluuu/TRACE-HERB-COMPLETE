import { useState, useEffect } from 'react';

interface BlockchainMetrics {
  networkHealth: number;
  totalTransactions: number;
  activeNodes: number;
  blockHeight: number;
  averageBlockTime: number;
  pendingTransactions: number;
}

interface Transaction {
  id: string;
  type: string;
  hash: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  blockNumber?: number;
}

interface UseBlockchainDataReturn {
  metrics: BlockchainMetrics;
  recentTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useBlockchainData = (): UseBlockchainDataReturn => {
  const [metrics, setMetrics] = useState<BlockchainMetrics>({
    networkHealth: 98.5,
    totalTransactions: 1247,
    activeNodes: 5,
    blockHeight: 2103,
    averageBlockTime: 2.3,
    pendingTransactions: 3
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'collection',
      hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
      timestamp: '2 min ago',
      status: 'confirmed',
      blockNumber: 2103
    },
    {
      id: '2',
      type: 'quality',
      hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
      timestamp: '5 min ago',
      status: 'confirmed',
      blockNumber: 2102
    },
    {
      id: '3',
      type: 'processing',
      hash: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
      timestamp: '8 min ago',
      status: 'pending'
    },
    {
      id: '4',
      type: 'transport',
      hash: '0x4d5e6f7890abcdef1234567890abcdef12345678',
      timestamp: '12 min ago',
      status: 'confirmed',
      blockNumber: 2101
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockchainData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to blockchain service
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update metrics with some variation
      setMetrics(prev => ({
        ...prev,
        networkHealth: Math.max(95, Math.min(100, prev.networkHealth + (Math.random() - 0.5) * 2)),
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 5),
        blockHeight: prev.blockHeight + Math.floor(Math.random() * 2),
        pendingTransactions: Math.max(0, Math.floor(Math.random() * 10))
      }));

      // Occasionally add new transactions
      if (Math.random() > 0.7) {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: ['collection', 'quality', 'processing', 'transport'][Math.floor(Math.random() * 4)],
          hash: `0x${Math.random().toString(16).substr(2, 40)}`,
          timestamp: 'Just now',
          status: Math.random() > 0.1 ? 'confirmed' : 'pending',
          blockNumber: Math.random() > 0.1 ? metrics.blockHeight + 1 : undefined
        };

        setRecentTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
      }

    } catch (err) {
      setError('Failed to fetch blockchain data');
      console.error('Blockchain data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchBlockchainData();
  };

  useEffect(() => {
    fetchBlockchainData();

    // Set up periodic data refresh
    const interval = setInterval(() => {
      fetchBlockchainData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        networkHealth: Math.max(95, Math.min(100, prev.networkHealth + (Math.random() - 0.5) * 0.5)),
        pendingTransactions: Math.max(0, prev.pendingTransactions + Math.floor((Math.random() - 0.5) * 3))
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    recentTransactions,
    isLoading,
    error,
    refreshData
  };
};
