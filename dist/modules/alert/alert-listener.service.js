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
const alert_events_1 = require("./events/alert.events");
let AlertListenerService = AlertListenerService_1 = class AlertListenerService {
    constructor(alertService) {
        this.alertService = alertService;
        this.logger = new common_1.Logger(AlertListenerService_1.name);
    }
    handleAlertUpdated(event) {
        this.logger.log(`Alert updated: ${event.alert.symbol} - ${event.alert.type}`);
        if (event.previousData) {
            this.checkForCriticalChanges(event.previousData, event.alert);
        }
        this.updateMonitoringConfiguration(event.alert);
        this.logToExternalService('alert_updated', event);
    }
    handleAlertDeleted(event) {
        this.logger.log(`Alert deleted: ${event.alertId}`);
        this.stopMonitoringAlert(event.alertId);
        this.cleanupAlertResources(event.alertId);
        this.logToExternalService('alert_deleted', event);
    }
    handleAlertTriggered(event) {
        this.logger.log(`Alert triggered: ${event.alert.symbol} - ${event.alert.type}`);
        this.sendAlertNotification(event.alert, event.triggerData);
        this.executeTradingLogic(event.alert, event.triggerData);
        this.updateAlertAnalytics(event.alert, event.triggerData);
        this.logToExternalService('alert_triggered', event);
    }
    handleAlertStatusChanged(event) {
        this.logger.log(`Alert status changed: ${event.alert.symbol} - ${event.previousStatus} -> ${event.newStatus}`);
        if (event.newStatus) {
            this.activateAlertMonitoring(event.alert);
        }
        else {
            this.deactivateAlertMonitoring(event.alert);
        }
        this.logToExternalService('alert_status_changed', event);
    }
    async notifyUserAboutNewAlert(alert) {
        this.logger.log(`Notifying user ${alert.userId} about new ${alert.type} alert for ${alert.symbol}`);
    }
    async startMonitoringAlert(alert) {
        this.logger.log(`Starting monitoring for ${alert.type} alert on ${alert.symbol}`);
    }
    async logToExternalService(action, data) {
        this.logger.log(`Logging ${action} to external service`);
    }
    async checkForCriticalChanges(previous, current) {
        if (previous.conditions !== current.conditions) {
            this.logger.warn(`Critical change detected in alert conditions for ${current.symbol}`);
        }
    }
    async updateMonitoringConfiguration(alert) {
        this.logger.log(`Updating monitoring configuration for ${alert.symbol}`);
    }
    async stopMonitoringAlert(alertId) {
        this.logger.log(`Stopping monitoring for alert ${alertId}`);
    }
    async cleanupAlertResources(alertId) {
        this.logger.log(`Cleaning up resources for alert ${alertId}`);
    }
    async sendAlertNotification(alert, triggerData) {
        this.logger.log(`Sending notification for ${alert.type} alert on ${alert.symbol}`);
    }
    async executeTradingLogic(alert, triggerData) {
        this.logger.log(`Executing trading logic for ${alert.type} alert on ${alert.symbol}`);
    }
    async updateAlertAnalytics(alert, triggerData) {
        this.logger.log(`Updating analytics for ${alert.type} alert on ${alert.symbol}`);
    }
    async activateAlertMonitoring(alert) {
        this.logger.log(`Activating monitoring for ${alert.symbol}`);
    }
    async deactivateAlertMonitoring(alert) {
        this.logger.log(`Deactivating monitoring for ${alert.symbol}`);
    }
};
exports.AlertListenerService = AlertListenerService;
__decorate([
    (0, event_emitter_1.OnEvent)(alert_events_1.ALERT_EVENTS.UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AlertListenerService.prototype, "handleAlertUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(alert_events_1.ALERT_EVENTS.DELETED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AlertListenerService.prototype, "handleAlertDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(alert_events_1.ALERT_EVENTS.TRIGGERED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AlertListenerService.prototype, "handleAlertTriggered", null);
__decorate([
    (0, event_emitter_1.OnEvent)(alert_events_1.ALERT_EVENTS.STATUS_CHANGED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AlertListenerService.prototype, "handleAlertStatusChanged", null);
exports.AlertListenerService = AlertListenerService = AlertListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alert_service_1.AlertService])
], AlertListenerService);
//# sourceMappingURL=alert-listener.service.js.map