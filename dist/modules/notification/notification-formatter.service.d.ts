import { NotificationType, NotificationPriority } from './notification.entity';
export interface FormattedNotification {
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, any>;
    priority: NotificationPriority;
    tags: string[];
    isPersistent: boolean;
    expiresAt?: Date;
}
export interface FormattedSocketMessage {
    type: string;
    data: Record<string, any>;
    message: string;
    timestamp: Date;
}
export declare class NotificationFormatterService {
    formatAlertTriggeredForDatabase(event: any): FormattedNotification;
    formatAlertTriggeredForSocket(event: any): FormattedSocketMessage;
    formatPriceTargetForDatabase(event: any): FormattedNotification;
    formatPriceTargetForSocket(event: any): FormattedSocketMessage;
    formatTechnicalIndicatorForDatabase(event: any): FormattedNotification;
    formatTechnicalIndicatorForSocket(event: any): FormattedSocketMessage;
    formatOrderStatusForDatabase(event: any): FormattedNotification;
    formatOrderStatusForSocket(event: any): FormattedSocketMessage;
    formatMarketAlertForDatabase(event: any): FormattedNotification;
    private getPriorityFromSeverity;
    getNotificationTypeFromEvent(eventType: string): NotificationType;
}
