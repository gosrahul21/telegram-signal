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

  @WebSocketGateway({
    cors: { origin: '*' }, // Adjust CORS for production
  })
  @Injectable()
  export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly socketService: SocketService) {}
  
    handleConnection(client: Socket) {
      const userId = client.handshake.query.userId as string;
      if (userId) {
        this.socketService.registerClient(userId, client);
        console.log(`✅ User ${userId} connected`);
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
  }
  