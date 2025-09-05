import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  Notification,
  NotificationDocument,
  NotificationType,
  NotificationPriority,
} from './notification.entity';
import { EventsType } from '@/utils/constants/eventsType';
import {
  AlertTriggeredUserPayload,
  AlertTriggeredOrderPayload,
} from '../alert/types';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new notification and emit event
   */
  async createNotification(
    data: Omit<Partial<Notification>, 'userId'> & {
      userId: string | Types.ObjectId;
    },
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      ...data,
      userId: new Types.ObjectId(data.userId),
    });

    const savedNotification = await notification.save();

    this.logger.log(
      `Notification created for user ${savedNotification.userId}`,
    );

    // Emit notification created event

    this.emitNotification({ ...savedNotification.toObject() });
    return savedNotification;
  }

  emitNotification(payload: any) {
    this.eventEmitter.emit(EventsType.NOTIFICATION_CREATED, payload);
  }

  /**
   * Listener for user alerts
   */
  @OnEvent(EventsType.ALERT_TRIGGERED_USER, { async: true })
  async handleUserAlert(payload: AlertTriggeredUserPayload) {
    this.logger.log(`Creating USER notification: ${JSON.stringify(payload)}`);

    const { monitoring, alertId, userId, count } = payload;
    const { symbol, timeframe, eventType } = monitoring;

    await this.createNotification({
      userId: userId.toString(),
      type: NotificationType.ALERT_TRIGGERED,
      priority: NotificationPriority.HIGH,
      title: `Alert triggered for ${symbol}`,
      message: `Your alert (${eventType}) was triggered on ${symbol} (${timeframe}).`,
      data: payload,
      symbol,
      timeframe,
      eventType,
      alertId,
    });
  }

  /**
   * Listener for order alerts
   */
  @OnEvent(EventsType.ALERT_TRIGGERED_ORDER, { async: true })
  async handleOrderAlert(payload: AlertTriggeredOrderPayload) {
    this.logger.log(`Creating ORDER notification: ${JSON.stringify(payload)}`);

    const { monitoring, alertId, userId, count, orderId } = payload;
    const { symbol, timeframe, eventType } = monitoring;

    await this.createNotification({
      userId: userId.toString(),
      type: NotificationType.ORDER_STATUS,
      priority: NotificationPriority.MEDIUM,
      title: `Order update`,
      message: `Your order alert (${eventType}) was triggered for ${symbol}.`,
      data: payload,
      symbol,
      timeframe,
      eventType,
      alertId,
    });
  }

  async updateNotification(
    id: string,
    data: Partial<Notification>,
  ): Promise<Notification> {
    return await this.notificationModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean();
  }

  /**
   * Get notifications for a user with pagination and filtering
   */
  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      symbol?: string;
    } = {},
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, status, type, symbol } = options;
    const skip = (page - 1) * limit;

    const filter: any = { userId: new Types.ObjectId(userId) };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (symbol) filter.symbol = symbol;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments(filter),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    return await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, userId: new Types.ObjectId(userId) },
        {
          status: 'read' as any,
          readAt: new Date(),
        },
        { new: true },
      )
      .lean();
  }

  /**
   * Mark multiple notifications as read (bulk operation)
   */
  async markMultipleAsRead(
    notificationIds: string[],
    userId: string,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      {
        _id: { $in: notificationIds },
        userId: new Types.ObjectId(userId),
        status: 'unread',
      },
      {
        status: 'read' as any,
        readAt: new Date(),
      },
    );

    this.logger.log(
      `Marked ${result.modifiedCount} notifications as read for user ${userId}`,
    );
    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(
    userId: string,
    filters?: { type?: string; symbol?: string },
  ): Promise<{ modifiedCount: number }> {
    const filter: any = {
      userId: new Types.ObjectId(userId),
      status: 'unread',
    };

    if (filters?.type) filter.type = filters.type;
    if (filters?.symbol) filter.symbol = filters.symbol;

    const result = await this.notificationModel.updateMany(filter, {
      status: 'read' as any,
      readAt: new Date(),
    });

    this.logger.log(
      `Marked ${result.modifiedCount} notifications as read for user ${userId}`,
    );
    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Archive a notification
   */
  async archiveNotification(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    return await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, userId: new Types.ObjectId(userId) },
        {
          status: 'archived' as any,
          archivedAt: new Date(),
        },
        { new: true },
      )
      .lean();
  }

  /**
   * Archive multiple notifications (bulk operation)
   */
  async archiveMultiple(
    notificationIds: string[],
    userId: string,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      {
        _id: { $in: notificationIds },
        userId: new Types.ObjectId(userId),
      },
      {
        status: 'archived' as any,
        archivedAt: new Date(),
      },
    );

    this.logger.log(
      `Archived ${result.modifiedCount} notifications for user ${userId}`,
    );
    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Delete a notification permanently
   */
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.notificationModel.deleteOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });

    return result.deletedCount > 0;
  }

  /**
   * Delete multiple notifications permanently (bulk operation)
   */
  async deleteMultiple(
    notificationIds: string[],
    userId: string,
  ): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel.deleteMany({
      _id: { $in: notificationIds },
      userId: new Types.ObjectId(userId),
    });

    this.logger.log(
      `Deleted ${result.deletedCount} notifications for user ${userId}`,
    );
    return { deletedCount: result.deletedCount };
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const [total, unread, read, archived, byType, byPriority] =
      await Promise.all([
        this.notificationModel.countDocuments({
          userId: new Types.ObjectId(userId),
        }),
        this.notificationModel.countDocuments({
          userId: new Types.ObjectId(userId),
          status: 'unread',
        }),
        this.notificationModel.countDocuments({
          userId: new Types.ObjectId(userId),
          status: 'read',
        }),
        this.notificationModel.countDocuments({
          userId: new Types.ObjectId(userId),
          status: 'archived',
        }),
        this.notificationModel.aggregate([
          { $match: { userId: new Types.ObjectId(userId) } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $project: { type: '$_id', count: 1, _id: 0 } },
        ]),
        this.notificationModel.aggregate([
          { $match: { userId: new Types.ObjectId(userId) } },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $project: { priority: '$_id', count: 1, _id: 0 } },
        ]),
      ]);

    return {
      total,
      unread,
      read,
      archived,
      byType: byType.reduce(
        (acc, item) => ({ ...acc, [item.type]: item.count }),
        {},
      ),
      byPriority: byPriority.reduce(
        (acc, item) => ({ ...acc, [item.priority]: item.count }),
        {},
      ),
    };
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    this.logger.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return { deletedCount: result.deletedCount };
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(
    userIds: string[],
    notificationData: {
      type: NotificationType;
      priority: NotificationPriority;
      title: string;
      message: string;
      data?: Record<string, any>;
      symbol?: string;
      timeframe?: string;
      eventType?: string;
      alertId?: string;
      tags?: string[];
      metadata?: Record<string, any>;
      isPersistent?: boolean;
      expiresAt?: Date;
    },
  ): Promise<{ createdCount: number; failedCount: number; errors: string[] }> {
    const notifications = userIds.map((userId) => ({
      ...notificationData,
      userId: new Types.ObjectId(userId),
    }));

    let createdCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      const result = await this.notificationModel.insertMany(notifications, {
        ordered: false,
      });
      createdCount = result.length;

      // Emit events for each created notification
      result.forEach((notification) => {
        this.emitNotification({ ...notification.toObject() });
      });

      this.logger.log(`Created ${createdCount} bulk notifications`);
    } catch (error: any) {
      if (error.writeErrors) {
        // Handle partial failures
        createdCount = error.result?.insertedCount || 0;
        failedCount = error.writeErrors.length;
        errors.push(...error.writeErrors.map((e: any) => e.errmsg));
      } else {
        failedCount = userIds.length;
        errors.push(error.message);
      }
    }

    return { createdCount, failedCount, errors };
  }
}
