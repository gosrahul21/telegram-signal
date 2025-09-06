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
    handleGetConnectionInfo(client: Socket & {
        user: any;
    }): Promise<{
        userId: any;
        connectionId: string;
        connected: boolean;
        totalConnections: number;
        timestamp: Date;
    } | {
        error: string;
    }>;
    handleGetActiveAlerts(client: Socket & {
        user: any;
    }): Promise<{
        userId: any;
        alerts: any[];
        count: number;
        timestamp: Date;
        message: string;
    } | {
        error: string;
    }>;
    handleGetMonitoringSummary(client: Socket & {
        user: any;
    }): Promise<{
        userId: any;
        totalAlerts: number;
        activeAlerts: number;
        monitoringSymbols: any[];
        lastUpdate: Date;
        status: string;
        message: string;
    } | {
        error: string;
    }>;
    handleTestAlert(data: {
        symbol: string;
        eventType: string;
    }, client: Socket & {
        user: any;
    }): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    handleHeartbeat(client: Socket & {
        user: any;
    }): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    afterInit(server: Server): void;
    sendToUser(userId: string, event: string, data: any): boolean;
    broadcastToAll(event: string, data: any): boolean;
}
