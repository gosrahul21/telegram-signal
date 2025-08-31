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
const socket_service_1 = require("./socket.service");
const eventsType_1 = require("../../utils/constants/eventsType");
let SocketListenerService = SocketListenerService_1 = class SocketListenerService {
    constructor(socketService) {
        this.socketService = socketService;
        this.logger = new common_1.Logger(SocketListenerService_1.name);
    }
    onModuleInit() {
        this.logger.log('Socket listener service initialized');
    }
    async handleAlertTriggered(event) {
        try {
            const { alert, triggerData } = event;
            const userId = alert.userId;
            if (!userId) {
                this.logger.warn('Alert triggered but no userId found:', alert);
                return;
            }
            const socketMessage = {
                type: 'alert_triggered',
                data: {
                    alertId: alert.uuid,
                    symbol: alert.symbol,
                    timeframe: alert.timeframe,
                    eventType: alert.eventType,
                    remainingCount: alert.count,
                    triggerData,
                    timestamp: event.timestamp,
                },
                message: `Alert triggered for ${alert.symbol} - ${alert.eventType}`,
            };
            const sent = this.socketService.emitToUser(userId, 'alert_triggered', socketMessage);
            if (sent) {
                this.logger.log(`Alert triggered notification sent to user ${userId} for ${alert.symbol}`);
            }
            else {
                this.logger.warn(`User ${userId} not connected, alert notification not sent`);
            }
        }
        catch (error) {
            this.logger.error('Error handling alert triggered event:', error);
        }
    }
    broadcastToAllUsers(event, data) {
        return this.socketService.broadcastToAll(event, data);
    }
    async sendMonitoringStatusUpdate(userId, status) {
        try {
            const socketMessage = {
                type: 'monitoring_status',
                data: status,
                timestamp: new Date(),
            };
            const sent = this.socketService.emitToUser(userId, 'monitoring_status', socketMessage);
            if (sent) {
                this.logger.log(`Monitoring status sent to user ${userId}`);
            }
            else {
                this.logger.warn(`User ${userId} not connected, monitoring status not sent`);
            }
        }
        catch (error) {
            this.logger.error(`Error sending monitoring status to user ${userId}:`, error);
        }
    }
    async sendAlertMonitoringUpdate(userId, alertId, status, data) {
        try {
            const socketMessage = {
                type: 'alert_monitoring_update',
                data: {
                    alertId,
                    status,
                    data,
                    timestamp: new Date(),
                },
                message: `Alert ${alertId} monitoring status: ${status}`,
            };
            const sent = this.socketService.emitToUser(userId, 'alert_monitoring_update', socketMessage);
            if (sent) {
                this.logger.log(`Alert monitoring update sent to user ${userId} for alert ${alertId}`);
            }
            else {
                this.logger.warn(`User ${userId} not connected, alert monitoring update not sent`);
            }
        }
        catch (error) {
            this.logger.error(`Error sending alert monitoring update to user ${userId}:`, error);
        }
    }
};
exports.SocketListenerService = SocketListenerService;
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ALERT_TRIGGERED_USER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketListenerService.prototype, "handleAlertTriggered", null);
exports.SocketListenerService = SocketListenerService = SocketListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [socket_service_1.SocketService])
], SocketListenerService);
//# sourceMappingURL=socket-listener.service.js.map