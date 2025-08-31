import { Injectable } from '@nestjs/common';
import { NotificationType, NotificationPriority } from './notification.entity';
import {
  AlertTriggeredNotificationEvent,
  PriceTargetNotificationEvent,
  TechnicalIndicatorNotificationEvent,
  OrderStatusNotificationEvent,
  MarketAlertNotificationEvent,
} from '../monitoring/notification.service';

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

@Injectable()
export class NotificationFormatterService {
  /**
   * Format alert triggered notification for database storage
   */
  formatAlertTriggeredForDatabase(
    event: AlertTriggeredNotificationEvent,
  ): FormattedNotification {
    const { alert, triggerData } = event;

    return {
      type: NotificationType.ALERT_TRIGGERED,
      title: `Alert Triggered: ${alert.symbol}`,
      message: `Alert triggered for ${alert.symbol} - ${alert.eventType}`,
      data: {
        alertId: alert.uuid,
        symbol: alert.symbol,
        timeframe: alert.timeframe,
        eventType: alert.eventType,
        remainingCount: alert.count,
        triggerData,
        timestamp: event.timestamp,
      },
      priority: NotificationPriority.HIGH,
      tags: ['alert', 'triggered', alert.symbol, alert.eventType],
      isPersistent: true, // Keep alert notifications persistent
    };
  }

  /**
   * Format alert triggered notification for WebSocket delivery
   */
  formatAlertTriggeredForSocket(
    event: AlertTriggeredNotificationEvent,
  ): FormattedSocketMessage {
    const { alert, triggerData } = event;

    return {
      type: 'alert_triggered',
      data: {
        alertId: alert.uuid,
        symbol: alert.symbol,
        timeframe: alert.timeframe,
        eventType: alert.eventType,
        remainingCount: alert.count,
        triggerData,
        timestamp: event.timestamp,
      },
      message: `Alert triggered for ${alert.symbol} - ${alert.eventType}`,
      timestamp: event.timestamp,
    };
  }

  /**
   * Format price target notification for database storage
   */
  formatPriceTargetForDatabase(
    event: PriceTargetNotificationEvent,
  ): FormattedNotification {
    return {
      type: NotificationType.PRICE_TARGET,
      title: `Price Target: ${event.symbol}`,
      message: `Price target ${event.condition} ${event.targetPrice} reached for ${event.symbol}`,
      data: {
        symbol: event.symbol,
        currentPrice: event.currentPrice,
        targetPrice: event.targetPrice,
        condition: event.condition,
        timestamp: event.timestamp,
      },
      priority: NotificationPriority.MEDIUM,
      tags: ['price', 'target', event.symbol, event.condition],
      isPersistent: false, // Price targets might not need to be persistent
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expire after 24 hours
    };
  }

  /**
   * Format price target notification for WebSocket delivery
   */
  formatPriceTargetForSocket(
    event: PriceTargetNotificationEvent,
  ): FormattedSocketMessage {
    return {
      type: 'price_target',
      data: {
        symbol: event.symbol,
        currentPrice: event.currentPrice,
        targetPrice: event.targetPrice,
        condition: event.condition,
        timestamp: event.timestamp,
      },
      message: `Price target ${event.condition} ${event.targetPrice} reached for ${event.symbol} (current: ${event.currentPrice})`,
      timestamp: event.timestamp,
    };
  }

  /**
   * Format technical indicator notification for database storage
   */
  formatTechnicalIndicatorForDatabase(
    event: TechnicalIndicatorNotificationEvent,
  ): FormattedNotification {
    return {
      type: NotificationType.TECHNICAL_INDICATOR,
      title: `${event.indicator.toUpperCase()}: ${event.symbol}`,
      message: `${event.indicator.toUpperCase()} ${event.condition} for ${event.symbol}: ${event.value}`,
      data: {
        symbol: event.symbol,
        indicator: event.indicator,
        value: event.value,
        condition: event.condition,
        timestamp: event.timestamp,
      },
      priority: NotificationPriority.MEDIUM,
      tags: ['technical', 'indicator', event.indicator, event.symbol],
      isPersistent: false,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // Expire after 12 hours
    };
  }

