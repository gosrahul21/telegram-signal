// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketAuthMiddleware } from './socket-auth.middleware';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketService: SocketService,
    private readonly socketAuthMiddleware: SocketAuthMiddleware,
  ) {}

  handleConnection(client: Socket & { user: any }) {
    console.log('handleConnection - Client connected:', client.id);
    console.log('handleConnection - Client data:', client.data);

    const userId = client.data?.user?.sub;
    console.log('handleConnection - User ID:', userId);

    if (userId) {
      this.socketService.registerClient(userId, client);
      console.log(`✅ User ${userId} connected`);

      // Send initial connection confirmation
      client.emit('connected', {
        message: 'Successfully connected to monitoring service',
        userId,
        timestamp: new Date(),
      });
    } else {
      console.error('❌ No user ID found in client data');
      client.emit('error', {
        message: 'Authentication failed - no user ID found',
        timestamp: new Date(),
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.socketService.removeClient(client);
    console.log(`❌ Client disconnected`);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() msg: string, @ConnectedSocket() client: Socket) {
    return { event: 'pong', data: `Hello, got your ping: ${msg}` };
  }

  @SubscribeMessage('get_connection_info')
  async handleGetConnectionInfo(
    @ConnectedSocket() client: Socket & { user: any },
  ) {
    try {
      const userId = client.data.user.sub;
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      const connectionInfo = {
        userId,
        connectionId: client.id,
        connected: this.socketService.isUserConnected(userId),
        totalConnections: this.socketService.getConnectionCount(),
        timestamp: new Date(),
      };

      client.emit('connection_info', connectionInfo);
      return connectionInfo;
    } catch (error) {
      console.error('Error getting connection info:', error);
      return { error: 'Failed to get connection info' };
    }
  }

  @SubscribeMessage('get_active_alerts')
  async handleGetActiveAlerts(
    @ConnectedSocket() client: Socket & { user: any },
  ) {
    try {
      const userId = client.data.user.sub;
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      // This would typically call the monitoring service to get user's active alerts
      // For now, we'll send a placeholder response
      const activeAlerts = {
        userId,
        alerts: [],
        count: 0,
        timestamp: new Date(),
        message: 'Active alerts retrieved successfully',
      };

      client.emit('active_alerts', activeAlerts);
      return activeAlerts;
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return { error: 'Failed to get active alerts' };
    }
  }

  @SubscribeMessage('get_monitoring_summary')
  async handleGetMonitoringSummary(
    @ConnectedSocket() client: Socket & { user: any },
  ) {
    try {
      const userId = client.data.user.sub;
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      // This would typically call the monitoring service to get monitoring summary
      const monitoringSummary = {
        userId,
        totalAlerts: 0,
        activeAlerts: 0,
        monitoringSymbols: [],
        lastUpdate: new Date(),
        status: 'active',
        message: 'Monitoring summary retrieved successfully',
      };

      client.emit('monitoring_summary', monitoringSummary);
      return monitoringSummary;
    } catch (error) {
      console.error('Error getting monitoring summary:', error);
      return { error: 'Failed to get monitoring summary' };
    }
  }

  @SubscribeMessage('test_alert')
  async handleTestAlert(
    @MessageBody() data: { symbol: string; eventType: string },
    @ConnectedSocket() client: Socket & { user: any },
  ) {
    try {
      const userId = client.data.user.sub;
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      // Send a test alert to the user
      const testAlert = {
        type: 'test_alert',
        data: {
          alertId: 'test_' + Date.now(),
          symbol: data.symbol || 'TEST',
          eventType: data.eventType || 'test_event',
          message: 'This is a test alert',
          timestamp: new Date(),
        },
        message: 'Test alert sent successfully',
      };

      client.emit('test_alert', testAlert);
      return { success: true, message: 'Test alert sent' };
    } catch (error) {
      console.error('Error sending test alert:', error);
      return { error: 'Failed to send test alert' };
    }
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: Socket & { user: any }) {
    try {
      const userId = client.data.user.sub;
      if (!userId) {
        return { error: 'User not authenticated' };
      }

      // Send heartbeat response
      const heartbeatResponse = {
        type: 'heartbeat_response',
        data: {
          userId,
          timestamp: new Date(),
          serverTime: Date.now(),
        },
        message: 'Heartbeat received',
      };

      client.emit('heartbeat_response', heartbeatResponse);
      return { success: true, message: 'Heartbeat received' };
    } catch (error) {
      console.error('Error handling heartbeat:', error);
      return { error: 'Failed to handle heartbeat' };
    }
  }

  afterInit(server: Server) {
    server.use(this.socketAuthMiddleware.use.bind(this.socketAuthMiddleware));
  }

  // Method to send message to specific user
  sendToUser(userId: string, event: string, data: any) {
    console.log(`Sending ${event} to user ${userId}:`, data);

    // Find all sockets for this user
    const userSockets = Array.from(this.server.sockets.sockets.values()).filter(
      (socket: any) => socket.data?.user?.sub === userId,
    );

    if (userSockets.length === 0) {
      console.log(`No active sockets found for user ${userId}`);
      return false;
    }

    // Send to all sockets of this user
    userSockets.forEach((socket: any) => {
      socket.emit(event, data);
    });

    console.log(
      `Message sent to ${userSockets.length} socket(s) for user ${userId}`,
    );
    return true;
  }

  // Method to broadcast to all connected users
  broadcastToAll(event: string, data: any) {
    console.log(`Broadcasting ${event} to all users:`, data);
    this.server.emit(event, data);
    return true;
  }
}
