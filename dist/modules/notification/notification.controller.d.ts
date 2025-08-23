import { NotificationService, NotificationPayload } from './notification.service';
import { NotificationGateway } from './notification.gateway';
export declare class NotificationController {
    private readonly notificationService;
    private readonly notificationGateway;
    constructor(notificationService: NotificationService, notificationGateway: NotificationGateway);
    sendTelegramNotification(payload: NotificationPayload): Promise<{
        success: boolean;
        userId: string;
    }>;
    sendTelegramNotificationToMultiple(payload: {
        userIds: string[];
        message: string;
    }): Promise<{
        success: string[];
        failed: string[];
    }>;
    sendSignalNotification(payload: {
        userId: string;
        signalData: any;
    }): Promise<{
        success: boolean;
        userId: string;
    }>;
    sendAlertNotification(payload: {
        userId: string;
        alertData: any;
    }): Promise<{
        success: boolean;
        userId: string;
    }>;
    sendStatusNotification(payload: {
        userId: string;
        statusData: any;
    }): Promise<{
        success: boolean;
        userId: string;
    }>;
    sendMultiChannelNotification(payload: NotificationPayload): Promise<{
        telegram: boolean;
        websocket: boolean;
    }>;
    broadcastWebSocketMessage(payload: {
        message: any;
    }): Promise<{
        success: string[];
        failed: string[];
    }>;
    sendWebSocketMessage(userId: string, payload: {
        message: any;
    }): Promise<{
        success: boolean;
        userId: string;
    }>;
    getConnectedUsersCount(): Promise<{
        connectedUsers: number;
    }>;
    getConnectedUserIds(): Promise<{
        userIds: string[];
    }>;
    broadcastToSymbol(payload: {
        symbol: string;
        type: string;
        message: any;
    }): Promise<{
        success: boolean;
        symbol: string;
        type: string;
        message: string;
    }>;
    sendToUser(userId: string, payload: {
        event: string;
        data: any;
    }): Promise<{
        success: boolean;
        userId: string;
        event: string;
        message: string;
    }>;
}
