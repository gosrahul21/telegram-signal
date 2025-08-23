import { BotService } from "../../bot/bot.service";
export interface NotificationPayload {
    userId: string;
    message: string;
    type?: 'signal' | 'alert' | 'status' | 'general';
    data?: any;
}
export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: number;
}
export declare class NotificationService {
    private readonly botService;
    private readonly logger;
    private connectedUsers;
    private bot;
    constructor(botService: BotService);
    sendTelegramNotification(userId: string, message: string): Promise<boolean>;
    sendTelegramNotificationToMultiple(userIds: string[], message: string): Promise<{
        success: string[];
        failed: string[];
    }>;
    sendSignalNotification(userId: string, signalData: any): Promise<boolean>;
    sendAlertNotification(userId: string, alertData: any): Promise<boolean>;
    sendStatusNotification(userId: string, statusData: any): Promise<boolean>;
    addWebSocketConnection(userId: string, connection: any): void;
    removeWebSocketConnection(userId: string): void;
    sendWebSocketMessage(userId: string, message: WebSocketMessage): boolean;
    broadcastWebSocketMessage(message: WebSocketMessage): {
        success: string[];
        failed: string[];
    };
    sendMultiChannelNotification(payload: NotificationPayload): Promise<{
        telegram: boolean;
        websocket: boolean;
    }>;
    getConnectedUsersCount(): number;
    getConnectedUserIds(): string[];
    private formatSignalMessage;
    private formatAlertMessage;
    private formatStatusMessage;
}
