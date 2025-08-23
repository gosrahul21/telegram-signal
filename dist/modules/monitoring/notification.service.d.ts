import { EventEmitter2 } from '@nestjs/event-emitter';
export interface AlertTriggeredNotificationEvent {
    alert: any;
    triggerData: any;
    timestamp: Date;
    notificationType: 'alert_triggered';
}
export interface PriceTargetNotificationEvent {
    symbol: string;
    currentPrice: number;
    targetPrice: number;
    condition: string;
    timestamp: Date;
    notificationType: 'price_target';
}
export interface TechnicalIndicatorNotificationEvent {
    symbol: string;
    indicator: string;
    value: number;
    condition: string;
    timestamp: Date;
    notificationType: 'technical_indicator';
}
export interface OrderStatusNotificationEvent {
    orderId: string;
    symbol: string;
    status: string;
    details: any;
    timestamp: Date;
    notificationType: 'order_status';
}
export interface MarketAlertNotificationEvent {
    symbol: string;
    alertType: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    data: any;
    timestamp: Date;
    notificationType: 'market_alert';
}
export declare const NOTIFICATION_EVENTS: {
    readonly ALERT_TRIGGERED: "notification.alert_triggered";
    readonly PRICE_TARGET: "notification.price_target";
    readonly TECHNICAL_INDICATOR: "notification.technical_indicator";
    readonly ORDER_STATUS: "notification.order_status";
    readonly MARKET_ALERT: "notification.market_alert";
};
export type NotificationEventName = typeof NOTIFICATION_EVENTS[keyof typeof NOTIFICATION_EVENTS];
export declare class NotificationService {
    private eventEmitter;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2);
    emitAlertTriggered(alert: any, triggerData: any): Promise<void>;
    emitPriceTargetNotification(symbol: string, currentPrice: number, targetPrice: number, condition: string): Promise<void>;
    emitTechnicalIndicatorNotification(symbol: string, indicator: string, data: any, condition: string): Promise<void>;
    emitOrderStatusNotification(orderId: string, symbol: string, status: string, details: any): Promise<void>;
    emitMarketAlertNotification(symbol: string, alertType: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical', data: any): Promise<void>;
    emitCustomNotification(eventName: string, data: any): Promise<void>;
    emitBatchNotifications(notifications: Array<{
        type: string;
        data: any;
    }>): Promise<void>;
    getNotificationStats(): {
        totalNotifications: number;
        notificationTypes: Record<string, number>;
        lastNotification: Date | null;
    };
    clearNotificationHistory(): void;
}
