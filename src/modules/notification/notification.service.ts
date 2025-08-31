import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Notification, NotificationDocument, NotificationType, NotificationPriority } from './notification.entity';
import { EventsType } from '@/utils/constants/eventsType';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new notification and emit event
   */
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = new this.notificationModel({
      ...data,
      userId: new Types.ObjectId(data.userId),
    });

    const savedNotification = await notification.save();

    this.logger.log(`Notification created for user ${savedNotification.userId}`);

    // Emit notification created event
    this.eventEmitter.emit(EventsType.NOTIFICATION_CREATED, {
      ...savedNotification.toObject(),
      timestamp: new Date(),
    });

    return savedNotification;
  }

  /**
   * Listener for user alerts
   */
  @OnEvent(EventsType.ALERT_TRIGGERED_USER, { async: true })
  async handleUserAlert(payload: any) {
    this.logger.log(`Creating USER notification: ${JSON.stringify(payload)}`);

    await this.createNotification({
      userId: payload.userId,
      type: NotificationType.ALERT_TRIGGERED,
      priority: NotificationPriority.HIGH,
      title: `Alert triggered for ${payload.symbol}`,
      message: `Your alert (${payload.eventType}) was triggered on ${payload.symbol} (${payload.timeframe}).`,
      data: payload,
      symbol: payload.symbol,
      timeframe: payload.timeframe,
      eventType: payload.eventType,
      alertId: payload.alertId,
    });
  }

  /**
   * Listener for order alerts
   */
  @OnEvent(EventsType.ALERT_TRIGGERED_ORDER, { async: true })
  async handleOrderAlert(payload: any) {
    this.logger.log(`Creating ORDER notification: ${JSON.stringify(payload)}`);

    await this.createNotification({
      userId: payload.userId,
      type: NotificationType.ORDER_STATUS,
      priority: NotificationPriority.MEDIUM,
      title: `Order update`,
      message: `Your order alert (${payload.eventType}) was triggered for ${payload.symbol}.`,
      data: payload,
      symbol: payload.symbol,
      timeframe: payload.timeframe,
      eventType: payload.eventType,
      alertId: payload.alertId,
    });
  }

  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification> {
    return await this.notificationModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }
}
