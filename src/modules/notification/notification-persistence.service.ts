import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from './notification.entity';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  symbol?: string;
  timeframe?: string;
  eventType?: string;
  alertId?: string;
  priority?: NotificationPriority;
  tags?: string[];
  metadata?: Record<string, any>;
  isPersistent?: boolean;
  expiresAt?: Date;
}

export interface NotificationFilter {
  userId?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  symbol?: string;
  read?: boolean;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class NotificationPersistenceService {
  private readonly logger = new Logger(NotificationPersistenceService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  // Create a new notification
  async createNotification(
    createDto: CreateNotificationDto,
  ): Promise<Notification> {
    try {
      const notification = new this.notificationModel({
        ...createDto,
        userId: createDto.userId,
        status: NotificationStatus.UNREAD,
        priority: createDto.priority || NotificationPriority.MEDIUM,
        tags: createDto.tags || [],
        isPersistent: createDto.isPersistent || false,
      });

      const savedNotification = await notification.save();
      this.logger.log(
        `Notification created: ${savedNotification.uuid} for user ${createDto.userId}`,
      );

      return savedNotification;
    } catch (error) {
      this.logger.error(
        `Error creating notification for user ${createDto.userId}:`,
        error,
      );
      throw error;
    }
  }

  // Get notifications for a user with filtering
  async getUserNotifications(
    filter: NotificationFilter,
  ): Promise<Notification[]> {
    try {
      const query: any = {};

      if (filter.userId) {
        query.userId = filter.userId;
      }

      if (filter.type) {
        query.type = filter.type;
      }

      if (filter.status) {
        query.status = filter.status;
      }

      if (filter.symbol) {
        query.symbol = filter.symbol;
      }

      if (filter.read !== undefined) {
        if (filter.read) {
          query.status = {
            $in: [NotificationStatus.READ, NotificationStatus.ARCHIVED],
          };
        } else {
          query.status = NotificationStatus.UNREAD;
        }
      }

      if (filter.startDate || filter.endDate) {
        query.createdAt = {};
        if (filter.startDate) {
          query.createdAt.$gte = filter.startDate;
        }
        if (filter.endDate) {
          query.createdAt.$lte = filter.endDate;
        }
      }

      const limit = filter.limit || 50;
      const offset = filter.offset || 0;

      const notifications = await this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec();

      this.logger.log(
        `Retrieved ${notifications.length} notifications for user ${filter.userId}`,
      );
      return notifications;
    } catch (error) {
      this.logger.error(
        `Error retrieving notifications for user ${filter.userId}:`,
        error,
      );
      throw error;
    }
  }

  // Get unread notifications count for a user
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.notificationModel
        .countDocuments({
          userId,
          status: NotificationStatus.UNREAD,
        })
        .exec();

      return count;
    } catch (error) {
      this.logger.error(
        `Error getting unread count for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    try {
      const notification = await this.notificationModel
        .findOneAndUpdate(
          { uuid: notificationId, userId },
          {
            status: NotificationStatus.READ,
            readAt: new Date(),
          },
          { new: true },
        )
        .exec();

      if (!notification) {
        throw new Error(
          `Notification ${notificationId} not found for user ${userId}`,
        );
      }

      this.logger.log(
        `Notification ${notificationId} marked as read for user ${userId}`,
      );
      return notification;
    } catch (error) {
      this.logger.error(
        `Error marking notification ${notificationId} as read:`,
        error,
      );
      throw error;
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(
    notificationIds: string[],
    userId: string,
  ): Promise<number> {
    try {
      const result = await this.notificationModel
        .updateMany(
          { uuid: { $in: notificationIds }, userId },
          {
            status: NotificationStatus.READ,
            readAt: new Date(),
          },
        )
        .exec();

      this.logger.log(
        `Marked ${result.modifiedCount} notifications as read for user ${userId}`,
      );
      return result.modifiedCount;
    } catch (error) {
      this.logger.error(
        `Error marking multiple notifications as read for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await this.notificationModel
        .updateMany(
          { userId, status: NotificationStatus.UNREAD },
          {
            status: NotificationStatus.READ,
            readAt: new Date(),
          },
        )
        .exec();

      this.logger.log(
        `Marked all notifications as read for user ${userId} (${result.modifiedCount} notifications)`,
      );
      return result.modifiedCount;
    } catch (error) {
      this.logger.error(
        `Error marking all notifications as read for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Archive a notification
  async archiveNotification(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    try {
      const notification = await this.notificationModel
        .findOneAndUpdate(
          { uuid: notificationId, userId },
          {
            status: NotificationStatus.ARCHIVED,
            archivedAt: new Date(),
          },
          { new: true },
        )
        .exec();

      if (!notification) {
        throw new Error(
          `Notification ${notificationId} not found for user ${userId}`,
        );
      }

      this.logger.log(
        `Notification ${notificationId} archived for user ${userId}`,
      );
      return notification;
    } catch (error) {
      this.logger.error(
        `Error archiving notification ${notificationId}:`,
        error,
      );
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const result = await this.notificationModel
        .deleteOne({
          uuid: notificationId,
          userId,
        })
        .exec();

      if (result.deletedCount === 0) {
        throw new Error(
          `Notification ${notificationId} not found for user ${userId}`,
        );
      }

      this.logger.log(
        `Notification ${notificationId} deleted for user ${userId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error deleting notification ${notificationId}:`,
        error,
      );
      throw error;
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const result = await this.notificationModel
        .deleteMany({
          expiresAt: { $lt: new Date() },
        })
        .exec();

      if (result.deletedCount > 0) {
        this.logger.log(
          `Cleaned up ${result.deletedCount} expired notifications`,
        );
      }

      return result.deletedCount;
    } catch (error) {
      this.logger.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }

  // Get notification statistics for a user
  async getUserNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const [total, unread, read, archived, byType, byPriority] =
        await Promise.all([
          this.notificationModel.countDocuments({ userId }),
          this.notificationModel.countDocuments({
            userId,
            status: NotificationStatus.UNREAD,
          }),
          this.notificationModel.countDocuments({
            userId,
            status: NotificationStatus.READ,
          }),
          this.notificationModel.countDocuments({
            userId,
            status: NotificationStatus.ARCHIVED,
          }),
          this.notificationModel.aggregate([
            { $match: { userId } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
          ]),
          this.notificationModel.aggregate([
            { $match: { userId } },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
          ]),
        ]);

      const byTypeMap = byType.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byPriorityMap = byPriority.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        total,
        unread,
        read,
        archived,
        byType: byTypeMap,
        byPriority: byPriorityMap,
      };
    } catch (error) {
      this.logger.error(
        `Error getting notification stats for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Search notifications
  async searchNotifications(
    userId: string,
    searchTerm: string,
    limit: number = 20,
  ): Promise<Notification[]> {
    try {
      const notifications = await this.notificationModel
        .find({
          userId,
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { message: { $regex: searchTerm, $options: 'i' } },
            { symbol: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      this.logger.log(
        `Found ${notifications.length} notifications matching "${searchTerm}" for user ${userId}`,
      );
      return notifications;
    } catch (error) {
      this.logger.error(
        `Error searching notifications for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