  /**
   * Format technical indicator notification for WebSocket delivery
   */
  formatTechnicalIndicatorForSocket(
    event: TechnicalIndicatorNotificationEvent,
  ): FormattedSocketMessage {
    return {
      type: 'technical_indicator',
      data: {
        symbol: event.symbol,
        indicator: event.indicator,
        value: event.value,
        condition: event.condition,
        timestamp: event.timestamp,
      },
      message: `${event.indicator.toUpperCase()} ${event.condition} for ${event.symbol}: ${event.value}`,
      timestamp: event.timestamp,
    };
  }

  /**
   * Format order status notification for database storage
   */
  formatOrderStatusForDatabase(
    event: OrderStatusNotificationEvent,
  ): FormattedNotification {
    return {
      type: NotificationType.ORDER_STATUS,
      title: `Order Update: ${event.symbol}`,
      message: `Order ${event.orderId} status: ${event.status} for ${event.symbol}`,
      data: {
        orderId: event.orderId,
        symbol: event.symbol,
        status: event.status,
        details: event.details,
        timestamp: event.timestamp,
      },
      priority: NotificationPriority.HIGH,
      tags: ['order', 'status', event.symbol, event.status],
      isPersistent: true, // Order status updates should be persistent
    };
  }

  /**
   * Format order status notification for WebSocket delivery
   */
  formatOrderStatusForSocket(
    event: OrderStatusNotificationEvent,
  ): FormattedSocketMessage {
    return {
      type: 'order_status',
      data: {
        orderId: event.orderId,
        symbol: event.symbol,
        status: event.status,
        details: event.details,
        timestamp: event.timestamp,
      },
      message: `Order ${event.orderId} status: ${event.status} for ${event.symbol}`,
      timestamp: event.timestamp,
    };
  }

  /**
   * Format market alert notification for database storage
   */
  formatMarketAlertForDatabase(
    event: MarketAlertNotificationEvent,
  ): FormattedNotification {
    const priority = this.getPriorityFromSeverity(event.severity);

    return {
      type: NotificationType.MARKET_ALERT,
      title: `Market Alert: ${event.symbol}`,
      message: event.message,
      data: {
        symbol: event.symbol,
        alertType: event.alertType,
        message: event.message,
        severity: event.severity,
        data: event.data,
        timestamp: event.timestamp,
      },
      priority,
      tags: ['market', 'alert', event.symbol, event.severity],
      isPersistent: true, // Market alerts should be persistent
    };
  }

  /**
   * Format market alert notification for WebSocket delivery
   */
  formatMarketAlertForSocket(
    event: MarketAlertNotificationEvent,
  ): FormattedSocketMessage {
    return {
      type: 'market_alert',
      data: {
        symbol: event.symbol,
        alertType: event.alertType,
        message: event.message,
        severity: event.severity,
        data: event.data,
        timestamp: event.timestamp,
      },
      message: event.message,
      timestamp: event.timestamp,
    };
  }

  /**
   * Helper method to convert severity to priority
   */
  private getPriorityFromSeverity(severity: string): NotificationPriority {
    switch (severity.toLowerCase()) {
      case 'critical':
        return NotificationPriority.CRITICAL;
      case 'high':
        return NotificationPriority.HIGH;
      case 'medium':
        return NotificationPriority.MEDIUM;
      case 'low':
        return NotificationPriority.LOW;
      default:
        return NotificationPriority.MEDIUM;
    }
  }

  /**
   * Get notification type from event type (removes 'notification.' prefix)
   */
  getNotificationTypeFromEvent(eventType: string): NotificationType {
    // Remove 'notification.' prefix if present
    const cleanType = eventType.replace('notification.', '');

    switch (cleanType) {
      case 'alert_triggered':
        return NotificationType.ALERT_TRIGGERED;
      case 'price_target':
        return NotificationType.PRICE_TARGET;
      case 'technical_indicator':
        return NotificationType.TECHNICAL_INDICATOR;
      case 'order_status':
        return NotificationType.ORDER_STATUS;
      case 'market_alert':
        return NotificationType.MARKET_ALERT;
      default:
        return NotificationType.GENERAL;
    }
  }
}
