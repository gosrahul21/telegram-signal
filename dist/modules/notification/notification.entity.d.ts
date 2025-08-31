import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare enum NotificationType {
    ALERT_TRIGGERED = "alert_triggered",
    PRICE_TARGET = "price_target",
    TECHNICAL_INDICATOR = "technical_indicator",
    ORDER_STATUS = "order_status",
    MARKET_ALERT = "market_alert",
    MONITORING_STATUS = "monitoring_status",
    ALERT_MONITORING_UPDATE = "alert_monitoring_update",
    GENERAL = "general"
}
export declare enum NotificationStatus {
    UNREAD = "unread",
    READ = "read",
    ARCHIVED = "archived"
}
export declare enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class Notification {
    uuid: string;
    userId: Types.ObjectId;
    type: NotificationType;
    status: NotificationStatus;
    priority: NotificationPriority;
    title: string;
    message: string;
    data: Record<string, any>;
    symbol?: string;
    timeframe?: string;
    eventType?: string;
    alertId?: string;
    readAt?: Date;
    archivedAt?: Date;
    tags: string[];
    metadata?: Record<string, any>;
    isPersistent: boolean;
    expiresAt?: Date;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification> & Notification & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
}>;
