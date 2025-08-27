import { Socket } from 'socket.io';
export declare class SocketService {
    private clients;
    registerClient(userId: string, client: Socket): void;
    removeClient(client: Socket): void;
    emitToUser(userId: string, event: string, data: any): boolean;
}
