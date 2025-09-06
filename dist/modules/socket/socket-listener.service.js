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
var SocketListenerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketListenerService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const eventsType_1 = require("../../utils/constants/eventsType");
const socket_service_1 = require("./socket.service");
let SocketListenerService = SocketListenerService_1 = class SocketListenerService {
    constructor(socketService) {
        this.socketService = socketService;
        this.logger = new common_1.Logger(SocketListenerService_1.name);
    }
    async handleNotificationCreated(payload) {
        this.logger.log(`Pushing notification to user ${payload.userId}`);
        const sent = this.socketService.emitToUser(payload.userId.toString(), 'notification', payload);
        if (!sent) {
            this.logger.warn(`User ${payload.userId} not connected, skipping push`);
        }
    }
    async handleOrderUpdated(payload) {
        this.logger.log(`Pushing order update to user ${payload.userId}`);
        this.socketService.emitToUser(payload.userId.toString(), 'order_update', payload);
    }
};
exports.SocketListenerService = SocketListenerService;
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.NOTIFICATION_CREATED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketListenerService.prototype, "handleNotificationCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ORDER_UPDATED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketListenerService.prototype, "handleOrderUpdated", null);
exports.SocketListenerService = SocketListenerService = SocketListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [socket_service_1.SocketService])
], SocketListenerService);
//# sourceMappingURL=socket-listener.service.js.map