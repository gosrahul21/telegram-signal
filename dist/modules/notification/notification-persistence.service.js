"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationPersistenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPersistenceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_entity_1 = require("./notification.entity");
let NotificationPersistenceService = NotificationPersistenceService_1 = class NotificationPersistenceService {
    constructor(notificationModel) {
        this.notificationModel = notificationModel;
        this.logger = new common_1.Logger(NotificationPersistenceService_1.name);
    }
    async createNotification(createDto) {
        try {
            const notification = new this.notificationModel({
                ...createDto,
                userId: createDto.userId,
                status: notification_entity_1.NotificationStatus.UNREAD,
                priority: createDto.priority || notification_entity_1.NotificationPriority.MEDIUM,
                tags: createDto.tags || [],
                isPersistent: createDto.isPersistent || false,
            });
            const savedNotification = await notification.save();
            this.logger.log(`Notification created: ${savedNotification.uuid} for user ${createDto.userId}`);
            return savedNotification;
        }
        catch (error) {
            this.logger.error(`Error creating notification for user ${createDto.userId}:`, error);
            throw error;
        }
    }
    async getUserNotifications(filter) {
        try {
            const query = {};
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
                        $in: [notification_entity_1.NotificationStatus.READ, notification_entity_1.NotificationStatus.ARCHIVED],
                    };
                }
                else {
                    query.status = notification_entity_1.NotificationStatus.UNREAD;
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
            this.logger.log(`Retrieved ${notifications.length} notifications for user ${filter.userId}`);
            return notifications;
        }
        catch (error) {
            this.logger.error(`Error retrieving notifications for user ${filter.userId}:`, error);
            throw error;
        }
    }
    async getUnreadCount(userId) {
        try {
            const count = await this.notificationModel
                .countDocuments({
                userId,
                status: notification_entity_1.NotificationStatus.UNREAD,
            })
                .exec();
            return count;
        }
        catch (error) {
            this.logger.error(`Error getting unread count for user ${userId}:`, error);
            throw error;
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const notification = await this.notificationModel
                .findOneAndUpdate({ uuid: notificationId, userId }, {
                status: notification_entity_1.NotificationStatus.READ,
                readAt: new Date(),
            }, { new: true })
                .exec();
            if (!notification) {
                throw new Error(`Notification ${notificationId} not found for user ${userId}`);
            }
            this.logger.log(`Notification ${notificationId} marked as read for user ${userId}`);
            return notification;
        }
        catch (error) {
            this.logger.error(`Error marking notification ${notificationId} as read:`, error);
            throw error;
        }
    }
    async markMultipleAsRead(notificationIds, userId) {
        try {
            const result = await this.notificationModel
                .updateMany({ uuid: { $in: notificationIds }, userId }, {
                status: notification_entity_1.NotificationStatus.READ,
                readAt: new Date(),
            })
                .exec();
            this.logger.log(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
            return result.modifiedCount;
        }
        catch (error) {
            this.logger.error(`Error marking multiple notifications as read for user ${userId}:`, error);
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            const result = await this.notificationModel
                .updateMany({ userId, status: notification_entity_1.NotificationStatus.UNREAD }, {
                status: notification_entity_1.NotificationStatus.READ,
                readAt: new Date(),
            })
                .exec();
            this.logger.log(`Marked all notifications as read for user ${userId} (${result.modifiedCount} notifications)`);
            return result.modifiedCount;
        }
        catch (error) {
            this.logger.error(`Error marking all notifications as read for user ${userId}:`, error);
            throw error;
        }
    }
    async archiveNotification(notificationId, userId) {
        try {
            const notification = await this.notificationModel
                .findOneAndUpdate({ uuid: notificationId, userId }, {
                status: notification_entity_1.NotificationStatus.ARCHIVED,
                archivedAt: new Date(),
            }, { new: true })
                .exec();
            if (!notification) {
                throw new Error(`Notification ${notificationId} not found for user ${userId}`);
            }
            this.logger.log(`Notification ${notificationId} archived for user ${userId}`);
            return notification;
        }
        catch (error) {
            this.logger.error(`Error archiving notification ${notificationId}:`, error);
            throw error;
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            const result = await this.notificationModel
                .deleteOne({
                uuid: notificationId,
                userId,
            })
                .exec();
            if (result.deletedCount === 0) {
                throw new Error(`Notification ${notificationId} not found for user ${userId}`);
            }
            this.logger.log(`Notification ${notificationId} deleted for user ${userId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting notification ${notificationId}:`, error);
            throw error;
        }
    }
    async cleanupExpiredNotifications() {
        try {
            const result = await this.notificationModel
                .deleteMany({
                expiresAt: { $lt: new Date() },
            })
                .exec();
            if (result.deletedCount > 0) {
                this.logger.log(`Cleaned up ${result.deletedCount} expired notifications`);
            }
            return result.deletedCount;
        }
        catch (error) {
            this.logger.error('Error cleaning up expired notifications:', error);
            throw error;
        }
    }
    async getUserNotificationStats(userId) {
        try {
            const [total, unread, read, archived, byType, byPriority] = await Promise.all([
                this.notificationModel.countDocuments({ userId }),
                this.notificationModel.countDocuments({
                    userId,
                    status: notification_entity_1.NotificationStatus.UNREAD,
                }),
                this.notificationModel.countDocuments({
                    userId,
                    status: notification_entity_1.NotificationStatus.READ,
                }),
                this.notificationModel.countDocuments({
                    userId,
                    status: notification_entity_1.NotificationStatus.ARCHIVED,
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
            const byTypeMap = byType.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});
            const byPriorityMap = byPriority.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});
            return {
                total,
                unread,
                read,
                archived,
                byType: byTypeMap,
                byPriority: byPriorityMap,
            };
        }
        catch (error) {
            this.logger.error(`Error getting notification stats for user ${userId}:`, error);
            throw error;
        }
    }
    async searchNotifications(userId, searchTerm, limit = 20) {
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
            this.logger.log(`Found ${notifications.length} notifications matching "${searchTerm}" for user ${userId}`);
            return notifications;
        }
        catch (error) {
            this.logger.error(`Error searching notifications for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.NotificationPersistenceService = NotificationPersistenceService;
exports.NotificationPersistenceService = NotificationPersistenceService = NotificationPersistenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_entity_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NotificationPersistenceService);
//# sourceMappingURL=notification-persistence.service.js.map