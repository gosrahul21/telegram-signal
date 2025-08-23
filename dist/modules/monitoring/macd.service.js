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
var MACDService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MACDService = void 0;
const common_1 = require("@nestjs/common");
const technical_analysis_service_1 = require("./technical-analysis.service");
let MACDService = MACDService_1 = class MACDService {
    constructor(technicalAnalysisService) {
        this.technicalAnalysisService = technicalAnalysisService;
        this.logger = new common_1.Logger(MACDService_1.name);
    }
    async checkMACDConditions(symbol, timeframe, conditions) {
        try {
            const macdData = await this.technicalAnalysisService.getMACD(symbol, timeframe, conditions.fastPeriod || 12, conditions.slowPeriod || 26, conditions.signalPeriod || 9);
            const { macd, signal, histogram } = macdData;
            let triggered = false;
            let message = '';
            if (conditions.crossover === 'bullish' && macd > signal && histogram > 0) {
                triggered = true;
                message = `Bullish MACD crossover detected for ${symbol}`;
            }
            else if (conditions.crossover === 'bearish' && macd < signal && histogram < 0) {
                triggered = true;
                message = `Bearish MACD crossover detected for ${symbol}`;
            }
            if (conditions.histogramPositive && histogram > 0) {
                triggered = true;
                message = `Positive MACD histogram detected for ${symbol}`;
            }
            else if (conditions.histogramNegative && histogram < 0) {
                triggered = true;
                message = `Negative MACD histogram detected for ${symbol}`;
            }
            if (conditions.divergence && await this.checkMACDDivergence(symbol, timeframe, macdData)) {
                triggered = true;
                message = `MACD divergence detected for ${symbol}`;
            }
            if (conditions.overbought && macd > conditions.overboughtThreshold) {
                triggered = true;
                message = `MACD overbought condition detected for ${symbol}`;
            }
            else if (conditions.oversold && macd < conditions.oversoldThreshold) {
                triggered = true;
                message = `MACD oversold condition detected for ${symbol}`;
            }
            return {
                triggered,
                data: macdData,
                message,
            };
        }
        catch (error) {
            this.logger.error(`Error checking MACD conditions for ${symbol}:`, error);
            throw error;
        }
    }
    async checkMACDDivergence(symbol, timeframe, macdData) {
        try {
            const { macd, signal } = macdData;
            const macdChange = Math.abs(macd - signal);
            const threshold = 0.001;
            return macdChange > threshold;
        }
        catch (error) {
            this.logger.error(`Error checking MACD divergence for ${symbol}:`, error);
            return false;
        }
    }
    async getMACDAnalysis(symbol, timeframe) {
        try {
            const macdData = await this.technicalAnalysisService.getMACD(symbol, timeframe);
            const { macd, signal, histogram } = macdData;
            let analysis = '';
            let recommendation = '';
            let risk = 'medium';
            if (macd > signal) {
                analysis = 'MACD is above signal line, indicating bullish momentum.';
                recommendation = 'Consider long positions or holding existing long positions.';
                risk = 'low';
            }
            else {
                analysis = 'MACD is below signal line, indicating bearish momentum.';
                recommendation = 'Consider short positions or reducing long positions.';
                risk = 'high';
            }
            if (histogram > 0 && histogram > Math.abs(histogram * 0.1)) {
                analysis += ' Histogram is positive and growing, confirming bullish momentum.';
                recommendation += ' Momentum is strong, consider adding to positions.';
                risk = 'low';
            }
            else if (histogram < 0 && Math.abs(histogram) > Math.abs(histogram * 0.1)) {
                analysis += ' Histogram is negative and growing, confirming bearish momentum.';
                recommendation += ' Momentum is strong, consider reducing positions.';
                risk = 'high';
            }
            else {
                analysis += ' Histogram is weak, indicating potential reversal or consolidation.';
                recommendation += ' Be cautious, momentum may be changing.';
                risk = 'medium';
            }
            if (Math.abs(macd) > 0.05) {
                analysis += ' MACD is at extreme levels, suggesting potential reversal.';
                recommendation += ' Consider taking profits or setting tighter stops.';
                risk = 'high';
            }
            return {
                analysis,
                recommendation,
                risk,
                data: macdData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting MACD analysis for ${symbol}:`, error);
            throw error;
        }
    }
    async getMACDSignals(symbol, timeframe) {
        try {
            const macdData = await this.technicalAnalysisService.getMACD(symbol, timeframe);
            const { macd, signal, histogram } = macdData;
            const signals = [];
            let strength = 'weak';
            if (macd > signal) {
                signals.push('BUY');
                if (histogram > 0) {
                    signals.push('STRONG_BUY');
                    strength = 'strong';
                }
                else {
                    strength = 'moderate';
                }
            }
            else {
                signals.push('SELL');
                if (histogram < 0) {
                    signals.push('STRONG_SELL');
                    strength = 'strong';
                }
                else {
                    strength = 'moderate';
                }
            }
            if (Math.abs(histogram) > 0.01) {
                signals.push('MOMENTUM');
            }
            if (Math.abs(macd) > 0.05) {
                signals.push('REVERSAL_WARNING');
            }
            return {
                signals,
                strength,
                data: macdData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting MACD signals for ${symbol}:`, error);
            throw error;
        }
    }
};
exports.MACDService = MACDService;
exports.MACDService = MACDService = MACDService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_analysis_service_1.TechnicalAnalysisService])
], MACDService);
//# sourceMappingURL=macd.service.js.map