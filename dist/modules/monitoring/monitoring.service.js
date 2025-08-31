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
var MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const technical_analysis_service_1 = require("./technical-analysis.service");
const price_monitoring_service_1 = require("./price-monitoring.service");
const monitoring_entity_1 = require("./monitoring.entity");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const alert_1 = require("../alert");
const event_emitter_1 = require("@nestjs/event-emitter");
const eventsType_1 = require("../../utils/constants/eventsType");
let MonitoringService = MonitoringService_1 = class MonitoringService {
    constructor(technicalAnalysisService, priceMonitoringService, eventEmitter, monitoringModel) {
        this.technicalAnalysisService = technicalAnalysisService;
        this.priceMonitoringService = priceMonitoringService;
        this.eventEmitter = eventEmitter;
        this.monitoringModel = monitoringModel;
        this.logger = new common_1.Logger(MonitoringService_1.name);
        this.monitorings = [];
    }
    onModuleInit() {
        this.logger.log('Monitoring service initialized');
        this.loadMonitorings();
    }
    async loadMonitorings() {
        try {
            this.monitorings = await this.monitoringModel.find().lean();
            this.monitorings.forEach((monitoring) => {
                monitoring.monitoringInterval = this.startMonitoringByType(monitoring);
            });
        }
        catch (error) {
            this.logger.error('Error loading monitorings:', error);
        }
    }
    onModuleDestroy() {
        this.logger.log('Cleaning up monitoring service...');
        for (const m of this.monitorings) {
            if (m.monitoringInterval)
                clearInterval(m.monitoringInterval);
        }
        this.logger.log('Monitoring service cleanup completed');
    }
    async addMonitoring(monitoring) {
        const existing = this.monitorings.find((m) => m.symbol === monitoring.symbol &&
            m.timeframe === monitoring.timeframe &&
            m.eventType === monitoring.eventType);
        if (existing) {
            if (existing.count === monitoring.count) {
                return this.logger.warn(`Monitoring already exists for ${monitoring.symbol} - ${monitoring.eventType} - ${monitoring.timeframe}`);
            }
            existing.count = monitoring.count;
            this.logger.log(`Updating monitoring for ${monitoring.symbol} - ${monitoring.eventType} - ${monitoring.timeframe}`, monitoring.count);
            await this.monitoringModel.updateOne({
                symbol: monitoring.symbol,
                timeframe: monitoring.timeframe,
                eventType: monitoring.eventType,
            }, { $set: { count: monitoring.count } });
        }
        else {
            this.monitorings.push(monitoring);
            monitoring.monitoringInterval = this.startMonitoringByType(monitoring);
            this.logger.log(`Started monitoring for ${monitoring.symbol} - ${monitoring.eventType} - ${monitoring.timeframe}`);
            await this.monitoringModel.create(monitoring);
        }
    }
    async removeMonitoring(symbol, timeframe, eventType) {
        const index = this.monitorings.findIndex((m) => m.symbol === symbol &&
            m.timeframe === timeframe &&
            m.eventType === eventType);
        if (index !== -1) {
            const monitoring = this.monitorings[index];
            if (monitoring.monitoringInterval) {
                clearInterval(monitoring.monitoringInterval);
            }
            this.monitorings.splice(index, 1);
            await this.monitoringModel.deleteOne({
                symbol,
                timeframe,
                eventType,
            });
            this.logger.log(`Stopped monitoring ${symbol} - ${eventType} - ${timeframe}`);
        }
    }
    startMonitoringByType(monitoring) {
        const { symbol, timeframe, eventType } = monitoring;
        this.logger.log(`Starting monitoring for ${symbol} - ${eventType} - ${timeframe}`);
        const interval = setInterval(async () => {
            try {
                let conditionMet = false;
                let triggerData = {};
                switch (eventType) {
                    case alert_1.MonitorEventType.BOLLINGER_BANDS_HIGH:
                    case alert_1.MonitorEventType.BOLLINGER_BANDS_LOW: {
                        const bbData = await this.technicalAnalysisService.getBollingerBands(symbol, timeframe);
                        const currentPrice = await this.priceMonitoringService.getCurrentPrice(symbol);
                        conditionMet = this.checkBollingerBandsCondition(currentPrice, bbData, eventType);
                        triggerData = { currentPrice, bbData };
                        break;
                    }
                    case alert_1.MonitorEventType.EMA_LOW:
                    case alert_1.MonitorEventType.EMA_HIGH: {
                        const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe);
                        conditionMet = this.checkEMACrossoverCondition(emaData, eventType);
                        triggerData = { emaData };
                        break;
                    }
                    case alert_1.MonitorEventType.RSI_LOW:
                    case alert_1.MonitorEventType.RSI_CROSSOVER_HIGH: {
                        const rsiData = await this.technicalAnalysisService.getRSI(symbol, timeframe);
                        conditionMet = this.checkRSICondition(rsiData, eventType === alert_1.MonitorEventType.RSI_LOW ? 30 : 75, eventType);
                        triggerData = { rsiData };
                        break;
                    }
                    case alert_1.MonitorEventType.MACD_CROSSOVER_LOW:
                    case alert_1.MonitorEventType.MACD_CROSSOVER_HIGH: {
                        const macdData = await this.technicalAnalysisService.getMACD(symbol, timeframe);
                        conditionMet = this.checkMACDCondition(macdData, eventType);
                        triggerData = { macdData };
                        break;
                    }
                }
                if (conditionMet) {
                    await this.triggerAlert(monitoring, triggerData);
                }
            }
            catch (error) {
                this.logger.error(`Error in monitoring for ${symbol} - ${eventType}:`, error);
            }
        }, this.getMonitoringInterval(timeframe));
        return interval;
    }
    async triggerAlert(monitoring, triggerData) {
        try {
            this.eventEmitter.emit(eventsType_1.EventsType.MONITORING_TRIGGERED, {
                monitoring,
                triggerData,
            });
            this.logger.log(`Alert triggered: ${monitoring.symbol} - ${monitoring.eventType}`);
            if (monitoring.count !== 'INFINITE') {
                monitoring.count = (parseInt(monitoring.count) - 1).toString();
                await this.monitoringModel.updateOne({
                    symbol: monitoring.symbol,
                    timeframe: monitoring.timeframe,
                    eventType: monitoring.eventType,
                }, { $set: { count: monitoring.count } });
                if (parseInt(monitoring.count) <= 0) {
                    await this.removeMonitoring(monitoring.symbol, monitoring.timeframe, monitoring.eventType);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error triggering alert for ${monitoring.symbol} - ${monitoring.eventType}:`, error);
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
    checkBollingerBandsCondition(currentPrice, bbData, alertType) {
        if (!bbData || typeof currentPrice !== 'number')
            return false;
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
        if (!emaData)
            return false;
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
        if (!rsiData)
            return false;
        const { rsi } = rsiData;
        if (alertType === alert_1.MonitorEventType.RSI_LOW)
            return rsi <= rsiThreshold;
        if (alertType === alert_1.MonitorEventType.RSI_CROSSOVER_HIGH)
            return rsi >= rsiThreshold;
        return false;
    }
    checkMACDCondition(macdData, alertType) {
        if (!macdData)
            return false;
        const { macd, signal, histogram } = macdData;
        if (alertType === alert_1.MonitorEventType.MACD_CROSSOVER_HIGH)
            return macd > signal && histogram > 0;
        if (alertType === alert_1.MonitorEventType.MACD_CROSSOVER_LOW)
            return macd < signal && histogram < 0;
        return false;
    }
    async getMonitoringStatus() {
        return {
            active: this.monitorings.length,
            status: 'running',
        };
    }
    async getAllMonitorings() {
        return this.monitorings;
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, mongoose_2.InjectModel)(monitoring_entity_1.Monitoring.name)),
    __metadata("design:paramtypes", [technical_analysis_service_1.TechnicalAnalysisService,
        price_monitoring_service_1.PriceMonitoringService,
        event_emitter_1.EventEmitter2,
        mongoose_1.Model])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map