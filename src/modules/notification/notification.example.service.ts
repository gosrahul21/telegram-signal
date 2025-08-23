import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationExampleService {
  private readonly logger = new Logger(NotificationExampleService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Example: Send RSI signal notification
   */
  async sendRSISignal(
    userId: string,
    symbol: string,
    rsiValue: number,
    action: 'BUY' | 'SELL',
  ) {
    const signalData = {
      symbol,
      type: action,
      price: await this.getCurrentPrice(symbol), // You would implement this
      rsi: rsiValue.toFixed(2),
      description: `RSI ${action === 'BUY' ? 'oversold' : 'overbought'} signal triggered`,
      confidence: this.calculateConfidence(rsiValue),
    };

    // Send via Telegram
    const telegramResult =
      await this.notificationService.sendSignalNotification(userId, signalData);

    // Send via WebSocket
    const websocketResult = this.notificationService.sendWebSocketMessage(
      userId,
      {
        type: 'signal',
        data: signalData,
        timestamp: Date.now(),
      },
    );

    // Broadcast to all users subscribed to this symbol
    this.notificationGateway.broadcastToSymbol(symbol, 'signal', signalData);

    this.logger.log(
      `RSI signal sent to user ${userId} for ${symbol}: Telegram=${telegramResult}, WebSocket=${websocketResult}`,
    );

    return { telegram: telegramResult, websocket: websocketResult };
  }

  /**
   * Example: Send price alert notification
   */
  async sendPriceAlert(
    userId: string,
    symbol: string,
    currentPrice: number,
    targetPrice: number,
    condition: string,
  ) {
    const alertData = {
      symbol,
      condition,
      price: currentPrice.toFixed(2),
      message: `Price ${condition} target ${targetPrice}. Current price: ${currentPrice}`,
    };

    // Send via Telegram
    const telegramResult = await this.notificationService.sendAlertNotification(
      userId,
      alertData,
    );

    // Send via WebSocket
    const websocketResult = this.notificationService.sendWebSocketMessage(
      userId,
      {
        type: 'alert',
        data: alertData,
        timestamp: Date.now(),
      },
    );

    this.logger.log(
      `Price alert sent to user ${userId} for ${symbol}: Telegram=${telegramResult}, WebSocket=${websocketResult}`,
    );

    return { telegram: telegramResult, websocket: websocketResult };
  }

  /**
   * Example: Send monitoring status update
   */
  async sendMonitoringStatus(
    userId: string,
    symbol: string,
    status: string,
    details: any,
  ) {
    const statusData = {
      symbol,
      status,
      price: await this.getCurrentPrice(symbol), // You would implement this
      details: JSON.stringify(details),
    };

    // Send via Telegram
    const telegramResult =
      await this.notificationService.sendStatusNotification(userId, statusData);

    // Send via WebSocket
    const websocketResult = this.notificationService.sendWebSocketMessage(
      userId,
      {
        type: 'status',
        data: statusData,
        timestamp: Date.now(),
      },
    );

    this.logger.log(
      `Status update sent to user ${userId} for ${symbol}: Telegram=${telegramResult}, WebSocket=${websocketResult}`,
    );

    return { telegram: telegramResult, websocket: websocketResult };
  }

  /**
   * Example: Send multi-channel notification
   */
  async sendMultiChannelNotification(
    userId: string,
    message: string,
    type: 'signal' | 'alert' | 'status' | 'general',
    data?: any,
  ) {
    const payload = {
      userId,
      message,
      type,
      data,
    };

    const result =
      await this.notificationService.sendMultiChannelNotification(payload);

    this.logger.log(
      `Multi-channel notification sent to user ${userId}: Telegram=${result.telegram}, WebSocket=${result.websocket}`,
    );

    return result;
  }

  /**
   * Example: Send bulk notifications to multiple users
   */
  async sendBulkSignalNotification(userIds: string[], signalData: any) {
    const message = this.formatSignalMessage(signalData);

    const result =
      await this.notificationService.sendTelegramNotificationToMultiple(
        userIds,
        message,
      );

    // Also broadcast via WebSocket to all connected users
    const websocketResult = this.notificationService.broadcastWebSocketMessage({
      type: 'signal',
      data: signalData,
      timestamp: Date.now(),
    });

    this.logger.log(
      `Bulk signal sent to ${userIds.length} users: Telegram success=${result.success.length}, failed=${result.failed.length}, WebSocket success=${websocketResult.success.length}, failed=${websocketResult.failed.length}`,
    );

    return { telegram: result, websocket: websocketResult };
  }

  /**
   * Example: Send system maintenance notification
   */
  async sendSystemMaintenanceNotification(
    message: string,
    maintenanceTime?: string,
  ) {
    const systemMessage = `🔧 SYSTEM MAINTENANCE 🔧\n\n${message}${maintenanceTime ? `\n\n⏰ Scheduled for: ${maintenanceTime}` : ''}`;

    // Get all connected user IDs
    const connectedUserIds = this.notificationService.getConnectedUserIds();

    if (connectedUserIds.length > 0) {
      // Send to all connected users via WebSocket
      const websocketResult =
        this.notificationService.broadcastWebSocketMessage({
          type: 'system',
          data: { message, maintenanceTime },
          timestamp: Date.now(),
        });

      this.logger.log(
        `System maintenance notification sent to ${connectedUserIds.length} connected users: success=${websocketResult.success.length}, failed=${websocketResult.failed.length}`,
      );

      return websocketResult;
    }

    return { success: [], failed: [] };
  }

  /**
   * Example: Get notification statistics
   */
  getNotificationStats() {
    return {
      connectedUsers: this.notificationService.getConnectedUsersCount(),
      connectedUserIds: this.notificationService.getConnectedUserIds(),
      websocketConnections: this.notificationGateway.getConnectedUsersCount(),
    };
  }

  // Helper methods (you would implement these based on your price API)
  private async getCurrentPrice(symbol: string): Promise<string> {
    // This would call your price API service
    // For now, return a placeholder
    return '45000.00';
  }

  private calculateConfidence(rsiValue: number): string {
    if (rsiValue <= 20 || rsiValue >= 80) return '95%';
    if (rsiValue <= 25 || rsiValue >= 75) return '85%';
    if (rsiValue <= 30 || rsiValue >= 70) return '75%';
    return '60%';
  }

  private formatSignalMessage(signalData: any): string {
    return `
🚨 <b>NEW SIGNAL ALERT</b> 🚨

📊 <b>Symbol:</b> ${signalData.symbol || 'N/A'}
📈 <b>Type:</b> ${signalData.type || 'N/A'}
💰 <b>Price:</b> ${signalData.price || 'N/A'}
📊 <b>RSI:</b> ${signalData.rsi || 'N/A'}
⏰ <b>Time:</b> ${new Date().toLocaleString()}

${signalData.description || ''}
    `.trim();
  }
}
