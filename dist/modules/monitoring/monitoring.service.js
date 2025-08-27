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
        this.alertGroups = new Map();
        this.activeAlerts = new Map();
    }
    onModuleInit() {
        this.logger.log('Monitoring service initialized');
        this.loadActiveAlerts();
    }
    async addAlertToMonitoring(alert) {
        const alertId = alert.uuid;
        if (this.activeAlerts
            .get(alert.symbol)
            ?.get(alert.timeframe)
            ?.get(alert.eventType)
            ?.has(alertId)) {
            this.logger.warn(`Alert ${alertId} is already being monitored`);
            return;
        }
        const internalAlert = {
            userId: alert.userId.toString(),
            remainingCount: alert.count,
            isEternal: alert.eternal || false,
        };
        this.setActiveAlertsMap(alert, internalAlert);
        await this.organizeAlert(alert, internalAlert);
        this.logger.log(`Started monitoring alert ${alertId} for ${alert.symbol} - ${alert.eventType} - ${alert.timeframe}`);
    }
    async removeAlertFromMonitoring(alertId) {
        for (const [symbol, timeframeMap] of this.activeAlerts) {
            for (const [timeframe, eventTypeMap] of timeframeMap) {
                for (const [eventType, alertMap] of eventTypeMap) {
                    if (alertMap.has(alertId)) {
                        const internalAlert = alertMap.get(alertId);
                        alertMap.delete(alertId);
                        if (alertMap.size === 0) {
                            eventTypeMap.delete(eventType);
                        }
                        if (eventTypeMap.size === 0) {
                            timeframeMap.delete(timeframe);
                        }
                        if (timeframeMap.size === 0) {
                            this.activeAlerts.delete(symbol);
                        }
                        await this.updateAlertGroupsAfterRemoval(symbol, timeframe, eventType);
                        this.logger.log(`Stopped monitoring alert ${alertId}`);
                        return;
                    }
                }
            }
        }
    }
    async updateAlertGroupsAfterRemoval(symbol, timeframe, eventType) {
        const symbolMap = this.alertGroups.get(symbol);
        if (!symbolMap)
            return;
        const timeframeMap = symbolMap.get(timeframe);
        if (!timeframeMap)
            return;
        const groupData = timeframeMap.get(eventType);
        if (!groupData)
            return;
        const remainingAlerts = this.activeAlerts
            .get(symbol)
            ?.get(timeframe)
            ?.get(eventType);
        if (!remainingAlerts || remainingAlerts.size === 0) {
            if (groupData.monitoringInterval) {
                clearInterval(groupData.monitoringInterval);
            }
            timeframeMap.delete(eventType);
            if (timeframeMap.size === 0) {
                symbolMap.delete(timeframe);
            }
            if (symbolMap.size === 0) {
                this.alertGroups.delete(symbol);
            }
        }
        else {
            const newCount = this.getBestCountForAlertType(symbol, timeframe, eventType);
            groupData.count = newCount;
        }
    }
    setActiveAlertsMap(alert, internalAlert) {
        const alertId = alert.uuid;
        if (!this.activeAlerts.has(alert.symbol)) {
            this.activeAlerts.set(alert.symbol, new Map());
        }
        if (!this.activeAlerts.get(alert.symbol).has(alert.timeframe)) {
            this.activeAlerts.get(alert.symbol).set(alert.timeframe, new Map());
        }
        if (!this.activeAlerts
            .get(alert.symbol)
            .get(alert.timeframe)
            .has(alert.eventType)) {
            this.activeAlerts
                .get(alert.symbol)
                .get(alert.timeframe)
                .set(alert.eventType, new Map());
        }
        this.activeAlerts
            .get(alert.symbol)
            .get(alert.timeframe)
            .get(alert.eventType)
            .set(alertId, internalAlert);
    }
    async organizeAlert(alert, internalAlert) {
        if (!this.alertGroups.has(alert.symbol)) {
            this.alertGroups.set(alert.symbol, new Map());
        }
        const symbolMap = this.alertGroups.get(alert.symbol);
        if (!symbolMap.has(alert.timeframe)) {
            symbolMap.set(alert.timeframe, new Map());
        }
        const timeframeMap = symbolMap.get(alert.timeframe);
        if (!timeframeMap.has(alert.eventType)) {
            const bestCount = this.getBestCountForAlertType(alert.symbol, alert.timeframe, alert.eventType);
            const monitoringInterval = await this.startMonitoringByType(alert.symbol, alert.timeframe, alert.eventType);
            timeframeMap.set(alert.eventType, {
                count: bestCount,
                monitoringInterval,
            });
        }
        else {
            const groupData = timeframeMap.get(alert.eventType);
            const newCount = this.getBestCountForAlertType(alert.symbol, alert.timeframe, alert.eventType);
            groupData.count = newCount;
        }
    }
    getBestCountForAlertType(symbol, timeframe, eventType) {
        const alerts = this.activeAlerts
            .get(symbol)
            ?.get(timeframe)
            ?.get(eventType);
        if (!alerts)
            return 1;
        const alertValues = Array.from(alerts.values());
        const isEternal = alertValues.some((internalAlert) => internalAlert.isEternal);
        if (isEternal)
            return 'ETERNAL';
        return Math.max(...alertValues.map((internalAlert) => internalAlert.remainingCount));
    }
    async startMonitoringByType(symbol, timeframe, eventType) {
        switch (eventType) {
            case alert_1.MonitorEventType.BOLLINGER_BANDS_HIGH:
            case alert_1.MonitorEventType.BOLLINGER_BANDS_LOW:
                return this.startBollingerBandsMonitoring(symbol, timeframe, eventType);
            case alert_1.MonitorEventType.EMA_LOW:
            case alert_1.MonitorEventType.EMA_HIGH:
                return this.startEMACrossoverMonitoring(symbol, timeframe, eventType);
            case alert_1.MonitorEventType.RSI_LOW:
            case alert_1.MonitorEventType.RSI_CROSSOVER_HIGH:
                return this.startRSIMonitoring(symbol, timeframe, eventType);
            case alert_1.MonitorEventType.MACD_CROSSOVER_LOW:
            case alert_1.MonitorEventType.MACD_CROSSOVER_HIGH:
                return this.startMACDMonitoring(symbol, timeframe, eventType);
            default:
                this.logger.warn(`Unknown alert type: ${eventType}`);
                return null;
        }
    }
    startBollingerBandsMonitoring(symbol, timeframe, eventType) {
        const interval = setInterval(async () => {
            try {
                const alerts = this.activeAlerts
                    .get(symbol)
                    ?.get(timeframe)
                    ?.get(eventType);
                if (!alerts)
                    return;
                const bbData = await this.technicalAnalysisService.getBollingerBands(symbol, timeframe);
                const currentPrice = await this.priceMonitoringService.getCurrentPrice(symbol);
                const isTriggered = this.checkBollingerBandsCondition(currentPrice, bbData, eventType);
                if (isTriggered) {
                    return;
                }
                for (const [alertId, internalAlert] of alerts) {
                    try {
                        const alert = {
                            uuid: alertId,
                            symbol,
                            timeframe,
                            eventType,
                            count: internalAlert.remainingCount,
                            isActive: true,
                            userId: '1',
                            eternal: internalAlert.isEternal,
                        };
                        await this.triggerAlert(alert, internalAlert, {
                            currentPrice,
                            bbData,
                        });
                    }
                    catch (error) {
                        this.logger.error(`Error checking Bollinger Bands alert ${alertId}:`, error);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error in Bollinger Bands monitoring for ${symbol}:`, error);
            }
        }, this.getMonitoringInterval(timeframe));
        return interval;
    }
    startEMACrossoverMonitoring(symbol, timeframe, eventType) {
        const interval = setInterval(async () => {
            try {
                const alerts = this.activeAlerts
                    .get(symbol)
                    ?.get(timeframe)
                    ?.get(eventType);
                if (!alerts)
                    return;
                const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe);
                const isTriggered = this.checkEMACrossoverCondition(emaData, eventType);
                if (isTriggered) {
                    return;
                }
                for (const [alertId, internalAlert] of alerts) {
                    try {
                        const alert = {
                            uuid: alertId,
                            symbol,
                            timeframe,
                            eventType,
                            count: internalAlert.remainingCount,
                            isActive: true,
                            userId: '1',
                            eternal: internalAlert.isEternal,
                        };
                        await this.triggerAlert(alert, internalAlert, { emaData });
                    }
                    catch (error) {
                        this.logger.error(`Error checking EMA alert ${alertId}:`, error);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error in EMA crossover monitoring for ${symbol}:`, error);
            }
        }, this.getMonitoringInterval(timeframe));
        return interval;
    }
    startRSIMonitoring(symbol, timeframe, eventType) {
        const interval = setInterval(async () => {
            try {
                const alerts = this.activeAlerts
                    .get(symbol)
                    ?.get(timeframe)
                    ?.get(eventType);
                if (!alerts)
                    return;
                const rsiData = await this.technicalAnalysisService.getRSI(symbol, timeframe);
                for (const [alertId, internalAlert] of alerts) {
                    try {
                        const alert = await this.alertService.findOne(alertId);
                        if (alert &&
                            this.checkRSICondition(rsiData, eventType === alert_1.MonitorEventType.RSI_LOW ? 30 : 75, eventType)) {
                            await this.triggerAlert(alert, internalAlert, { rsiData });
                        }
                    }
                    catch (error) {
                        this.logger.error(`Error checking RSI alert ${alertId}:`, error);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error in RSI monitoring for ${symbol}:`, error);
            }
        }, this.getMonitoringInterval(timeframe));
        return interval;
    }
    startMACDMonitoring(symbol, timeframe, eventType) {
        const interval = setInterval(async () => {
            try {
                const alerts = this.activeAlerts
                    .get(symbol)
                    ?.get(timeframe)
                    ?.get(eventType);
                if (!alerts)
                    return;
                const macdData = await this.technicalAnalysisService.getMACD(symbol, timeframe);
                for (const [alertId, internalAlert] of alerts) {
                    try {
                        const alert = await this.alertService.findOne(alertId);
                        if (alert && this.checkMACDCondition(macdData, eventType)) {
                            await this.triggerAlert(alert, internalAlert, { macdData });
                        }
                    }
                    catch (error) {
                        this.logger.error(`Error checking MACD alert ${alertId}:`, error);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error in MACD monitoring for ${symbol}:`, error);
            }
        }, this.getMonitoringInterval(timeframe));
        return interval;
    }
    async triggerAlert(alert, internalAlert, triggerData) {
        try {
            await this.notificationService.emitAlertTriggered(alert, triggerData);
            this.logger.log(`Alert triggered: ${alert.symbol} - ${alert.eventType}`);
            if (!internalAlert.isEternal) {
                internalAlert.remainingCount--;
                if (internalAlert.remainingCount <= 0) {
                    this.logger.log(`Alert ${alert.uuid} has reached its trigger limit, stopping monitoring`);
                    await this.removeAlertFromMonitoring(alert.uuid);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error triggering alert ${alert.uuid}:`, error);
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
    checkBollingerBandsCondition(currentPrice, bbData, alertType) {
        const { upperBand, lowerBand } = bbData;
        if (alertType === alert_1.MonitorEventType.BOLLINGER_BANDS_HIGH) {
            return currentPrice > upperBand;
        }
        else if (alertType === alert_1.MonitorEventType.BOLLINGER_BANDS_LOW) {
            return currentPrice < lowerBand;
        }
        return false;
    }
    checkEMACrossoverCondition(emaData, alertType) {
        const { fastEMA, slowEMA, previousFastEMA, previousSlowEMA } = emaData;
        if (alertType === alert_1.MonitorEventType.EMA_HIGH) {
            return previousFastEMA <= previousSlowEMA && fastEMA > slowEMA;
        }
        else if (alertType === alert_1.MonitorEventType.EMA_LOW) {
            return previousFastEMA >= previousSlowEMA && fastEMA < slowEMA;
        }
        return false;
    }
    checkRSICondition(rsiData, rsiThreshold, alertType) {
        const { rsi } = rsiData;
        if (alertType === alert_1.MonitorEventType.RSI_LOW && rsi <= rsiThreshold) {
            return true;
        }
        else if (alertType === alert_1.MonitorEventType.RSI_CROSSOVER_HIGH &&
            rsi >= rsiThreshold) {
            return true;
        }
        return false;
    }
    checkMACDCondition(macdData, alertType) {
        const { macd, signal, histogram } = macdData;
        if (alertType === alert_1.MonitorEventType.MACD_CROSSOVER_HIGH) {
            return macd > signal && histogram > 0;
        }
        else if (alertType === alert_1.MonitorEventType.MACD_CROSSOVER_LOW) {
            return macd < signal && histogram < 0;
        }
        return false;
    }
    async loadActiveAlerts() {
        try {
            const activeAlerts = await this.alertService.findActiveAlerts();
            for (const alert of activeAlerts) {
                await this.addAlertToMonitoring(alert);
            }
            this.logger.log(`Loaded ${activeAlerts.length} active alerts`);
        }
        catch (error) {
            this.logger.error('Error loading active alerts:', error);
        }
    }
    async getActiveAlerts() {
        const alerts = [];
        for (const [symbol, timeframeMap] of this.activeAlerts) {
            for (const [timeframe, eventTypeMap] of timeframeMap) {
                for (const [eventType, alertMap] of eventTypeMap) {
                    for (const [alertId, internalAlert] of alertMap) {
                        try {
                            const alert = await this.alertService.findOne(alertId);
                            if (alert) {
                                alerts.push(alert);
                            }
                        }
                        catch (error) {
                            this.logger.error(`Error getting alert ${alertId}:`, error);
                        }
                    }
                }
            }
        }
        return alerts;
    }
    async getMonitoringStatus() {
        return {
            activeAlerts: this.activeAlerts.size,
            alertGroups: this.alertGroups.size,
            status: 'active',
        };
    }
    async getAlertsBySymbolAndTimeframe(symbol, timeframe) {
        const alerts = [];
        const timeframeMap = this.activeAlerts.get(symbol);
        if (timeframeMap) {
            const eventTypeMap = timeframeMap.get(timeframe);
            if (eventTypeMap) {
                for (const [eventType, alertMap] of eventTypeMap) {
                    for (const [alertId, internalAlert] of alertMap) {
                        try {
                            const alert = await this.alertService.findOne(alertId);
                            if (alert) {
                                alerts.push(alert);
                            }
                        }
                        catch (error) {
                            this.logger.error(`Error getting alert ${alertId}:`, error);
                        }
                    }
                }
            }
        }
        return alerts;
    }
    async getAlertsByMonitorType(monitorType) {
        const alerts = [];
        for (const [symbol, timeframeMap] of this.activeAlerts) {
            for (const [timeframe, eventTypeMap] of timeframeMap) {
                const alertMap = eventTypeMap.get(monitorType);
                if (alertMap) {
                    for (const [alertId, internalAlert] of alertMap) {
                        try {
                            const alert = await this.alertService.findOne(alertId);
                            if (alert) {
                                alerts.push(alert);
                            }
                        }
                        catch (error) {
                            this.logger.error(`Error getting alert ${alertId}:`, error);
                        }
                    }
                }
            }
        }
        return alerts;
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alert_1.AlertService,
        technical_analysis_service_1.TechnicalAnalysisService,
        price_monitoring_service_1.PriceMonitoringService,
        notification_service_1.NotificationService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map