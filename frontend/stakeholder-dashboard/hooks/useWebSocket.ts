import { useState, useEffect, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const useWebSocket = (url?: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const wsUrl = url || 'ws://localhost:3005/ws';

  const connect = () => {
    try {
      setConnectionStatus('connecting');
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        setConnectionStatus('error');
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      setConnectionStatus('error');
      console.error('Error creating WebSocket connection:', error);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wsUrl]);

  // Simulate real-time data for demo purposes
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        const mockMessage: WebSocketMessage = {
          type: 'dashboard_update',
          data: {
            networkHealth: Math.floor(Math.random() * 5) + 95,
            activeTransactions: Math.floor(Math.random() * 20) + 10,
            newCollections: Math.floor(Math.random() * 5),
            qualityAlerts: Math.floor(Math.random() * 3),
          },
          timestamp: new Date().toISOString()
        };
        setLastMessage(mockMessage);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connectionStatus
  };
};
