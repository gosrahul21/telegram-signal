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
const notification_gateway_1 = require("./notification.gateway");
let NotificationController = class NotificationController {
    constructor(notificationService, notificationGateway) {
        this.notificationService = notificationService;
        this.notificationGateway = notificationGateway;
    }
    async sendTelegramNotification(payload) {
        const result = await this.notificationService.sendTelegramNotification(payload.userId, payload.message);
        return { success: result, userId: payload.userId };
    }
    async sendTelegramNotificationToMultiple(payload) {
        const result = await this.notificationService.sendTelegramNotificationToMultiple(payload.userIds, payload.message);
        return result;
    }
    async sendSignalNotification(payload) {
        const result = await this.notificationService.sendSignalNotification(payload.userId, payload.signalData);
        return { success: result, userId: payload.userId };
    }
    async sendAlertNotification(payload) {
        const result = await this.notificationService.sendAlertNotification(payload.userId, payload.alertData);
        return { success: result, userId: payload.userId };
    }
    async sendStatusNotification(payload) {
        const result = await this.notificationService.sendStatusNotification(payload.userId, payload.statusData);
        return { success: result, userId: payload.userId };
    }
    async sendMultiChannelNotification(payload) {
        const result = await this.notificationService.sendMultiChannelNotification(payload);
        return result;
    }
    async broadcastWebSocketMessage(payload) {
        const result = this.notificationService.broadcastWebSocketMessage(payload.message);
        return result;
    }
    async sendWebSocketMessage(userId, payload) {
        const result = this.notificationService.sendWebSocketMessage(userId, payload.message);
        return { success: result, userId };
    }
    async getConnectedUsersCount() {
        const count = this.notificationService.getConnectedUsersCount();
        return { connectedUsers: count };
    }
    async getConnectedUserIds() {
        const userIds = this.notificationService.getConnectedUserIds();
        return { userIds };
    }
    async broadcastToSymbol(payload) {
        this.notificationGateway.broadcastToSymbol(payload.symbol, payload.type, payload.message);
        return {
            success: true,
            symbol: payload.symbol,
            type: payload.type,
            message: 'Broadcast initiated',
        };
    }
    async sendToUser(userId, payload) {
        this.notificationGateway.sendToUser(userId, payload.event, payload.data);
        return {
            success: true,
            userId,
            event: payload.event,
            message: 'Message sent',
        };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('telegram'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendTelegramNotification", null);
__decorate([
    (0, common_1.Post)('telegram/bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendTelegramNotificationToMultiple", null);
__decorate([
    (0, common_1.Post)('signal'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendSignalNotification", null);
__decorate([
    (0, common_1.Post)('alert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendAlertNotification", null);
__decorate([
    (0, common_1.Post)('status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendStatusNotification", null);
__decorate([
    (0, common_1.Post)('multi-channel'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendMultiChannelNotification", null);
__decorate([
    (0, common_1.Post)('websocket/broadcast'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "broadcastWebSocketMessage", null);
__decorate([
    (0, common_1.Post)('websocket/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendWebSocketMessage", null);
__decorate([
    (0, common_1.Get)('websocket/connections/count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getConnectedUsersCount", null);
__decorate([
    (0, common_1.Get)('websocket/connections/users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getConnectedUserIds", null);
__decorate([
    (0, common_1.Post)('websocket/broadcast-symbol'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "broadcastToSymbol", null);
__decorate([
    (0, common_1.Post)('websocket/user/:userId/send'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendToUser", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        notification_gateway_1.NotificationGateway])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map