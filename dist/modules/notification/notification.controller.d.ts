import { NotificationService } from './notification.service';
import { NotificationType, NotificationPriority } from './notification.entity';
import { MonitorEventType } from '../alert';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    sendSampleAlert(payload: {
        userId?: string;
        symbol?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        userId: any;
        alert: {
            type: NotificationType;
            data: {
                alertId: string;
                symbol: string;
                eventType: MonitorEventType;
                message: string;
                timestamp: Date;
                price: number;
                rsi: number;
                volume: number;
                timeframe: string;
                priority: string;
                metadata: {
                    source: string;
                    confidence: number;
                    recommendation: string;
                };
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        alert: {
            type: NotificationType;
            data: {
                alertId: string;
                symbol: string;
                eventType: MonitorEventType;
                message: string;
                timestamp: Date;
                price: number;
                rsi: number;
                volume: number;
                timeframe: string;
                priority: string;
                metadata: {
                    source: string;
                    confidence: number;
                    recommendation: string;
                };
            };
        };
        userId?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        userId?: undefined;
        alert?: undefined;
    }>;
    sendPriceAlert(payload: {
        userId?: string;
        symbol?: string;
        price?: number;
    }): Promise<{
        success: boolean;
        message: string;
        userId: string;
        alert: {
            type: string;
            data: {
                alertId: string;
                symbol: string;
                eventType: string;
                message: string;
                timestamp: Date;
                currentPrice: number;
                targetPrice: number;
                change: string;
                volume: number;
                timeframe: string;
                priority: string;
                metadata: {
                    source: string;
                    confidence: number;
                    trend: string;
                };
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        alert: {
            type: string;
            data: {
                alertId: string;
                symbol: string;
                eventType: string;
                message: string;
                timestamp: Date;
                currentPrice: number;
                targetPrice: number;
                change: string;
                volume: number;
                timeframe: string;
                priority: string;
                metadata: {
                    source: string;
                    confidence: number;
                    trend: string;
                };
            };
        };
        userId?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        userId?: undefined;
        alert?: undefined;
    }>;
    getUserNotifications(req: any, page?: number, limit?: number, status?: string, type?: string, symbol?: string): Promise<{
        success: boolean;
        data: {
            notifications: import("./notification.entity").Notification[];
            total: number;
            page: number;
            totalPages: number;
        };
    }>;
    getNotificationStats(req: any): Promise<{
        success: boolean;
        data: {
            total: number;
            unread: number;
            read: number;
            archived: number;
            byType: Record<string, number>;
            byPriority: Record<string, number>;
        };
    }>;
    markAsRead(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: import("./notification.entity").Notification;
    }>;
    markMultipleAsRead(body: {
        notificationIds: string[];
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            modifiedCount: number;
        };
    }>;
    markAllAsRead(body: {
        type?: string;
        symbol?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            modifiedCount: number;
        };
    }>;
    archiveNotification(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: import("./notification.entity").Notification;
    }>;
    archiveMultiple(body: {
        notificationIds: string[];
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            modifiedCount: number;
        };
    }>;
    deleteNotification(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteMultiple(body: {
        notificationIds: string[];
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            deletedCount: number;
        };
    }>;
    sendBulkNotifications(body: {
        userIds: string[];
        type: NotificationType;
        priority: NotificationPriority;
        title: string;
        message: string;
        data?: Record<string, any>;
        symbol?: string;
        timeframe?: string;
        eventType?: string;
        alertId?: string;
        tags?: string[];
        metadata?: Record<string, any>;
        isPersistent?: boolean;
        expiresAt?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            createdCount: number;
            failedCount: number;
            errors: string[];
        };
    }>;
    cleanupExpiredNotifications(): Promise<{
        success: boolean;
        message: string;
        data: {
            deletedCount: number;
        };
    }>;
}
