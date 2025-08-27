import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
export declare class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly socketService;
    server: Server;
    constructor(socketService: SocketService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handlePing(msg: string, client: Socket): {
        event: string;
        data: string;
    };
}
