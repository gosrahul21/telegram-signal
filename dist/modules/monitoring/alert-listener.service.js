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
let AlertListenerService = AlertListenerService_1 = class AlertListenerService {
    constructor(monitoringService) {
        this.monitoringService = monitoringService;
        this.logger = new common_1.Logger(AlertListenerService_1.name);
    }
    async handleAlertCreated(event) {
        this.logger.log(`New alert created: ${event.alert.symbol} - ${event.alert.eventType} - ${event.alert.timeframe}`);
        if (event.alert.isActive) {
            await this.monitoringService.addAlertToMonitoring(event.alert);
        }
    }
    async handleAlertUpdated(event) {
        this.logger.log(`Alert updated: ${event.alert.symbol} - ${event.alert.eventType} - ${event.alert.timeframe}`);
        if (event.previousData) {
            await this.monitoringService.removeAlertFromMonitoring(event.previousData.uuid);
        }
        if (event.alert.isActive) {
            await this.monitoringService.addAlertToMonitoring(event.alert);
        }
    }
    async handleAlertDeleted(event) {
        this.logger.log(`Alert deleted: ${event.alertId}`);
        await this.monitoringService.removeAlertFromMonitoring(event.alertId);
    }
    async handleAlertStatusChanged(event) {
        this.logger.log(`Alert status changed: ${event.alert.symbol} - ${event.previousStatus} -> ${event.newStatus}`);
        if (event.newStatus) {
            await this.monitoringService.addAlertToMonitoring(event.alert);
        }
        else {
            await this.monitoringService.removeAlertFromMonitoring(event.alert.uuid);
        }
    }
};
exports.AlertListenerService = AlertListenerService;
__decorate([
    (0, event_emitter_1.OnEvent)('alert.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertListenerService.prototype, "handleAlertCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('alert.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertListenerService.prototype, "handleAlertUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('alert.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertListenerService.prototype, "handleAlertDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('alert.status.changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertListenerService.prototype, "handleAlertStatusChanged", null);
exports.AlertListenerService = AlertListenerService = AlertListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], AlertListenerService);
//# sourceMappingURL=alert-listener.service.js.map