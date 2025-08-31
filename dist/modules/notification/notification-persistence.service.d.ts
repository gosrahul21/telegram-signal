import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType, NotificationStatus, NotificationPriority } from './notification.entity';
export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    symbol?: string;
    timeframe?: string;
    eventType?: string;
    alertId?: string;
    priority?: NotificationPriority;
    tags?: string[];
    metadata?: Record<string, any>;
    isPersistent?: boolean;
    expiresAt?: Date;
}
export interface NotificationFilter {
    userId?: string;
    type?: NotificationType;
    status?: NotificationStatus;
    symbol?: string;
    read?: boolean;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
}
export declare class NotificationPersistenceService {
    private readonly notificationModel;
    private readonly logger;
    constructor(notificationModel: Model<NotificationDocument>);
    createNotification(createDto: CreateNotificationDto): Promise<Notification>;
    getUserNotifications(filter: NotificationFilter): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markMultipleAsRead(notificationIds: string[], userId: string): Promise<number>;
    markAllAsRead(userId: string): Promise<number>;
    archiveNotification(notificationId: string, userId: string): Promise<Notification>;
    deleteNotification(notificationId: string, userId: string): Promise<boolean>;
    cleanupExpiredNotifications(): Promise<number>;
    getUserNotificationStats(userId: string): Promise<{
        total: number;
        unread: number;
        read: number;
        archived: number;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    searchNotifications(userId: string, searchTerm: string, limit?: number): Promise<Notification[]>;
}
