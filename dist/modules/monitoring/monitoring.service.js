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
var MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const technical_analysis_service_1 = require("./technical-analysis.service");
const price_monitoring_service_1 = require("./price-monitoring.service");
const notification_service_1 = require("./notification.service");
const alert_1 = require("../alert");
let MonitoringService = MonitoringService_1 = class MonitoringService {
    constructor(alertService, technicalAnalysisService, priceMonitoringService, notificationService) {
        this.alertService = alertService;
        this.technicalAnalysisService = technicalAnalysisService;
        this.priceMonitoringService = priceMonitoringService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(MonitoringService_1.name);
        this.activeAlerts = new Map();
        this.monitoringIntervals = new Map();
    }
    onModuleInit() {
        this.logger.log('Monitoring service initialized');
        this.loadActiveAlerts();
    }
    async handleAlertCreated(event) {
        this.logger.log(`New alert created: ${event.alert.symbol} - ${event.alert.type}`);
        if (event.alert.isActive) {
            await this.startMonitoringAlert(event.alert);
        }
    }
    async handleAlertUpdated(event) {
        this.logger.log(`Alert updated: ${event.alert.symbol} - ${event.alert.type}`);
        if (event.previousData &&
            this.hasSignificantChanges(event.previousData, event.alert)) {
            await this.stopMonitoringAlert(event.previousData._id || event.previousData.id);
        }
        if (event.alert.isActive) {
            await this.startMonitoringAlert(event.alert);
        }
    }
    async handleAlertDeleted(event) {
        this.logger.log(`Alert deleted: ${event.alertId}`);
        await this.stopMonitoringAlert(event.alertId);
    }
    async handleAlertStatusChanged(event) {
        this.logger.log(`Alert status changed: ${event.alert.symbol} - ${event.previousStatus} -> ${event.newStatus}`);
        if (event.newStatus) {
            await this.startMonitoringAlert(event.alert);
        }
        else {
            await this.stopMonitoringAlert(event.alert._id || event.alert.id);
        }
    }
    async handleOrderCreated(event) {
        this.logger.log(`New order created: ${event.order.symbol}`);
        await this.startMonitoringOrder(event.order);
    }
    async handleOrderUpdated(event) {
        this.logger.log(`Order updated: ${event.order.symbol}`);
        await this.updateOrderMonitoring(event.order);
    }
    async handleOrderFilled(event) {
        this.logger.log(`Order filled: ${event.order.symbol}`);
        await this.stopOrderMonitoring(event.order.id);
    }
    async performPeriodicChecks() {
        this.logger.debug('Performing periodic monitoring checks');
        for (const [alertId, alert] of this.activeAlerts) {
            try {
                await this.checkAlertConditions(alert);
            }
            catch (error) {
                this.logger.error(`Error checking alert ${alertId}:`, error);
            }
        }
    }
    async loadActiveAlerts() {
        try {
            const activeAlerts = await this.alertService.findActiveAlerts();
            for (const alert of activeAlerts) {
                await this.startMonitoringAlert(alert);
            }
            this.logger.log(`Loaded ${activeAlerts.length} active alerts`);
        }
        catch (error) {
            this.logger.error('Error loading active alerts:', error);
        }
    }
    async startMonitoringAlert(alert) {
        const alertId = alert._id || alert.id;
        if (this.activeAlerts.has(alertId)) {
            this.logger.warn(`Alert ${alertId} is already being monitored`);
            return;
        }
        this.activeAlerts.set(alertId, alert);
        switch (alert.type) {
            case 'limit':
                await this.startPriceMonitoring(alert);
                break;
            case 'bollinger_bands':
                await this.startBollingerBandsMonitoring(alert);
                break;
            case 'ema_crossover':
                await this.startEMACrossoverMonitoring(alert);
                break;
            case 'rsi':
                await this.startRSIMonitoring(alert);
                break;
            case 'macd':
                await this.startMACDMonitoring(alert);
                break;
            default:
                this.logger.warn(`Unknown alert type: ${alert.type}`);
        }
        this.logger.log(`Started monitoring alert ${alertId} for ${alert.symbol}`);
    }
    async stopMonitoringAlert(alertId) {
        if (!this.activeAlerts.has(alertId)) {
            return;
        }
        const interval = this.monitoringIntervals.get(alertId);
        if (interval) {
            clearInterval(interval);
            this.monitoringIntervals.delete(alertId);
        }
        this.activeAlerts.delete(alertId);
        this.logger.log(`Stopped monitoring alert ${alertId}`);
    }
    async startPriceMonitoring(alert) {
        const alertId = alert._id || alert.id;
        const interval = setInterval(async () => {
            try {
                const currentPrice = await this.priceMonitoringService.getCurrentPrice(alert.symbol);
                const targetPrice = alert.conditions?.targetPrice;
                if (targetPrice &&
                    this.checkPriceCondition(currentPrice, targetPrice, alert.conditions?.condition)) {
                    await this.triggerAlert(alert, { currentPrice, targetPrice });
                }
            }
            catch (error) {
                this.logger.error(`Error in price monitoring for ${alert.symbol}:`, error);
            }
        }, this.getMonitoringInterval(alert.timeframe));
        this.monitoringIntervals.set(alertId, interval);
    }
    async startBollingerBandsMonitoring(alert) {
        const alertId = alert._id || alert.id;
        const interval = setInterval(async () => {
            try {
                const bbData = await this.technicalAnalysisService.getBollingerBands(alert.symbol, alert.timeframe);
                const currentPrice = await this.priceMonitoringService.getCurrentPrice(alert.symbol);
                if (this.checkBollingerBandsCondition(currentPrice, bbData, alert.conditions)) {
                    await this.triggerAlert(alert, { currentPrice, bbData });
                }
            }
            catch (error) {
                this.logger.error(`Error in Bollinger Bands monitoring for ${alert.symbol}:`, error);
            }
        }, this.getMonitoringInterval(alert.timeframe));
        this.monitoringIntervals.set(alertId, interval);
    }
    async startEMACrossoverMonitoring(alert) {
        const alertId = alert._id || alert.id;
        const interval = setInterval(async () => {
            try {
                const emaData = await this.technicalAnalysisService.getEMACrossover(alert.symbol, alert.timeframe);
                if (this.checkEMACrossoverCondition(emaData, alert.conditions)) {
                    await this.triggerAlert(alert, { emaData });
                }
            }
            catch (error) {
                this.logger.error(`Error in EMA crossover monitoring for ${alert.symbol}:`, error);
            }
        }, this.getMonitoringInterval(alert.timeframe));
        this.monitoringIntervals.set(alertId, interval);
    }
    async startRSIMonitoring(alert) {
        const alertId = alert._id || alert.id;
        const interval = setInterval(async () => {
            try {
                const rsiData = await this.technicalAnalysisService.getRSI(alert.symbol, alert.timeframe);
                if (this.checkRSICondition(rsiData, alert.conditions)) {
                    await this.triggerAlert(alert, { rsiData });
                }
            }
            catch (error) {
                this.logger.error(`Error in RSI monitoring for ${alert.symbol}:`, error);
            }
        }, this.getMonitoringInterval(alert.timeframe));
        this.monitoringIntervals.set(alertId, interval);
    }
    async startMACDMonitoring(alert) {
        const alertId = alert._id || alert.id;
        const interval = setInterval(async () => {
            try {
                const macdData = await this.technicalAnalysisService.getMACD(alert.symbol, alert.timeframe);
                if (this.checkMACDCondition(macdData, alert.conditions)) {
                    await this.triggerAlert(alert, { macdData });
                }
            }
            catch (error) {
                this.logger.error(`Error in MACD monitoring for ${alert.symbol}:`, error);
            }
        }, this.getMonitoringInterval(alert.timeframe));
        this.monitoringIntervals.set(alertId, interval);
    }
    async startMonitoringOrder(order) {
        this.logger.log(`Started monitoring order ${order.id} for ${order.symbol}`);
    }
    async updateOrderMonitoring(order) {
        this.logger.log(`Updated monitoring for order ${order.id}`);
    }
    async stopOrderMonitoring(orderId) {
        this.logger.log(`Stopped monitoring order ${orderId}`);
    }
    async checkAlertConditions(alert) {
    }
    checkPriceCondition(currentPrice, targetPrice, condition) {
        switch (condition) {
            case 'above':
                return currentPrice > targetPrice;
            case 'below':
                return currentPrice < targetPrice;
            case 'equals':
                return Math.abs(currentPrice - targetPrice) < 0.0001;
            default:
                return false;
        }
    }
    checkBollingerBandsCondition(currentPrice, bbData, conditions) {
        const { upperBand, lowerBand } = bbData;
        if (conditions?.breakout === 'upper') {
            return currentPrice > upperBand;
        }
        else if (conditions?.breakout === 'lower') {
            return currentPrice < lowerBand;
        }
        else if (conditions?.bounce === 'upper') {
            return (currentPrice <= upperBand && currentPrice > (upperBand + lowerBand) / 2);
        }
        else if (conditions?.bounce === 'lower') {
            return (currentPrice >= lowerBand && currentPrice < (upperBand + lowerBand) / 2);
        }
        return false;
    }
    checkEMACrossoverCondition(emaData, conditions) {
        const { fastEMA, slowEMA, previousFastEMA, previousSlowEMA } = emaData;
        if (conditions?.crossover === 'bullish') {
            return previousFastEMA <= previousSlowEMA && fastEMA > slowEMA;
        }
        else if (conditions?.crossover === 'bearish') {
            return previousFastEMA >= previousSlowEMA && fastEMA < slowEMA;
        }
        return false;
    }
    checkRSICondition(rsiData, conditions) {
        const { rsi } = rsiData;
        if (conditions?.oversold && rsi < conditions.oversold) {
            return true;
        }
        else if (conditions?.overbought && rsi > conditions.overbought) {
            return true;
        }
        return false;
    }
    checkMACDCondition(macdData, conditions) {
        const { macd, signal, histogram } = macdData;
        if (conditions?.crossover === 'bullish') {
            return macd > signal && histogram > 0;
        }
        else if (conditions?.crossover === 'bearish') {
            return macd < signal && histogram < 0;
        }
        return false;
    }
    async triggerAlert(alert, triggerData) {
        try {
            await this.alertService.incrementTriggerCount(alert._id || alert.id, triggerData);
            await this.notificationService.emitAlertTriggered(alert, triggerData);
            this.logger.log(`Alert triggered: ${alert.symbol} - ${alert.type}`);
        }
        catch (error) {
            this.logger.error(`Error triggering alert ${alert._id || alert.id}:`, error);
        }
    }
    getMonitoringInterval(timeframe) {
        const intervals = {
            '1m': 30 * 1000,
            '5m': 60 * 1000,
            '15m': 2 * 60 * 1000,
            '30m': 5 * 60 * 1000,
            '1h': 10 * 60 * 1000,
            '4h': 30 * 60 * 1000,
            '1d': 2 * 60 * 60 * 1000,
        };
        return intervals[timeframe] || 60 * 1000;
    }
    hasSignificantChanges(previous, current) {
        return (previous.conditions !== current.conditions ||
            previous.timeframe !== current.timeframe ||
            previous.symbol !== current.symbol);
    }
    async getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }
    async getMonitoringStatus() {
        return {
            activeAlerts: this.activeAlerts.size,
            monitoringIntervals: this.monitoringIntervals.size,
            status: 'active',
        };
    }
};
exports.MonitoringService = MonitoringService;
__decorate([
    (0, event_emitter_1.OnEvent)('alert.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringService.prototype, "handleAlertCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('alert.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringService.prototype, "handleAlertUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('alert.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringService.prototype, "handleAlertDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('alert.status.changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringService.prototype, "handleAlertStatusChanged", null);
__decorate([
    (0, event_emitter_1.OnEvent)('order.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringService.prototype, "handleOrderCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('order.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringService.prototype, "handleOrderUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('order.filled'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringService.prototype, "handleOrderFilled", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringService.prototype, "performPeriodicChecks", null);
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alert_1.AlertService,
        technical_analysis_service_1.TechnicalAnalysisService,
        price_monitoring_service_1.PriceMonitoringService,
        notification_service_1.NotificationService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map