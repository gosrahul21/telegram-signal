// socket.service.ts
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
  private clients: Map<string, Socket> = new Map();

  registerClient(userId: string, client: Socket) {
    this.clients.set(userId, client);
  }

  removeClient(client: Socket) {
    for (const [userId, sock] of this.clients.entries()) {
      if (sock.id === client.id) {
        this.clients.delete(userId);
        break;
      }
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
