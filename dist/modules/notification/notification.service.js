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
        this.eventEmitter.emit(eventsType_1.EventsType.NOTIFICATION_CREATED, {
            ...savedNotification.toObject(),
            timestamp: new Date(),
        });
        return savedNotification;
    }
    async handleUserAlert(payload) {
        this.logger.log(`Creating USER notification: ${JSON.stringify(payload)}`);
        await this.createNotification({
            userId: payload.userId,
            type: notification_entity_1.NotificationType.ALERT_TRIGGERED,
            priority: notification_entity_1.NotificationPriority.HIGH,
            title: `Alert triggered for ${payload.symbol}`,
            message: `Your alert (${payload.eventType}) was triggered on ${payload.symbol} (${payload.timeframe}).`,
            data: payload,
            symbol: payload.symbol,
            timeframe: payload.timeframe,
            eventType: payload.eventType,
            alertId: payload.alertId,
        });
    }
    async handleOrderAlert(payload) {
        this.logger.log(`Creating ORDER notification: ${JSON.stringify(payload)}`);
        await this.createNotification({
            userId: payload.userId,
            type: notification_entity_1.NotificationType.ORDER_STATUS,
            priority: notification_entity_1.NotificationPriority.MEDIUM,
            title: `Order update`,
            message: `Your order alert (${payload.eventType}) was triggered for ${payload.symbol}.`,
            data: payload,
            symbol: payload.symbol,
            timeframe: payload.timeframe,
            eventType: payload.eventType,
            alertId: payload.alertId,
        });
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