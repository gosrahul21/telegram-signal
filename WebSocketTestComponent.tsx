import React from 'react';
import { useNotifications } from './NotificationProvider-fixed';

export const WebSocketTestComponent: React.FC = () => {
  const { socket, isConnected, notifications, sendTestMessage } =
    useNotifications();

  const sendPing = () => {
    if (socket && isConnected) {
      socket.emit('ping', 'Test ping from React!');
    }
  };

  const getConnectionInfo = () => {
    if (socket && isConnected) {
      socket.emit('get_connection_info');
    }
  };

  const sendTestAlert = () => {
    if (socket && isConnected) {
      socket.emit('test_alert', {
        symbol: 'BTCUSDT',
        eventType: 'price_alert',
      });
    }
  };

  const sendHeartbeat = () => {
    if (socket && isConnected) {
      socket.emit('heartbeat');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>WebSocket Connection Test</h3>

      <div style={{ marginBottom: '20px' }}>
        <strong>Status:</strong>
        <span
          style={{
            color: isConnected ? '#4CAF50' : '#f44336',
            marginLeft: '10px',
          }}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Socket ID:</strong> {socket?.id || 'Not connected'}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={sendPing}
          disabled={!isConnected}
          style={{
            padding: '8px 16px',
            margin: '5px',
            backgroundColor: isConnected ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
          }}
        >
          Send Ping
        </button>

        <button
          onClick={getConnectionInfo}
          disabled={!isConnected}
          style={{
            padding: '8px 16px',
            margin: '5px',
            backgroundColor: isConnected ? '#FF9800' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
          }}
        >
          Get Connection Info
        </button>

        <button
          onClick={sendTestAlert}
          disabled={!isConnected}
          style={{
            padding: '8px 16px',
            margin: '5px',
            backgroundColor: isConnected ? '#E91E63' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
          }}
        >
          Send Test Alert
        </button>

        <button
          onClick={sendHeartbeat}
          disabled={!isConnected}
          style={{
            padding: '8px 16px',
            margin: '5px',
            backgroundColor: isConnected ? '#795548' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
          }}
        >
          Send Heartbeat
        </button>
      </div>

      <div>
        <h4>Notifications ({notifications.length})</h4>
        <div
          style={{
            height: '200px',
            overflow: 'auto',
            border: '1px solid #ddd',
            padding: '10px',
            backgroundColor: '#f9f9f9',
          }}
        >
          {notifications.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              No notifications yet
            </p>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={notification.id || index}
                style={{
                  marginBottom: '10px',
                  padding: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {notification.timestamp?.toLocaleTimeString()}
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  {notification.type || 'Notification'}
                </div>
                <div style={{ fontSize: '14px' }}>
                  {JSON.stringify(notification, null, 2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
