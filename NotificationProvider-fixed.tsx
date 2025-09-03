import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface NotificationContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: any[];
  sendTestMessage: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  sendTestMessage: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
  websocketUrl: string;
  jwtToken: string | null;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  websocketUrl,
  jwtToken,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!jwtToken) {
      console.log('No JWT token available, skipping WebSocket connection');
      return;
    }

    console.log('Connecting to WebSocket:', websocketUrl);
    console.log('Using JWT token:', jwtToken.substring(0, 20) + '...');

    // Create socket connection with proper authentication
    const newSocket = io(websocketUrl, {
      auth: {
        token: jwtToken, // This is the correct way to send JWT
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Server events
    newSocket.on('connected', (data) => {
      console.log('Server confirmation received:', data);
    });

    newSocket.on('notification', (data) => {
      console.log('Notification received:', data);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on('order_update', (data) => {
      console.log('Order update received:', data);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'order_update',
          ...data,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on('test_alert', (data) => {
      console.log('Test alert received:', data);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'test_alert',
          ...data,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on('heartbeat_response', (data) => {
      console.log('Heartbeat response:', data);
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      newSocket.disconnect();
    };
  }, [websocketUrl, jwtToken]);

  const sendTestMessage = () => {
    if (socket && isConnected) {
      console.log('Sending test message...');
      socket.emit('ping', 'Hello from React frontend!');
    } else {
      console.log('Cannot send test message - not connected');
    }
  };

  const contextValue: NotificationContextType = {
    socket,
    isConnected,
    notifications,
    sendTestMessage,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
};
