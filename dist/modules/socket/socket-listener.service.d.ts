import { OnModuleInit } from '@nestjs/common';
import { SocketService } from './socket.service';
export declare class SocketListenerService implements OnModuleInit {
    private readonly socketService;
    private readonly logger;
    constructor(socketService: SocketService);
    onModuleInit(): void;
    handleAlertTriggered(event: any): Promise<void>;
    private broadcastToAllUsers;
    sendMonitoringStatusUpdate(userId: string, status: any): Promise<void>;
    sendAlertMonitoringUpdate(userId: string, alertId: string, status: string, data?: any): Promise<void>;
}
