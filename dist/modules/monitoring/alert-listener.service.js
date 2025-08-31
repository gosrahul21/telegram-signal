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
const monitoring_service_1 = require("./monitoring.service");
const eventsType_1 = require("../../utils/constants/eventsType");
let AlertListenerService = AlertListenerService_1 = class AlertListenerService {
    constructor(monitoringService) {
        this.monitoringService = monitoringService;
        this.logger = new common_1.Logger(AlertListenerService_1.name);
    }
    async handleAlertCreated(event) {
        const alert = event;
        this.logger.log(`New monitoring created: ${alert.symbol} - ${alert.eventType} - ${alert.timeframe}`);
        if (!alert.isActive)
            return;
        await this.monitoringService.addMonitoring({
            symbol: alert.symbol,
            timeframe: alert.timeframe,
            eventType: alert.eventType,
            count: alert.count.toString(),
        });
    }
    async handleAlertUpdated(event) {
        const alert = event;
        this.logger.log(`Alert updated: ${alert.symbol} - ${alert.eventType} - ${alert.timeframe}`);
        if (alert.count === 0 && alert.count !== 'INFINITE') {
            await this.monitoringService.removeMonitoring(alert.symbol, alert.timeframe, alert.eventType);
            return;
        }
        await this.monitoringService.addMonitoring({
            symbol: alert.symbol,
            timeframe: alert.timeframe,
            eventType: alert.eventType,
            count: alert.count.toString(),
        });
    }
    async handleAlertDeleted(alert) {
        try {
            if (alert.count === 0 && alert.count !== 'INFINITE') {
                return await this.monitoringService.removeMonitoring(alert.symbol, alert.timeframe, alert.eventType);
            }
            await this.monitoringService.addMonitoring({
                symbol: alert.symbol,
                timeframe: alert.timeframe,
                eventType: alert.eventType,
                count: alert.count.toString(),
            });
        }
        catch (error) {
            this.logger.error(`Error removing monitoring: ${error}`);
        }
    }
};
exports.AlertListenerService = AlertListenerService;
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ALERT_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertListenerService.prototype, "handleAlertCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ALERT_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertListenerService.prototype, "handleAlertUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.ALERT_DELETED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertListenerService.prototype, "handleAlertDeleted", null);
exports.AlertListenerService = AlertListenerService = AlertListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], AlertListenerService);
//# sourceMappingURL=alert-listener.service.js.map