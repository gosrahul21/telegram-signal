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
var RSIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSIService = void 0;
const common_1 = require("@nestjs/common");
const technical_analysis_service_1 = require("./technical-analysis.service");
let RSIService = RSIService_1 = class RSIService {
    constructor(technicalAnalysisService) {
        this.technicalAnalysisService = technicalAnalysisService;
        this.logger = new common_1.Logger(RSIService_1.name);
    }
    async checkRSIConditions(symbol, timeframe, conditions) {
        try {
            const rsiData = await this.technicalAnalysisService.getRSI(symbol, timeframe, conditions.period || 14);
            const { rsi } = rsiData;
            let triggered = false;
            let message = '';
            if (conditions.oversold && rsi < conditions.oversold) {
                triggered = true;
                message = `RSI oversold condition detected for ${symbol} (RSI: ${rsi.toFixed(2)})`;
            }
            if (conditions.overbought && rsi > conditions.overbought) {
                triggered = true;
                message = `RSI overbought condition detected for ${symbol} (RSI: ${rsi.toFixed(2)})`;
            }
            if (conditions.rsiLevel && conditions.condition) {
                switch (conditions.condition) {
                    case 'above':
                        if (rsi > conditions.rsiLevel) {
                            triggered = true;
                            message = `RSI above ${conditions.rsiLevel} detected for ${symbol} (RSI: ${rsi.toFixed(2)})`;
                        }
                        break;
                    case 'below':
                        if (rsi < conditions.rsiLevel) {
                            triggered = true;
                            message = `RSI below ${conditions.rsiLevel} detected for ${symbol} (RSI: ${rsi.toFixed(2)})`;
                        }
                        break;
                    case 'equals':
                        if (Math.abs(rsi - conditions.rsiLevel) < 0.5) {
                            triggered = true;
                            message = `RSI at ${conditions.rsiLevel} detected for ${symbol} (RSI: ${rsi.toFixed(2)})`;
                        }
                        break;
                }
            }
            if (conditions.divergence && await this.checkRSIDivergence(symbol, timeframe, rsiData)) {
                triggered = true;
                message = `RSI divergence detected for ${symbol}`;
            }
            if (conditions.momentum && await this.checkRSIMomentum(symbol, timeframe, rsiData)) {
                triggered = true;
                message = `RSI momentum condition detected for ${symbol}`;
            }
            return {
                triggered,
                data: rsiData,
                message,
            };
        }
        catch (error) {
            this.logger.error(`Error checking RSI conditions for ${symbol}:`, error);
            throw error;
        }
    }
    async checkRSIDivergence(symbol, timeframe, rsiData) {
        try {
            const { rsi } = rsiData;
            return rsi < 20 || rsi > 80;
        }
        catch (error) {
            this.logger.error(`Error checking RSI divergence for ${symbol}:`, error);
            return false;
        }
    }
    async checkRSIMomentum(symbol, timeframe, rsiData) {
        try {
            const { rsi } = rsiData;
            return rsi > 70 || rsi < 30;
        }
        catch (error) {
            this.logger.error(`Error checking RSI momentum for ${symbol}:`, error);
            return false;
        }
    }
    async getRSIAnalysis(symbol, timeframe) {
        try {
            const rsiData = await this.technicalAnalysisService.getRSI(symbol, timeframe);
            const { rsi } = rsiData;
            let analysis = '';
            let recommendation = '';
            let risk = 'medium';
            if (rsi < 20) {
                analysis = 'RSI indicates extremely oversold conditions, suggesting potential reversal.';
                recommendation = 'Consider buying or setting long positions. Look for bullish candlestick patterns.';
                risk = 'low';
            }
            else if (rsi < 30) {
                analysis = 'RSI indicates oversold conditions, suggesting potential buying opportunity.';
                recommendation = 'Consider buying with tight stops. Monitor for reversal signals.';
                risk = 'low';
            }
            else if (rsi > 80) {
                analysis = 'RSI indicates extremely overbought conditions, suggesting potential reversal.';
                recommendation = 'Consider selling or setting short positions. Look for bearish candlestick patterns.';
                risk = 'high';
            }
            else if (rsi > 70) {
                analysis = 'RSI indicates overbought conditions, suggesting potential selling opportunity.';
                recommendation = 'Consider selling with tight stops. Monitor for reversal signals.';
                risk = 'high';
            }
            else {
                analysis = 'RSI is in neutral territory, indicating balanced market conditions.';
                recommendation = 'Monitor for breakout or breakdown signals. Consider range trading strategies.';
                risk = 'medium';
            }
            if (rsi > 50) {
                analysis += ' RSI is above 50, indicating bullish momentum.';
                recommendation += ' Trend is favorable for long positions.';
            }
            else {
                analysis += ' RSI is below 50, indicating bearish momentum.';
                recommendation += ' Trend is unfavorable for long positions.';
            }
            return {
                analysis,
                recommendation,
                risk,
                data: rsiData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting RSI analysis for ${symbol}:`, error);
            throw error;
        }
    }
    async getRSISignals(symbol, timeframe) {
        try {
            const rsiData = await this.technicalAnalysisService.getRSI(symbol, timeframe);
            const { rsi } = rsiData;
            const signals = [];
            let strength = 'weak';
            if (rsi < 20) {
                signals.push('STRONG_BUY');
                signals.push('OVERSOLD');
                strength = 'strong';
            }
            else if (rsi < 30) {
                signals.push('BUY');
                signals.push('OVERSOLD');
                strength = 'moderate';
            }
            else if (rsi > 80) {
                signals.push('STRONG_SELL');
                signals.push('OVERBOUGHT');
                strength = 'strong';
            }
            else if (rsi > 70) {
                signals.push('SELL');
                signals.push('OVERBOUGHT');
                strength = 'moderate';
            }
            else if (rsi > 50) {
                signals.push('BULLISH_MOMENTUM');
                strength = 'weak';
            }
            else {
                signals.push('BEARISH_MOMENTUM');
                strength = 'weak';
            }
            if (rsi > 60) {
                signals.push('BULLISH_TREND');
            }
            else if (rsi < 40) {
                signals.push('BEARISH_TREND');
            }
            if (rsi < 25 || rsi > 75) {
                signals.push('REVERSAL_WARNING');
            }
            return {
                signals,
                strength,
                data: rsiData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting RSI signals for ${symbol}:`, error);
            throw error;
        }
    }
    async getRSILevels(symbol, timeframe) {
        try {
            const rsiData = await this.technicalAnalysisService.getRSI(symbol, timeframe);
            return {
                oversold: 30,
                overbought: 70,
                neutral: {
                    low: 30,
                    high: 70,
                },
                data: rsiData,
            };
        }
        catch (error) {
            this.logger.error(`Error getting RSI levels for ${symbol}:`, error);
            throw error;
        }
    }
};
exports.RSIService = RSIService;
exports.RSIService = RSIService = RSIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_analysis_service_1.TechnicalAnalysisService])
], RSIService);
//# sourceMappingURL=rsi.service.js.map