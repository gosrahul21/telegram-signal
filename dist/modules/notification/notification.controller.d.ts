import { NotificationService } from './notification.service';
import { NotificationType, NotificationPriority } from './notification.entity';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
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
