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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const notification_entity_1 = require("./notification.entity");
const eventsType_1 = require("../../utils/constants/eventsType");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationModel, eventEmitter) {
        this.notificationModel = notificationModel;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async createNotification(data) {
        const notification = new this.notificationModel({
            ...data,
            userId: new mongoose_2.Types.ObjectId(data.userId),
        });
        const savedNotification = await notification.save();
        this.logger.log(`Notification created for user ${savedNotification.userId}`);
        this.emitNotification({
            ...savedNotification.toObject(),
        });
        return savedNotification;
    }
    emitNotification(payload) {
        this.eventEmitter.emit(eventsType_1.EventsType.NOTIFICATION_CREATED, payload);
    }
    async handleUserAlert(payload) {
        this.logger.log(`Creating USER notification: ${JSON.stringify(payload)}`);
        const { monitoring, alertId, userId, count } = payload;
        const { symbol, timeframe, eventType } = monitoring;
        await this.createNotification({
            userId: userId.toString(),
            type: notification_entity_1.NotificationType.ALERT_TRIGGERED,
            priority: notification_entity_1.NotificationPriority.HIGH,
            title: `Alert triggered for ${symbol}`,
            message: `Your alert (${eventType}) was triggered on ${symbol} (${timeframe}).`,
            data: payload,
            symbol,
            timeframe,
            eventType,
            alertId,
        });
    }
    async handleOrderAlert(payload) {
        this.logger.log(`Creating ORDER notification: ${JSON.stringify(payload)}`);
        const { monitoring, alertId, userId, count, orderId } = payload;
        const { symbol, timeframe, eventType } = monitoring;
        await this.createNotification({
            userId: userId.toString(),
            type: notification_entity_1.NotificationType.ORDER_STATUS,
            priority: notification_entity_1.NotificationPriority.MEDIUM,
            title: `Order update`,
            message: `Your order alert (${eventType}) was triggered for ${symbol}.`,
            data: payload,
            symbol,
            timeframe,
            eventType,
            alertId,
        });
    }
    async updateNotification(id, data) {
        return await this.notificationModel
            .findByIdAndUpdate(id, data, { new: true })
            .lean();
    }
    async getUserNotifications(userId, options = {}) {
        const { page = 1, limit = 20, status, type, symbol } = options;
        const skip = (page - 1) * limit;
        const filter = { userId: new mongoose_2.Types.ObjectId(userId) };
        if (status)
            filter.status = status;
        if (type)
            filter.type = type;
        if (symbol)
            filter.symbol = symbol;
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
    async markAsRead(notificationId, userId) {
        return await this.notificationModel
            .findOneAndUpdate({ _id: notificationId, userId: new mongoose_2.Types.ObjectId(userId) }, {
            status: 'read',
            readAt: new Date(),
        }, { new: true })
            .lean();
    }
    async markMultipleAsRead(notificationIds, userId) {
        const result = await this.notificationModel.updateMany({
            _id: { $in: notificationIds },
            userId: new mongoose_2.Types.ObjectId(userId),
            status: 'unread',
        }, {
            status: 'read',
            readAt: new Date(),
        });
        this.logger.log(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
        return { modifiedCount: result.modifiedCount };
    }
    async markAllAsRead(userId, filters) {
        const filter = {
            userId: new mongoose_2.Types.ObjectId(userId),
            status: 'unread',
        };
        if (filters?.type)
            filter.type = filters.type;
        if (filters?.symbol)
            filter.symbol = filters.symbol;
        const result = await this.notificationModel.updateMany(filter, {
            status: 'read',
            readAt: new Date(),
        });
        this.logger.log(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
        return { modifiedCount: result.modifiedCount };
    }
    async archiveNotification(notificationId, userId) {
        return await this.notificationModel
            .findOneAndUpdate({ _id: notificationId, userId: new mongoose_2.Types.ObjectId(userId) }, {
            status: 'archived',
            archivedAt: new Date(),
        }, { new: true })
            .lean();
    }
    async archiveMultiple(notificationIds, userId) {
        const result = await this.notificationModel.updateMany({
            _id: { $in: notificationIds },
            userId: new mongoose_2.Types.ObjectId(userId),
        }, {
            status: 'archived',
            archivedAt: new Date(),
        });
        this.logger.log(`Archived ${result.modifiedCount} notifications for user ${userId}`);
        return { modifiedCount: result.modifiedCount };
    }
    async deleteNotification(notificationId, userId) {
        const result = await this.notificationModel.deleteOne({
            _id: notificationId,
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        return result.deletedCount > 0;
    }
    async deleteMultiple(notificationIds, userId) {
        const result = await this.notificationModel.deleteMany({
            _id: { $in: notificationIds },
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        this.logger.log(`Deleted ${result.deletedCount} notifications for user ${userId}`);
        return { deletedCount: result.deletedCount };
    }
    async getNotificationStats(userId) {
        const [total, unread, read, archived, byType, byPriority] = await Promise.all([
            this.notificationModel.countDocuments({
                userId: new mongoose_2.Types.ObjectId(userId),
            }),
            this.notificationModel.countDocuments({
                userId: new mongoose_2.Types.ObjectId(userId),
                status: 'unread',
            }),
            this.notificationModel.countDocuments({
                userId: new mongoose_2.Types.ObjectId(userId),
                status: 'read',
            }),
            this.notificationModel.countDocuments({
                userId: new mongoose_2.Types.ObjectId(userId),
                status: 'archived',
            }),
            this.notificationModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId) } },
                { $group: { _id: '$type', count: { $sum: 1 } } },
                { $project: { type: '$_id', count: 1, _id: 0 } },
            ]),
            this.notificationModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId) } },
                { $group: { _id: '$priority', count: { $sum: 1 } } },
                { $project: { priority: '$_id', count: 1, _id: 0 } },
            ]),
        ]);
        return {
            total,
            unread,
            read,
            archived,
            byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item.count }), {}),
            byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item.priority]: item.count }), {}),
        };
    }
    async cleanupExpiredNotifications() {
        const result = await this.notificationModel.deleteMany({
            expiresAt: { $lt: new Date() },
        });
        this.logger.log(`Cleaned up ${result.deletedCount} expired notifications`);
        return { deletedCount: result.deletedCount };
    }
    async sendBulkNotifications(userIds, notificationData) {
        const notifications = userIds.map((userId) => ({
            ...notificationData,
            userId: new mongoose_2.Types.ObjectId(userId),
        }));
        let createdCount = 0;
        let failedCount = 0;
        const errors = [];
        try {
            const result = await this.notificationModel.insertMany(notifications, {
                ordered: false,
            });
            createdCount = result.length;
            result.forEach((notification) => {
                this.emitNotification({
                    ...notification.toObject(),
                });
            });
            this.logger.log(`Created ${createdCount} bulk notifications`);
        }
        catch (error) {
            if (error.writeErrors) {
                createdCount = error.result?.insertedCount || 0;
                failedCount = error.writeErrors.length;
                errors.push(...error.writeErrors.map((e) => e.errmsg));
            }
            else {
                failedCount = userIds.length;
                errors.push(error.message);
            }
        }
        return { createdCount, failedCount, errors };
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ALERT_TRIGGERED_USER, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleUserAlert", null);
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ALERT_TRIGGERED_ORDER, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleOrderAlert", null);
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_entity_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        event_emitter_1.EventEmitter2])
], NotificationService);
//# sourceMappingURL=notification.service.js.map