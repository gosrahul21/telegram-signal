import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly notificationService: NotificationService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove the connection from the notification service
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      this.notificationService.removeWebSocketConnection(userId);
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;
    
    // Store the user ID in the socket data for future reference
    client.data.userId = userId;
    
    // Add the WebSocket connection to the notification service
    this.notificationService.addWebSocketConnection(userId, client);
    
    this.logger.log(`User ${userId} authenticated via WebSocket`);
    
    // Send confirmation message
    client.emit('authenticated', { 
      message: 'Successfully authenticated',
      userId,
      timestamp: Date.now()
    });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { symbol: string; type: string },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    // Join the room for the specific symbol/type
    const roomName = `${data.symbol}_${data.type}`;
    client.join(roomName);
    
    this.logger.log(`User ${userId} subscribed to ${roomName}`);
    
    client.emit('subscribed', {
      symbol: data.symbol,
      type: data.type,
      room: roomName,
      timestamp: Date.now()
    });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { symbol: string; type: string },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    // Leave the room for the specific symbol/type
    const roomName = `${data.symbol}_${data.type}`;
    client.leave(roomName);
    
    this.logger.log(`User ${userId} unsubscribed from ${roomName}`);
    
    client.emit('unsubscribed', {
      symbol: data.symbol,
      type: data.type,
      room: roomName,
      timestamp: Date.now()
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  /**
   * Broadcast message to all users subscribed to a specific symbol/type
   */
  broadcastToSymbol(symbol: string, type: string, message: any) {
    const roomName = `${symbol}_${type}`;
    this.server.to(roomName).emit('signal', {
      ...message,
      symbol,
      type,
      timestamp: Date.now()
    });
    
    this.logger.log(`Broadcasted ${type} signal for ${symbol} to room ${roomName}`);
  }

  /**
   * Send message to a specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    const client = this.findClientByUserId(userId);
    if (client) {
      client.emit(event, {
        ...data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get user ID from socket
   */
  private getUserIdFromSocket(client: Socket): string | null {
    return client.data?.userId || null;
  }

  /**
   * Find client by user ID
   */
  private findClientByUserId(userId: string): Socket | null {
    const clients = Array.from(this.server.sockets.sockets.values());
    return clients.find(client => client.data?.userId === userId) || null;
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.server.sockets.sockets.size;
  }

  /**
   * Get all connected user IDs
   */
  getConnectedUserIds(): string[] {
    const clients = Array.from(this.server.sockets.sockets.values());
    return clients
      .map(client => client.data?.userId)
      .filter(userId => userId !== undefined);
  }
}
