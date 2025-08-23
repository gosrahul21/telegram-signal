import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
export declare class NotificationExampleService {
    private readonly notificationService;
    private readonly notificationGateway;
    private readonly logger;
    constructor(notificationService: NotificationService, notificationGateway: NotificationGateway);
    sendRSISignal(userId: string, symbol: string, rsiValue: number, action: 'BUY' | 'SELL'): Promise<{
        telegram: boolean;
        websocket: boolean;
    }>;
    sendPriceAlert(userId: string, symbol: string, currentPrice: number, targetPrice: number, condition: string): Promise<{
        telegram: boolean;
        websocket: boolean;
    }>;
    sendMonitoringStatus(userId: string, symbol: string, status: string, details: any): Promise<{
        telegram: boolean;
        websocket: boolean;
    }>;
    sendMultiChannelNotification(userId: string, message: string, type: 'signal' | 'alert' | 'status' | 'general', data?: any): Promise<{
        telegram: boolean;
        websocket: boolean;
    }>;
    sendBulkSignalNotification(userIds: string[], signalData: any): Promise<{
        telegram: {
            success: string[];
            failed: string[];
        };
        websocket: {
            success: string[];
            failed: string[];
        };
    }>;
    sendSystemMaintenanceNotification(message: string, maintenanceTime?: string): Promise<{
        success: string[];
        failed: string[];
    }>;
    getNotificationStats(): {
        connectedUsers: number;
        connectedUserIds: string[];
        websocketConnections: number;
    };
    private getCurrentPrice;
    private calculateConfidence;
    private formatSignalMessage;
}
