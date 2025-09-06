import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification, NotificationDocument, NotificationType, NotificationPriority } from './notification.entity';
import { AlertTriggeredUserPayload, AlertTriggeredOrderPayload } from '../alert/types';
import { NotificationCreatedPayload } from './types';
export declare class NotificationService {
    private notificationModel;
    private readonly eventEmitter;
    private readonly logger;
    constructor(notificationModel: Model<NotificationDocument>, eventEmitter: EventEmitter2);
    createNotification(data: Omit<Partial<Notification>, 'userId'> & {
        userId: string | Types.ObjectId;
    }): Promise<Notification>;
    emitNotification(payload: NotificationCreatedPayload): void;
    handleUserAlert(payload: AlertTriggeredUserPayload): Promise<void>;
    handleOrderAlert(payload: AlertTriggeredOrderPayload): Promise<void>;
    updateNotification(id: string, data: Partial<Notification>): Promise<Notification>;
    getUserNotifications(userId: string, options?: {
        page?: number;
        limit?: number;
        status?: string;
        type?: string;
        symbol?: string;
    }): Promise<{
        notifications: Notification[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markMultipleAsRead(notificationIds: string[], userId: string): Promise<{
        modifiedCount: number;
    }>;
    markAllAsRead(userId: string, filters?: {
        type?: string;
        symbol?: string;
    }): Promise<{
        modifiedCount: number;
    }>;
    archiveNotification(notificationId: string, userId: string): Promise<Notification>;
    archiveMultiple(notificationIds: string[], userId: string): Promise<{
        modifiedCount: number;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<boolean>;
    deleteMultiple(notificationIds: string[], userId: string): Promise<{
        deletedCount: number;
    }>;
    getNotificationStats(userId: string): Promise<{
        total: number;
        unread: number;
        read: number;
        archived: number;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    cleanupExpiredNotifications(): Promise<{
        deletedCount: number;
    }>;
    sendBulkNotifications(userIds: string[], notificationData: {
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
        expiresAt?: Date;
    }): Promise<{
        createdCount: number;
        failedCount: number;
        errors: string[];
    }>;
}
