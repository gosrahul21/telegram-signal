import { Injectable, Logger } from "@nestjs/common";
import { BotService } from "../../bot/bot.service";
import { Bot } from "grammy";

export interface NotificationPayload {
  userId: string;
  message: string;
  type?: 'signal' | 'alert' | 'status' | 'general';
  data?: any;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private connectedUsers: Map<string, any> = new Map(); // Store WebSocket connections
  private bot: Bot;

  constructor(private readonly botService: BotService) {
    this.bot = this.botService.getBot();
  }

  /**
   * Send Telegram notification to a specific user
   */
  async sendTelegramNotification(userId: string, message: string): Promise<boolean> {
    try {
      await this.bot.api.sendMessage(userId, message, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      });
      
      this.logger.log(`Telegram notification sent to user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send Telegram notification to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send Telegram notification to multiple users
   */
  async sendTelegramNotificationToMultiple(userIds: string[], message: string): Promise<{ success: string[], failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const userId of userIds) {
      try {
        await this.bot.api.sendMessage(userId, message, {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
        });
        success.push(userId);
      } catch (error) {
        this.logger.error(`Failed to send Telegram notification to user ${userId}:`, error);
        failed.push(userId);
      }
    }

    this.logger.log(`Sent notifications to ${success.length} users, failed for ${failed.length} users`);
    return { success, failed };
  }

  /**
   * Send signal notification with formatted message
   */
  async sendSignalNotification(userId: string, signalData: any): Promise<boolean> {
    const message = this.formatSignalMessage(signalData);
    return this.sendTelegramNotification(userId, message);
  }

  /**
   * Send alert notification
   */
  async sendAlertNotification(userId: string, alertData: any): Promise<boolean> {
    const message = this.formatAlertMessage(alertData);
    return this.sendTelegramNotification(userId, message);
  }

  /**
   * Send status update notification
   */
  async sendStatusNotification(userId: string, statusData: any): Promise<boolean> {
    const message = this.formatStatusMessage(statusData);
    return this.sendTelegramNotification(userId, message);
  }

  /**
   * WebSocket connection management
   */
  addWebSocketConnection(userId: string, connection: any): void {
    this.connectedUsers.set(userId, connection);
    this.logger.log(`WebSocket connection added for user ${userId}`);
  }

  removeWebSocketConnection(userId: string): void {
    this.connectedUsers.delete(userId);
    this.logger.log(`WebSocket connection removed for user ${userId}`);
  }

  /**
   * Send WebSocket message to a specific user
   */
  sendWebSocketMessage(userId: string, message: WebSocketMessage): boolean {
    const connection = this.connectedUsers.get(userId);
    if (connection) {
      try {
        connection.send(JSON.stringify(message));
        this.logger.log(`WebSocket message sent to user ${userId}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send WebSocket message to user ${userId}:`, error);
        this.removeWebSocketConnection(userId);
        return false;
      }
    }
    return false;
  }

  /**
   * Send WebSocket message to all connected users
   */
  broadcastWebSocketMessage(message: WebSocketMessage): { success: string[], failed: string[] } {
    const success: string[] = [];
    const failed: string[] = [];

    for (const [userId, connection] of this.connectedUsers.entries()) {
      try {
        connection.send(JSON.stringify(message));
        success.push(userId);
      } catch (error) {
        this.logger.error(`Failed to send WebSocket message to user ${userId}:`, error);
        failed.push(userId);
        this.removeWebSocketConnection(userId);
      }
    }

    this.logger.log(`Broadcasted WebSocket message to ${success.length} users, failed for ${failed.length} users`);
    return { success, failed };
  }

  /**
   * Send notification through both Telegram and WebSocket
   */
  async sendMultiChannelNotification(payload: NotificationPayload): Promise<{
    telegram: boolean;
    websocket: boolean;
  }> {
    const [telegramResult, websocketResult] = await Promise.allSettled([
      this.sendTelegramNotification(payload.userId, payload.message),
      this.sendWebSocketMessage(payload.userId, {
        type: payload.type || 'general',
        data: payload.data || payload.message,
        timestamp: Date.now(),
      })
    ]);

    return {
      telegram: telegramResult.status === 'fulfilled' ? telegramResult.value : false,
      websocket: websocketResult.status === 'fulfilled' ? websocketResult.value : false,
    };
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get list of connected user IDs
   */
  getConnectedUserIds(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Private helper methods for message formatting
   */
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

  private formatAlertMessage(alertData: any): string {
    return `
⚠️ <b>ALERT</b> ⚠️

📊 <b>Symbol:</b> ${alertData.symbol || 'N/A'}
🔔 <b>Condition:</b> ${alertData.condition || 'N/A'}
💰 <b>Current Price:</b> ${alertData.price || 'N/A'}
⏰ <b>Time:</b> ${new Date().toLocaleString()}

${alertData.message || ''}
    `.trim();
  }

  private formatStatusMessage(statusData: any): string {
    return `
📊 <b>STATUS UPDATE</b> 📊

📈 <b>Symbol:</b> ${statusData.symbol || 'N/A'}
📊 <b>Status:</b> ${statusData.status || 'N/A'}
💰 <b>Price:</b> ${statusData.price || 'N/A'}
⏰ <b>Time:</b> ${new Date().toLocaleString()}

${statusData.details || ''}
    `.trim();
  }
}