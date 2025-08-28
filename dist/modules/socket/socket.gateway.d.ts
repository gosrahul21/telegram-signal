import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { SocketAuthMiddleware } from './socket-auth.middleware';
export declare class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly socketService;
    private readonly socketAuthMiddleware;
    server: Server;
    constructor(socketService: SocketService, socketAuthMiddleware: SocketAuthMiddleware);
    handleConnection(client: Socket & {
        user: any;
    }): void;
    handleDisconnect(client: Socket): void;
    handlePing(msg: string, client: Socket): {
        event: string;
        data: string;
    };
    afterInit(server: Server): void;
}
