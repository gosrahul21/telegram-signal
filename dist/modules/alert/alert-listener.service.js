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
var AlertListenerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertListenerService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const alert_service_1 = require("./alert.service");
const eventsType_1 = require("../../utils/constants/eventsType");
const AlertFor_1 = require("../../utils/types/AlertFor");
let AlertListenerService = AlertListenerService_1 = class AlertListenerService {
    constructor(alertService) {
        this.alertService = alertService;
        this.logger = new common_1.Logger(AlertListenerService_1.name);
    }
    async handleMonitoringTriggered(payload) {
        const { monitoring: { symbol, timeframe, eventType }, triggerData, } = payload;
        this.logger.log(`Received monitoring event for ${symbol} ${timeframe} ${eventType}`);
        const alerts = await this.alertService.findActiveAlertsBySymbolTimeframeEventType(symbol, timeframe, eventType);
        for (const alert of alerts) {
            let updatedCount = alert.count;
            if (!alert.infinite && updatedCount > 0) {
                updatedCount -= 1;
                await this.alertService.update(alert.uuid, { count: updatedCount });
            }
            if (alert.alertFor === AlertFor_1.AlertFor.USER) {
                const userPayload = {
                    ...payload,
                    alertId: alert.uuid,
                    userId: alert.userId,
                    count: updatedCount,
                };
                await this.alertService.emitCustomEvent(eventsType_1.EventsType.ALERT_TRIGGERED_USER, userPayload);
            }
            else if (alert.alertFor === AlertFor_1.AlertFor.ORDER) {
                const orderPayload = {
                    ...payload,
                    alertId: alert.uuid,
                    orderId: alert.orderId?.toString() || '',
                    userId: alert.userId,
                    count: updatedCount,
                };
                await this.alertService.emitCustomEvent(eventsType_1.EventsType.ALERT_TRIGGERED_ORDER, orderPayload);
            }
        }
    }
    async handleOrderEvents(payload) {
        this.logger.log(`Received order event: ${JSON.stringify(payload)}`);
        if (payload.type === 'FILLED') {
            await this.alertService.emitCustomEvent(eventsType_1.EventsType.ALERT_TRIGGERED_ORDER, payload);
        }
    }
};
exports.AlertListenerService = AlertListenerService;
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.MONITORING_TRIGGERED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertListenerService.prototype, "handleMonitoringTriggered", null);
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ORDER_CREATED, { async: true }),
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ORDER_UPDATED, { async: true }),
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ORDER_CANCELLED, { async: true }),
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ORDER_FILLED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertListenerService.prototype, "handleOrderEvents", null);
exports.AlertListenerService = AlertListenerService = AlertListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alert_service_1.AlertService])
], AlertListenerService);
//# sourceMappingURL=alert-listener.service.js.map