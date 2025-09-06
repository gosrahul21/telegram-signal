import { Socket } from 'socket.io';
export declare class SocketService {
    private clients;
    private heartbeatInterval;
    sendHeartbeat(client: Socket): void;
    stopHeartbeat(): void;
    registerClient(userId: string, client: Socket): void;
    removeClient(client: Socket): void;
    emitToUser(userId: string, event: string, data: any): boolean;
    broadcastToAll(event: string, data: any): number;
    broadcastToUsers(userIds: string[], event: string, data: any): number;
    getConnectedUserIds(): string[];
    getConnectionCount(): number;
    isUserConnected(userId: string): boolean;
    getClient(userId: string): Socket | undefined;
}
