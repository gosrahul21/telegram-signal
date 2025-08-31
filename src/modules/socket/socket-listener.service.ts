import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SocketService } from './socket.service';
import {
  // AlertTriggeredNotificationEvent,
  // PriceTargetNotificationEvent,
  // TechnicalIndicatorNotificationEvent,
  // OrderStatusNotificationEvent,
  // MarketAlertNotificationEvent,
  // NOTIFICATION_EVENTS,
} from '../monitoring/alert-listener.service';
import { EventsType } from '@/utils/constants/eventsType';

@Injectable()
export class SocketListenerService implements OnModuleInit {
  private readonly logger = new Logger(SocketListenerService.name);

  constructor(private readonly socketService: SocketService) {}

  onModuleInit() {
    this.logger.log('Socket listener service initialized');
  }

  // Listen to alert triggered events
  @OnEvent(EventsType.ALERT_TRIGGERED_USER)
  async handleAlertTriggered(event: any) {
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
