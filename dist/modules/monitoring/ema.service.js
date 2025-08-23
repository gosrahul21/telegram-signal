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
var EMAService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAService = void 0;
const common_1 = require("@nestjs/common");
const technical_analysis_service_1 = require("./technical-analysis.service");
let EMAService = EMAService_1 = class EMAService {
    constructor(technicalAnalysisService) {
        this.technicalAnalysisService = technicalAnalysisService;
        this.logger = new common_1.Logger(EMAService_1.name);
    }
    async checkEMACrossoverConditions(symbol, timeframe, conditions) {
        try {
            const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe, conditions.fastPeriod || 12, conditions.slowPeriod || 26);
            const { fastEMA, slowEMA, previousFastEMA, previousSlowEMA, crossover } = emaData;
            let triggered = false;
            let message = '';
            if (conditions.crossover === 'bullish' && crossover === 'bullish') {
                triggered = true;
                message = `Bullish EMA crossover detected for ${symbol}`;
            }
            else if (conditions.crossover === 'bearish' && crossover === 'bearish') {
                triggered = true;
                message = `Bearish EMA crossover detected for ${symbol}`;
            }
            if (conditions.position === 'above' && fastEMA > slowEMA) {
                triggered = true;
                message = `Fast EMA above slow EMA detected for ${symbol}`;
            }
            else if (conditions.position === 'below' && fastEMA < slowEMA) {
                triggered = true;
                message = `Fast EMA below slow EMA detected for ${symbol}`;
            }
            if (conditions.distance && conditions.distanceType) {
                const distance = Math.abs(fastEMA - slowEMA) / slowEMA * 100;
                switch (conditions.distanceType) {
                    case 'above':
                        if (distance > conditions.distance) {
                            triggered = true;
                            message = `EMA distance above ${conditions.distance}% detected for ${symbol}`;
                        }
                        break;
                    case 'below':
                        if (distance < conditions.distance) {
                            triggered = true;
                            message = `EMA distance below ${conditions.distance}% detected for ${symbol}`;
                        }
                        break;
                }
            }
            if (conditions.trendStrength && await this.checkTrendStrength(emaData, conditions.trendStrength)) {
                triggered = true;
                message = `Strong EMA trend detected for ${symbol}`;
            }
            return {
                triggered,
                data: emaData,
                message,
            };
        }
        catch (error) {
            this.logger.error(`Error checking EMA crossover conditions for ${symbol}:`, error);
            throw error;
        }
    }
    async checkTrendStrength(emaData, requiredStrength) {
        try {
            const { fastEMA, slowEMA } = emaData;
            const distance = Math.abs(fastEMA - slowEMA) / slowEMA * 100;
            return distance > requiredStrength;
        }
        catch (error) {
            this.logger.error('Error checking trend strength:', error);
            return false;
        }
    }
    async getEMAAnalysis(symbol, timeframe) {
        try {
            const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe);
            const { fastEMA, slowEMA, crossover } = emaData;
            let analysis = '';
            let recommendation = '';
            let risk = 'medium';
            if (fastEMA > slowEMA) {
                analysis = 'Fast EMA is above slow EMA, indicating bullish trend.';
                recommendation = 'Consider long positions or holding existing long positions.';
                risk = 'low';
            }
            else {
                analysis = 'Fast EMA is below slow EMA, indicating bearish trend.';
                recommendation = 'Consider short positions or reducing long positions.';
                risk = 'high';
            }
            if (crossover === 'bullish') {
                analysis += ' Recent bullish crossover detected, confirming trend change.';
                recommendation += ' Trend change confirmed, consider entering long positions.';
                risk = 'low';
            }
            else if (crossover === 'bearish') {
                analysis += ' Recent bearish crossover detected, confirming trend change.';
                recommendation += ' Trend change confirmed, consider entering short positions.';
                risk = 'high';
            }
            else {
                analysis += ' No recent crossover, trend continues.';
                recommendation += ' Follow existing trend direction.';
                risk = 'medium';
            }
            const distance = Math.abs(fastEMA - slowEMA) / slowEMA * 100;
            if (distance > 5) {
                analysis += ' Strong trend with significant EMA separation.';
                recommendation += ' Trend is strong, consider adding to positions.';
                risk = 'low';
            }
            else if (distance < 1) {
                analysis += ' Weak trend with minimal EMA separation.';
                recommendation += ' Trend is weak, be cautious of potential reversal.';
                risk = 'medium';
            }
            else {
                analysis += ' Moderate trend strength.';
                recommendation += ' Standard trend following strategies apply.';
                risk = 'medium';
            }
            return {
                analysis,
                recommendation,
                risk,
                data: emaData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting EMA analysis for ${symbol}:`, error);
            throw error;
        }
    }
    async getEMASignals(symbol, timeframe) {
        try {
            const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe);
            const { fastEMA, slowEMA, crossover } = emaData;
            const signals = [];
            let strength = 'weak';
            if (fastEMA > slowEMA) {
                signals.push('BUY');
                if (crossover === 'bullish') {
                    signals.push('STRONG_BUY');
                    strength = 'strong';
                }
                else {
                    strength = 'moderate';
                }
            }
            else {
                signals.push('SELL');
                if (crossover === 'bearish') {
                    signals.push('STRONG_SELL');
                    strength = 'strong';
                }
                else {
                    strength = 'moderate';
                }
            }
            const distance = Math.abs(fastEMA - slowEMA) / slowEMA * 100;
            if (distance > 5) {
                signals.push('STRONG_TREND');
                strength = 'strong';
            }
            else if (distance > 2) {
                signals.push('MODERATE_TREND');
                strength = 'moderate';
            }
            else {
                signals.push('WEAK_TREND');
                strength = 'weak';
            }
            if (crossover === 'bullish') {
                signals.push('BULLISH_MOMENTUM');
            }
            else if (crossover === 'bearish') {
                signals.push('BEARISH_MOMENTUM');
            }
            if (distance < 1) {
                signals.push('REVERSAL_WARNING');
            }
            return {
                signals,
                strength,
                data: emaData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting EMA signals for ${symbol}:`, error);
            throw error;
        }
    }
    async getEMALevels(symbol, timeframe) {
        try {
            const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe);
            const { fastEMA, slowEMA } = emaData;
            const distance = Math.abs(fastEMA - slowEMA);
            const distancePercent = (distance / slowEMA) * 100;
            return {
                fastEMA,
                slowEMA,
                distance,
                distancePercent,
                data: emaData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting EMA levels for ${symbol}:`, error);
            throw error;
        }
    }
    async getMultipleEMAs(symbol, timeframe, periods = [9, 21, 50, 200]) {
        try {
            const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe);
            const emas = {
                'fast': emaData.fastEMA,
                'slow': emaData.slowEMA,
            };
            let analysis = '';
            if (emas.fast > emas.slow) {
                analysis = 'EMAs are aligned bullishly (shorter > longer).';
            }
            else {
                analysis = 'EMAs are aligned bearishly (shorter < longer).';
            }
            return {
                emas,
                analysis,
                data: emaData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting multiple EMAs for ${symbol}:`, error);
            throw error;
        }
    }
};
exports.EMAService = EMAService;
exports.EMAService = EMAService = EMAService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_analysis_service_1.TechnicalAnalysisService])
], EMAService);
//# sourceMappingURL=ema.service.js.map