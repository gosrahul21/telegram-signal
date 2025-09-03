// socket.service.ts
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
  private clients: Map<string, Socket> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  sendHeartbeat(client: Socket) {
    this.heartbeatInterval = setInterval(() => {
      for (const client of this.clients.values()) {
        // console.log('Sending heartbeat to client', client.id);
        client.emit('heartbeat', { message: 'Heartbeat' });
      }
    }, 10000);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval);
  }

  registerClient(userId: string, client: Socket) {
    this.clients.set(userId, client);
    // this.sendHeartbeat(client);
  }

  removeClient(client: Socket) {
    for (const [userId, sock] of this.clients.entries()) {
      if (sock.id === client.id) {
        this.clients.delete(userId);
        break;
      }
    }
    if (this.clients.size === 0) {
      this.stopHeartbeat();
    }
  }

  emitToUser(userId: string, event: string, data: any): boolean {
    const client = this.clients.get(userId);
    if (client) {
      client.emit(event, data);
      return true;
    }
    return false;
  }

  // Broadcast to all connected users
  broadcastToAll(event: string, data: any): number {
    let sentCount = 0;
    for (const client of this.clients.values()) {
      try {
        client.emit(event, data);
        sentCount++;
      } catch (error) {
        console.error(`Error broadcasting to client ${client.id}:`, error);
      }
    }
    return sentCount;
  }

  // Broadcast to specific users
  broadcastToUsers(userIds: string[], event: string, data: any): number {
    let sentCount = 0;
    for (const userId of userIds) {
      if (this.emitToUser(userId, event, data)) {
        sentCount++;
      }
    }
    return sentCount;
  }

  // Get all connected user IDs
  getConnectedUserIds(): string[] {
    return Array.from(this.clients.keys());
  }

  // Get connection count
  getConnectionCount(): number {
    return this.clients.size;
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    return this.clients.has(userId);
  }

  // Get client by user ID
  getClient(userId: string): Socket | undefined {
    return this.clients.get(userId);
  }
}
