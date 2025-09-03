import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventsType } from '@/utils/constants/eventsType';
import { BotService } from './bot.service';
import { UserService } from '../user/user.service';
import { MonitorEventType } from '../alert';
import { NotificationType } from '../notification/notification.entity';

@Injectable()
export class BotNotificationListenerService {
  private readonly logger = new Logger(BotNotificationListenerService.name);

  constructor(
    private readonly botService: BotService,
    private readonly userService: UserService,
  ) {}

  /**
   * Handle notification.created and send via Telegram
   */
  @OnEvent(EventsType.NOTIFICATION_CREATED, { async: true })
  async handleNotificationCreated(payload: any) {
    this.logger.log(`Bot received notification for user ${payload.userId}`);

    try {
      // Get user by userId
      const user = await this.userService.findById(payload.userId);
      if (!user || !user.telegramId) {
        this.logger.warn(`User ${payload.userId} not found or no telegramId`);
        return;
      }

      // Format message based on notification type
      const message = this.formatNotificationMessage(payload);

      // Send via Telegram using telegramId as chatId
      await this.botService.sendMessage(user.telegramId.toString(), message);

      this.logger.log(
        `Telegram notification sent to user ${payload.userId} (telegramId: ${user.telegramId})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send Telegram notification to user ${payload.userId}:`,
        error,
      );
    }
  }

  /**
   * Format notification message based on type
   */
  private formatNotificationMessage(payload: any): string {
    const { title, message, type, priority, symbol, data } = payload;

    // Match notification type and format accordingly
    switch (type) {
      case NotificationType.ALERT_TRIGGERED:
        return this.formatAlertMessage(payload);
      case NotificationType.ORDER_STATUS:
        return this.formatOrderUpdateMessage(payload);
      case NotificationType.PRICE_TARGET:
        return this.formatPriceTargetMessage(payload);
      case NotificationType.TECHNICAL_INDICATOR:
        return this.formatTechnicalIndicatorMessage(payload);
      case NotificationType.MARKET_ALERT:
        return this.formatMarketAlertMessage(payload);
      default:
        return this.formatGeneralNotificationMessage(payload);
    }
  }

