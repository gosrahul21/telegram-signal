import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly notificationService;
    server: Server;
    private readonly logger;
    constructor(notificationService: NotificationService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleAuthenticate(client: Socket, data: {
        userId: string;
    }): void;
    handleSubscribe(client: Socket, data: {
        symbol: string;
        type: string;
    }): void;
    handleUnsubscribe(client: Socket, data: {
        symbol: string;
        type: string;
    }): void;
    handlePing(client: Socket): void;
    broadcastToSymbol(symbol: string, type: string, message: any): void;
    sendToUser(userId: string, event: string, data: any): void;
    private getUserIdFromSocket;
    private findClientByUserId;
    getConnectedUsersCount(): number;
    getConnectedUserIds(): string[];
}
