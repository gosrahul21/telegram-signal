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
        console.log('Sending heartbeat to client', client.id);
        client.emit('heartbeat', { message: 'Heartbeat' });
      }
    }, 2000);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval);
  }

  registerClient(userId: string, client: Socket) {
    this.clients.set(userId, client);
    this.sendHeartbeat(client);
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
}