  /**
   * Format general notification message
   */
  private formatGeneralNotificationMessage(payload: any): string {
    const { title, message, type, priority, symbol, data } = payload;

    let emoji = '📢';
    if (priority === 'high') emoji = '🚨';
    else if (priority === 'medium') emoji = '⚠️';
    else if (priority === 'low') emoji = 'ℹ️';

    let formattedMessage = `${emoji} <b>${title}</b>\n\n`;
    formattedMessage += `${message}\n\n`;

    if (symbol) {
      formattedMessage += `📊 <b>Symbol:</b> ${symbol}\n`;
    }

    if (data && data.price) {
      formattedMessage += `💰 <b>Price:</b> $${data.price}\n`;
    }

    if (data && data.rsi) {
      formattedMessage += `📈 <b>RSI:</b> ${data.rsi}\n`;
    }

    formattedMessage += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

    return formattedMessage;
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(payload: any): string {
    // userId: payload.userId,
    // type: NotificationType.ALERT_TRIGGERED,
    // priority: NotificationPriority.HIGH,
    // title: `Alert triggered for ${payload.symbol}`,
    // message: `Your alert (${payload.eventType}) was triggered on ${payload.symbol} (${payload.timeframe}).`,
    // data: payload,
    // symbol: payload.symbol,
    // timeframe: payload.timeframe,
    // eventType: payload.eventType,
    // alertId: payload.alertId,
    console.log('formatAlertMessage payload', payload);
    const {
      type,
      data: { symbol, eventType, timeframe, alertId },
    } = payload;

    let emoji = '🚨';
    let signal = 'ALERT';

    if (
      [
        MonitorEventType.BOLLINGER_BANDS_HIGH,
        MonitorEventType.RSI_CROSSOVER_HIGH,
        MonitorEventType.MACD_CROSSOVER_HIGH,
      ].includes(eventType as MonitorEventType)
    ) {
      emoji = '🔴';
      signal = 'SELL SIGNAL';
    } else if (
      [
        MonitorEventType.BOLLINGER_BANDS_LOW,
        MonitorEventType.RSI_LOW,
        MonitorEventType.MACD_CROSSOVER_LOW,
      ].includes(eventType as MonitorEventType)
    ) {
      emoji = '🟢';
      signal = 'BUY SIGNAL';
    } else if (eventType.includes('BREAKOUT')) {
      emoji = '🚀';
      signal = 'BREAKOUT';
    } else if (eventType.includes('REVERSAL')) {
      emoji = '🔄';
      signal = 'REVERSAL';
    }

    let message = `${emoji} <b>${signal} - ${symbol}</b>\n\n`;
    message += `🎯 <b>Alert Type:</b> ${eventType}\n`;
    message += `⏱️ <b>Timeframe:</b> ${timeframe || 'N/A'}\n`;
    if (alertId) {
      message += `🆔 <b>Alert ID:</b> ${alertId}\n`;
    }
    message += `\n`;

    if (payload.price) {
      message += `💰 <b>Current Price:</b> $${payload.price}\n`;
    }

    if (payload.rsi) {
      message += `📈 <b>RSI:</b> ${payload.rsi}\n`;
    }

    if (payload.volume) {
      message += `📊 <b>Volume:</b> ${payload.volume.toLocaleString()}\n`;
    }

    message += `\n⏰ <b>Time:</b> ${new Date().toLocaleString()}\n\n`;
    message += `⚠️ <i>This is an automated alert. Please do your own research before trading.</i>`;

    return message;
  }

  /**
   * Format order update message
   */
  private formatOrderUpdateMessage(payload: any): string {
    const { orderId, symbol, status, side, quantity, price } = payload;

    let emoji = '📋';
    if (status === 'filled') emoji = '✅';
    else if (status === 'cancelled') emoji = '❌';
    else if (status === 'pending') emoji = '⏳';
    else if (status === 'partially_filled') emoji = '🔄';

    let message = `${emoji} <b>Order Update - ${symbol}</b>\n\n`;
    message += `🆔 <b>Order ID:</b> ${orderId}\n`;
    message += `📊 <b>Status:</b> ${status.toUpperCase()}\n`;
    message += `📈 <b>Side:</b> ${side.toUpperCase()}\n`;
    message += `📦 <b>Quantity:</b> ${quantity}\n`;
    message += `💰 <b>Price:</b> $${price}\n`;
    message += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

    return message;
  }

  /**
   * Format order alert message
   */
  private formatOrderAlertMessage(payload: any): string {
    const { symbol, eventType, timeframe, alertId } = payload;

    let emoji = '📋';
    let alertType = 'ORDER ALERT';

    if (eventType.includes('FILLED')) {
      emoji = '✅';
      alertType = 'ORDER FILLED';
    } else if (eventType.includes('CANCELLED')) {
      emoji = '❌';
      alertType = 'ORDER CANCELLED';
    } else if (eventType.includes('PARTIAL')) {
      emoji = '🔄';
      alertType = 'PARTIAL FILL';
    }

    let message = `${emoji} <b>${alertType} - ${symbol}</b>\n\n`;
    message += `🎯 <b>Event:</b> ${eventType}\n`;
    message += `⏱️ <b>Timeframe:</b> ${timeframe || 'N/A'}\n`;
    if (alertId) {
      message += `🆔 <b>Alert ID:</b> ${alertId}\n`;
    }
    message += `\n`;

    if (payload.price) {
      message += `💰 <b>Price:</b> $${payload.price}\n`;
    }

    if (payload.quantity) {
      message += `📦 <b>Quantity:</b> ${payload.quantity}\n`;
    }

    message += `\n⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

    return message;
  }

  /**
   * Format price target message
   */
  private formatPriceTargetMessage(payload: any): string {
    const { symbol, data } = payload;

    let emoji = '🎯';
    if (data && data.direction === 'above') emoji = '📈';
    else if (data && data.direction === 'below') emoji = '📉';

    let message = `${emoji} <b>Price Target - ${symbol}</b>\n\n`;
    message += `🎯 <b>Target:</b> $${data?.targetPrice || 'N/A'}\n`;
    message += `📊 <b>Current:</b> $${data?.currentPrice || 'N/A'}\n`;
    message += `📈 <b>Direction:</b> ${data?.direction?.toUpperCase() || 'N/A'}\n`;
    message += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

    return message;
  }

  /**
   * Format technical indicator message
   */
  private formatTechnicalIndicatorMessage(payload: any): string {
    const { symbol, data } = payload;

    let emoji = '📊';
    if (data && data.signal === 'BUY') emoji = '🟢';
    else if (data && data.signal === 'SELL') emoji = '🔴';

    let message = `${emoji} <b>Technical Signal - ${symbol}</b>\n\n`;
    message += `📊 <b>Indicator:</b> ${data?.indicator || 'N/A'}\n`;
    message += `🎯 <b>Signal:</b> ${data?.signal || 'N/A'}\n`;
    message += `💰 <b>Price:</b> $${data?.price || 'N/A'}\n`;
    if (data?.value) {
      message += `📈 <b>Value:</b> ${data.value}\n`;
    }
    message += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

    return message;
  }

  /**
   * Format market alert message
   */
  private formatMarketAlertMessage(payload: any): string {
    const { title, message: alertMessage, data } = payload;

    let emoji = '🌍';
    if (data && data.severity === 'high') emoji = '🚨';
    else if (data && data.severity === 'medium') emoji = '⚠️';

    let formattedMessage = `${emoji} <b>Market Alert</b>\n\n`;
    formattedMessage += `<b>${title}</b>\n\n`;
    formattedMessage += `${alertMessage}\n\n`;

    if (data && data.affectedSymbols) {
      formattedMessage += `📊 <b>Affected:</b> ${data.affectedSymbols.join(', ')}\n`;
    }

    formattedMessage += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

    return formattedMessage;
  }

  /**
   * Send custom message to user via Telegram
   */
  async sendCustomMessage(userId: string, message: string): Promise<boolean> {
    try {
      const user = await this.userService.findById(userId);
      if (!user || !user.telegramId) {
        this.logger.warn(`User ${userId} not found or no telegramId`);
        return false;
      }

      await this.botService.sendMessage(user.telegramId.toString(), message);
      this.logger.log(
        `Custom Telegram message sent to user ${userId} (telegramId: ${user.telegramId})`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send custom Telegram message to user ${userId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Send bulk messages to multiple users
   */
  async sendBulkMessages(
    userIds: string[],
    message: string,
  ): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      try {
        const success = await this.sendCustomMessage(userId, message);
        if (success) {
          sent++;
        } else {
          failed++;
          errors.push(`Failed to send to user ${userId}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error sending to user ${userId}: ${error.message}`);
      }
    }

    this.logger.log(`Bulk Telegram messages: ${sent} sent, ${failed} failed`);
    return { sent, failed, errors };
  }
}
