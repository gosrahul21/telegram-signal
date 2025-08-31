import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SocketService } from './socket.service';
import {
  AlertTriggeredNotificationEvent,
  PriceTargetNotificationEvent,
  TechnicalIndicatorNotificationEvent,
  OrderStatusNotificationEvent,
  MarketAlertNotificationEvent,
  NOTIFICATION_EVENTS,
} from '../monitoring/notification.service';

@Injectable()
export class SocketListenerService implements OnModuleInit {
  private readonly logger = new Logger(SocketListenerService.name);

  constructor(private readonly socketService: SocketService) {}

  onModuleInit() {
    this.logger.log('Socket listener service initialized');
  }

  // Listen to alert triggered events
  @OnEvent(NOTIFICATION_EVENTS.ALERT_TRIGGERED)
  async handleAlertTriggered(event: AlertTriggeredNotificationEvent) {
    try {
      const { alert, triggerData } = event;
      const userId = alert.userId;

      if (!userId) {
        this.logger.warn('Alert triggered but no userId found:', alert);
        return;
      }

      const socketMessage = {
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
      };

      // Send via WebSocket if user is connected
      const sent = this.socketService.emitToUser(
        userId,
        'alert_triggered',
        socketMessage,
      );

      if (sent) {
        this.logger.log(
          `Alert triggered notification sent to user ${userId} for ${alert.symbol}`,
        );
      } else {
        this.logger.warn(
          `User ${userId} not connected, alert notification not sent`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling alert triggered event:', error);
    }
  }

  // Listen to price target events
  @OnEvent(NOTIFICATION_EVENTS.PRICE_TARGET)
  async handlePriceTarget(event: PriceTargetNotificationEvent) {
    try {
      // For price target events, we need to determine which users to notify
      // This could be based on user preferences or active price alerts
      // For now, we'll broadcast to all connected users (you can modify this logic)

      const socketMessage = {
        type: 'price_target',
        data: {
          symbol: event.symbol,
          currentPrice: event.currentPrice,
          targetPrice: event.targetPrice,
          condition: event.condition,
          timestamp: event.timestamp,
        },
        message: `Price target ${event.condition} ${event.targetPrice} reached for ${event.symbol} (current: ${event.currentPrice})`,
      };

      // Broadcast to all connected users (you can modify this to target specific users)
      const sentCount = this.broadcastToAllUsers('price_target', socketMessage);

      this.logger.log(
        `Price target notification broadcasted to ${sentCount} users for ${event.symbol}`,
      );
    } catch (error) {
      this.logger.error('Error handling price target event:', error);
    }
  }

  // Listen to technical indicator events
  @OnEvent(NOTIFICATION_EVENTS.TECHNICAL_INDICATOR)
  async handleTechnicalIndicator(event: TechnicalIndicatorNotificationEvent) {
    try {
      const socketMessage = {
        type: 'technical_indicator',
        data: {
          symbol: event.symbol,
          indicator: event.indicator,
          value: event.value,
          condition: event.condition,
          timestamp: event.timestamp,
        },
        message: `${event.indicator.toUpperCase()} ${event.condition} for ${event.symbol}: ${event.value}`,
      };

      // Broadcast to all connected users (you can modify this to target specific users)
      const sentCount = this.broadcastToAllUsers(
        'technical_indicator',
        socketMessage,
      );

      this.logger.log(
        `Technical indicator notification broadcasted to ${sentCount} users for ${event.symbol} - ${event.indicator}`,
      );
    } catch (error) {
      this.logger.error('Error handling technical indicator event:', error);
    }
  }

  // Listen to order status events
  @OnEvent(NOTIFICATION_EVENTS.ORDER_STATUS)
  async handleOrderStatus(event: OrderStatusNotificationEvent) {
    try {
      // For order status events, we need to determine which user to notify
      // This would typically come from the order data
      // For now, we'll broadcast to all users (you can modify this logic)

      const socketMessage = {
        type: 'order_status',
        data: {
          orderId: event.orderId,
          symbol: event.symbol,
          status: event.status,
          details: event.details,
          timestamp: event.timestamp,
        },
        message: `Order ${event.orderId} status: ${event.status} for ${event.symbol}`,
      };

      // Broadcast to all connected users (you can modify this to target specific users)
      const sentCount = this.broadcastToAllUsers('order_status', socketMessage);

      this.logger.log(
        `Order status notification broadcasted to ${sentCount} users for ${event.symbol} - ${event.status}`,
      );
    } catch (error) {
      this.logger.error('Error handling order status event:', error);
    }
  }

  // Listen to market alert events
  @OnEvent(NOTIFICATION_EVENTS.MARKET_ALERT)
  async handleMarketAlert(event: MarketAlertNotificationEvent) {
    try {
      const socketMessage = {
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
      };

      // Broadcast to all connected users (you can modify this to target specific users)
      const sentCount = this.broadcastToAllUsers('market_alert', socketMessage);

      this.logger.log(
        `Market alert notification broadcasted to ${sentCount} users for ${event.symbol} - ${event.severity}`,
      );
    } catch (error) {
      this.logger.error('Error handling market alert event:', error);
    }
  }

  // Helper method to broadcast to all connected users
  private broadcastToAllUsers(event: string, data: any): number {
    // This is a simplified broadcast - in production, you might want to:
    // 1. Filter users based on preferences
    // 2. Check user permissions
    // 3. Rate limit notifications
    // 4. Group users by interests

    return this.socketService.broadcastToAll(event, data);
  }

  // Method to send monitoring status updates
  async sendMonitoringStatusUpdate(userId: string, status: any) {
    try {
      const socketMessage = {
        type: 'monitoring_status',
        data: status,
        timestamp: new Date(),
      };

      const sent = this.socketService.emitToUser(
        userId,
        'monitoring_status',
        socketMessage,
      );

      if (sent) {
        this.logger.log(`Monitoring status sent to user ${userId}`);
      } else {
        this.logger.warn(
          `User ${userId} not connected, monitoring status not sent`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending monitoring status to user ${userId}:`,
        error,
      );
    }
  }

  // Method to send alert monitoring updates
  async sendAlertMonitoringUpdate(
    userId: string,
    alertId: string,
    status: string,
    data?: any,
  ) {
    try {
      const socketMessage = {
        type: 'alert_monitoring_update',
        data: {
          alertId,
          status,
          data,
          timestamp: new Date(),
        },
        message: `Alert ${alertId} monitoring status: ${status}`,
      };

      const sent = this.socketService.emitToUser(
        userId,
        'alert_monitoring_update',
        socketMessage,
      );

      if (sent) {
        this.logger.log(
          `Alert monitoring update sent to user ${userId} for alert ${alertId}`,
        );
      } else {
        this.logger.warn(
          `User ${userId} not connected, alert monitoring update not sent`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending alert monitoring update to user ${userId}:`,
        error,
      );
    }
  }
}
