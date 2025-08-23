import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Notification event interfaces
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

// Notification event constants
export const NOTIFICATION_EVENTS = {
  ALERT_TRIGGERED: 'notification.alert_triggered',
  PRICE_TARGET: 'notification.price_target',
  TECHNICAL_INDICATOR: 'notification.technical_indicator',
  ORDER_STATUS: 'notification.order_status',
  MARKET_ALERT: 'notification.market_alert',
} as const;

export type NotificationEventName = typeof NOTIFICATION_EVENTS[keyof typeof NOTIFICATION_EVENTS];

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  // Emit alert triggered notification
  async emitAlertTriggered(alert: any, triggerData: any): Promise<void> {
    try {
      const event: AlertTriggeredNotificationEvent = {
        alert,
        triggerData,
        timestamp: new Date(),
        notificationType: 'alert_triggered',
      };

      this.eventEmitter.emit(NOTIFICATION_EVENTS.ALERT_TRIGGERED, event);
      
      this.logger.log(`Alert triggered notification emitted for ${alert.symbol} - ${alert.type}`);
      
      // Also emit a specific event for the alert type
      this.emitTechnicalIndicatorNotification(alert.symbol, alert.type, triggerData, 'triggered');
      
    } catch (error) {
      this.logger.error(`Error emitting alert triggered notification:`, error);
    }
  }

  // Emit price target notification
  async emitPriceTargetNotification(
    symbol: string,
    currentPrice: number,
    targetPrice: number,
    condition: string
  ): Promise<void> {
    try {
      const event: PriceTargetNotificationEvent = {
        symbol,
        currentPrice,
        targetPrice,
        condition,
        timestamp: new Date(),
        notificationType: 'price_target',
      };

      this.eventEmitter.emit(NOTIFICATION_EVENTS.PRICE_TARGET, event);
      
      this.logger.log(`Price target notification emitted for ${symbol}: ${condition} ${targetPrice} (current: ${currentPrice})`);
      
    } catch (error) {
      this.logger.error(`Error emitting price target notification:`, error);
    }
  }

  // Emit technical indicator notification
  async emitTechnicalIndicatorNotification(
    symbol: string,
    indicator: string,
    data: any,
    condition: string
  ): Promise<void> {
    try {
      let value: number;
      
      // Extract the main value based on indicator type
      switch (indicator) {
        case 'rsi':
          value = data.rsiData?.rsi || data.rsi || 0;
          break;
        case 'ema_crossover':
          value = data.emaData?.fastEMA || 0;
          break;
        case 'macd':
          value = data.macdData?.macd || 0;
          break;
        case 'bollinger_bands':
          value = data.bbData?.upperBand || data.currentPrice || 0;
          break;
        default:
          value = data.currentPrice || 0;
      }

      const event: TechnicalIndicatorNotificationEvent = {
        symbol,
        indicator,
        value,
        condition,
        timestamp: new Date(),
        notificationType: 'technical_indicator',
      };

      this.eventEmitter.emit(NOTIFICATION_EVENTS.TECHNICAL_INDICATOR, event);
      
      this.logger.log(`Technical indicator notification emitted for ${symbol} - ${indicator}: ${condition}`);
      
    } catch (error) {
      this.logger.error(`Error emitting technical indicator notification:`, error);
    }
  }

  // Emit order status notification
  async emitOrderStatusNotification(
    orderId: string,
    symbol: string,
    status: string,
    details: any
  ): Promise<void> {
    try {
      const event: OrderStatusNotificationEvent = {
        orderId,
        symbol,
        status,
        details,
        timestamp: new Date(),
        notificationType: 'order_status',
      };

      this.eventEmitter.emit(NOTIFICATION_EVENTS.ORDER_STATUS, event);
      
      this.logger.log(`Order status notification emitted for ${symbol} - ${status}`);
      
    } catch (error) {
      this.logger.error(`Error emitting order status notification:`, error);
    }
  }

  // Emit market alert notification
  async emitMarketAlertNotification(
    symbol: string,
    alertType: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    data: any
  ): Promise<void> {
    try {
      const event: MarketAlertNotificationEvent = {
        symbol,
        alertType,
        message,
        severity,
        data,
        timestamp: new Date(),
        notificationType: 'market_alert',
      };

      this.eventEmitter.emit(NOTIFICATION_EVENTS.MARKET_ALERT, event);
      
      this.logger.log(`Market alert notification emitted for ${symbol} - ${alertType} (${severity}): ${message}`);
      
    } catch (error) {
      this.logger.error(`Error emitting market alert notification:`, error);
    }
  }

  // Emit custom notification
  async emitCustomNotification(
    eventName: string,
    data: any
  ): Promise<void> {
    try {
      const event = {
        ...data,
        timestamp: new Date(),
      };

      this.eventEmitter.emit(eventName, event);
      
      this.logger.log(`Custom notification emitted: ${eventName}`);
      
    } catch (error) {
      this.logger.error(`Error emitting custom notification:`, error);
    }
  }

  // Batch notification emission
  async emitBatchNotifications(notifications: Array<{
    type: string;
    data: any;
  }>): Promise<void> {
    try {
      for (const notification of notifications) {
        switch (notification.type) {
          case 'alert_triggered':
            await this.emitAlertTriggered(notification.data.alert, notification.data.triggerData);
            break;
          case 'price_target':
            await this.emitPriceTargetNotification(
              notification.data.symbol,
              notification.data.currentPrice,
              notification.data.targetPrice,
              notification.data.condition
            );
            break;
          case 'technical_indicator':
            await this.emitTechnicalIndicatorNotification(
              notification.data.symbol,
              notification.data.indicator,
              notification.data.data,
              notification.data.condition
            );
            break;
          case 'order_status':
            await this.emitOrderStatusNotification(
              notification.data.orderId,
              notification.data.symbol,
              notification.data.status,
              notification.data.details
            );
            break;
          case 'market_alert':
            await this.emitMarketAlertNotification(
              notification.data.symbol,
              notification.data.alertType,
              notification.data.message,
              notification.data.severity,
              notification.data.data
            );
            break;
          default:
            await this.emitCustomNotification(notification.type, notification.data);
        }
      }
      
      this.logger.log(`Batch notifications emitted: ${notifications.length} notifications`);
      
    } catch (error) {
      this.logger.error(`Error emitting batch notifications:`, error);
    }
  }

  // Get notification statistics
  getNotificationStats(): {
    totalNotifications: number;
    notificationTypes: Record<string, number>;
    lastNotification: Date | null;
  } {
    // This is a placeholder - in a real implementation, you might want to track these stats
    return {
      totalNotifications: 0,
      notificationTypes: {},
      lastNotification: null,
    };
  }

  // Clear notification history (if implemented)
  clearNotificationHistory(): void {
    this.logger.log('Notification history cleared');
  }
}
