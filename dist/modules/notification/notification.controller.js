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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async getUserNotifications(req, page, limit, status, type, symbol) {
        const userId = req.user.id;
        const result = await this.notificationService.getUserNotifications(userId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            status,
            type,
            symbol,
        });
        return {
            success: true,
            data: result,
        };
    }
    async getNotificationStats(req) {
        const userId = req.user.id;
        const stats = await this.notificationService.getNotificationStats(userId);
        return {
            success: true,
            data: stats,
        };
    }
    async markAsRead(id, req) {
        const userId = req.user.id;
        const notification = await this.notificationService.markAsRead(id, userId);
        if (!notification) {
            return {
                success: false,
                message: 'Notification not found or already processed',
            };
        }
        return {
            success: true,
            message: 'Notification marked as read',
            data: notification,
        };
    }
    async markMultipleAsRead(body, req) {
        const userId = req.user.id;
        const result = await this.notificationService.markMultipleAsRead(body.notificationIds, userId);
        return {
            success: true,
            message: `Marked ${result.modifiedCount} notifications as read`,
            data: result,
        };
    }
    async markAllAsRead(body, req) {
        const userId = req.user.id;
        const result = await this.notificationService.markAllAsRead(userId, body);
        return {
            success: true,
            message: `Marked ${result.modifiedCount} notifications as read`,
            data: result,
        };
    }
    async archiveNotification(id, req) {
        const userId = req.user.id;
        const notification = await this.notificationService.archiveNotification(id, userId);
        if (!notification) {
            return {
                success: false,
                message: 'Notification not found',
            };
        }
        return {
            success: true,
            message: 'Notification archived',
            data: notification,
        };
    }
    async archiveMultiple(body, req) {
        const userId = req.user.id;
        const result = await this.notificationService.archiveMultiple(body.notificationIds, userId);
        return {
            success: true,
            message: `Archived ${result.modifiedCount} notifications`,
            data: result,
        };
    }
    async deleteNotification(id, req) {
        const userId = req.user.id;
        const deleted = await this.notificationService.deleteNotification(id, userId);
        if (!deleted) {
            return {
                success: false,
                message: 'Notification not found',
            };
        }
        return {
            success: true,
            message: 'Notification deleted',
        };
    }
    async deleteMultiple(body, req) {
        const userId = req.user.id;
        const result = await this.notificationService.deleteMultiple(body.notificationIds, userId);
        return {
            success: true,
            message: `Deleted ${result.deletedCount} notifications`,
            data: result,
        };
    }
    async sendBulkNotifications(body) {
        const notificationData = {
            ...body,
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        };
        const result = await this.notificationService.sendBulkNotifications(body.userIds, notificationData);
        return {
            success: true,
            message: `Bulk notification sent: ${result.createdCount} created, ${result.failedCount} failed`,
            data: result,
        };
    }
    async cleanupExpiredNotifications() {
        const result = await this.notificationService.cleanupExpiredNotifications();
        return {
            success: true,
            message: `Cleaned up ${result.deletedCount} expired notifications`,
            data: result,
        };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('type')),
    __param(5, (0, common_1.Query)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationStats", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('bulk/read'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markMultipleAsRead", null);
__decorate([
    (0, common_1.Patch)('bulk/read-all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "archiveNotification", null);
__decorate([
    (0, common_1.Patch)('bulk/archive'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "archiveMultiple", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteMultiple", null);
__decorate([
    (0, common_1.Post)('bulk/send'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendBulkNotifications", null);
__decorate([
    (0, common_1.Post)('cleanup/expired'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "cleanupExpiredNotifications", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map