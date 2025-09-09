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
var TechnicalAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const price_monitoring_service_1 = require("./price-monitoring.service");
let TechnicalAnalysisService = TechnicalAnalysisService_1 = class TechnicalAnalysisService {
    constructor(priceMonitoringService) {
        this.priceMonitoringService = priceMonitoringService;
        this.logger = new common_1.Logger(TechnicalAnalysisService_1.name);
    }
    async getBollingerBands(symbol, timeframe, period = 20, stdDev = 2) {
        try {
            const prices = await this.priceMonitoringService.getHistoricalPrices(symbol, timeframe, period + 1);
            if (prices.length < period) {
                throw new Error(`Insufficient data for Bollinger Bands calculation. Need ${period}, got ${prices.length}`);
            }
            const sma = this.calculateSMA(prices, period);
            const variance = this.calculateVariance(prices, sma, period);
            const standardDeviation = Math.sqrt(variance);
            const upperBand = sma + standardDeviation * stdDev;
            const lowerBand = sma - standardDeviation * stdDev;
            const middleBand = sma;
            return {
                upperBand,
                lowerBand,
                middleBand,
                standardDeviation,
                period,
                stdDev,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Error calculating Bollinger Bands for ${symbol}:`, error);
            throw error;
        }
    }
    async getEMACrossover(symbol, timeframe, fastPeriod = 12, slowPeriod = 26) {
        try {
            const prices = await this.priceMonitoringService.getHistoricalPrices(symbol, timeframe, Math.max(fastPeriod, slowPeriod) + 1);
            if (prices.length < Math.max(fastPeriod, slowPeriod)) {
                throw new Error(`Insufficient data for EMA crossover calculation`);
            }
            const fastEMA = this.calculateEMA(prices, fastPeriod);
            const slowEMA = this.calculateEMA(prices, slowPeriod);
            const previousPrices = await this.priceMonitoringService.getHistoricalPrices(symbol, timeframe, Math.max(fastPeriod, slowPeriod) + 2);
            const previousFastEMA = this.calculateEMA(previousPrices.slice(0, -1), fastPeriod);
            const previousSlowEMA = this.calculateEMA(previousPrices.slice(0, -1), slowPeriod);
            return {
                fastEMA,
                slowEMA,
                previousFastEMA,
                previousSlowEMA,
                fastPeriod,
                slowPeriod,
                crossover: this.detectCrossover(previousFastEMA, previousSlowEMA, fastEMA, slowEMA),
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Error calculating EMA crossover for ${symbol}:`, error);
            throw error;
        }
    }
    async getRSI(symbol, timeframe, period = 14) {
        try {
            const prices = await this.priceMonitoringService.getHistoricalPrices(symbol, timeframe, period + 1);
            if (prices.length < period + 1) {
                throw new Error(`Insufficient data for RSI calculation. Need ${period + 1}, got ${prices.length}`);
            }
            const gains = [];
            const losses = [];
            for (let i = 1; i < prices.length; i++) {
                const change = prices[i] - prices[i - 1];
                gains.push(change > 0 ? change : 0);
                losses.push(change < 0 ? Math.abs(change) : 0);
            }
            const avgGain = this.calculateEMA(gains, period);
            const avgLoss = this.calculateEMA(losses, period);
            const rs = avgGain / avgLoss;
            const rsi = 100 - 100 / (1 + rs);
            return {
                rsi,
                period,
                avgGain,
                avgLoss,
                rs,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Error calculating RSI for ${symbol}:`, error);
            throw error;
        }
    }
    async getMACD(symbol, timeframe, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        try {
            const prices = await this.priceMonitoringService.getHistoricalPrices(symbol, timeframe, slowPeriod + signalPeriod);
            if (prices.length < slowPeriod + signalPeriod) {
                throw new Error(`Insufficient data for MACD calculation`);
            }
            const fastEMA = this.calculateEMA(prices, fastPeriod);
            const slowEMA = this.calculateEMA(prices, slowPeriod);
            const macd = fastEMA - slowEMA;
            const macdValues = [];
            for (let i = 0; i < prices.length - slowPeriod; i++) {
                const fastEMAValue = this.calculateEMA(prices.slice(i, i + slowPeriod), fastPeriod);
                const slowEMAValue = this.calculateEMA(prices.slice(i, i + slowPeriod), slowPeriod);
                macdValues.push(fastEMAValue - slowEMAValue);
            }
            const signal = this.calculateEMA(macdValues, signalPeriod);
            const histogram = macd - signal;
            return {
                macd,
                signal,
                histogram,
                fastPeriod,
                slowPeriod,
                signalPeriod,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Error calculating MACD for ${symbol}:`, error);
            throw error;
        }
    }
    async getStochastic(symbol, timeframe, kPeriod = 14, dPeriod = 3) {
        try {
            const prices = await this.priceMonitoringService.getHistoricalPrices(symbol, timeframe, kPeriod + dPeriod);
            if (prices.length < kPeriod + dPeriod) {
                throw new Error(`Insufficient data for Stochastic calculation`);
            }
            const kValues = [];
            for (let i = kPeriod - 1; i < prices.length; i++) {
                const periodPrices = prices.slice(i - kPeriod + 1, i + 1);
                const highest = Math.max(...periodPrices);
                const lowest = Math.min(...periodPrices);
                const current = prices[i];
                const k = ((current - lowest) / (highest - lowest)) * 100;
                kValues.push(k);
            }
            const k = kValues[kValues.length - 1];
            const d = this.calculateSMA(kValues, dPeriod);
            return {
                k,
                d,
                kPeriod,
                dPeriod,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Error calculating Stochastic for ${symbol}:`, error);
            throw error;
        }
    }
    async getPriceAction(symbol, timeframe, period = 5) {
        try {
            const prices = await this.priceMonitoringService.getHistoricalPrices(symbol, timeframe, period + 1);
            if (prices.length < period + 1) {
                throw new Error(`Insufficient data for price action analysis`);
            }
            const patterns = this.detectPricePatterns(prices);
            const support = this.findSupportLevel(prices);
            const resistance = this.findResistanceLevel(prices);
            return {
                patterns,
                support,
                resistance,
                period,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Error calculating price action for ${symbol}:`, error);
            throw error;
        }
    }
    calculateSMA(prices, period) {
        const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
        return sum / period;
    }
    calculateEMA(prices, period) {
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        for (let i = 1; i < prices.length; i++) {
            ema = prices[i] * multiplier + ema * (1 - multiplier);
        }
        return ema;
    }
    calculateVariance(prices, mean, period) {
        const squaredDifferences = prices
            .slice(-period)
            .map((price) => Math.pow(price - mean, 2));
        const sum = squaredDifferences.reduce((acc, diff) => acc + diff, 0);
        return sum / period;
    }
    detectCrossover(prevFast, prevSlow, currFast, currSlow) {
        if (prevFast <= prevSlow && currFast > currSlow) {
            return 'bullish';
        }
        else if (prevFast >= prevSlow && currFast < currSlow) {
            return 'bearish';
        }
        return null;
    }
    detectPricePatterns(prices) {
        const patterns = [];
        if (this.isDoubleTop(prices)) {
            patterns.push('double_top');
        }
        if (this.isDoubleBottom(prices)) {
            patterns.push('double_bottom');
        }
        if (this.isHeadAndShoulders(prices)) {
            patterns.push('head_and_shoulders');
        }
        if (this.isTriangle(prices)) {
            patterns.push('triangle');
        }
        return patterns;
    }
    isDoubleTop(prices) {
        const peaks = this.findPeaks(prices);
        return peaks.length >= 2 && Math.abs(peaks[0] - peaks[1]) < 0.01;
    }
    isDoubleBottom(prices) {
        const troughs = this.findTroughs(prices);
        return troughs.length >= 2 && Math.abs(troughs[0] - troughs[1]) < 0.01;
    }
    isHeadAndShoulders(prices) {
        const peaks = this.findPeaks(prices);
        if (peaks.length < 3)
            return false;
        const [left, head, right] = peaks.slice(-3);
        return head > left && head > right && Math.abs(left - right) < 0.02;
    }
    isTriangle(prices) {
        const highs = this.findPeaks(prices);
        const lows = this.findTroughs(prices);
        if (highs.length < 2 || lows.length < 2)
            return false;
        const highSlope = (highs[1] - highs[0]) / (highs.length - 1);
        const lowSlope = (lows[1] - lows[0]) / (lows.length - 1);
        return highSlope < 0 && lowSlope > 0;
    }
    findPeaks(prices) {
        const peaks = [];
        for (let i = 1; i < prices.length - 1; i++) {
            if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
                peaks.push(prices[i]);
            }
        }
        return peaks;
    }
    findTroughs(prices) {
        const troughs = [];
        for (let i = 1; i < prices.length - 1; i++) {
            if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
                troughs.push(prices[i]);
            }
        }
        return troughs;
    }
    findSupportLevel(prices) {
        const troughs = this.findTroughs(prices);
        return troughs.length > 0 ? Math.min(...troughs) : Math.min(...prices);
    }
    findResistanceLevel(prices) {
        const peaks = this.findPeaks(prices);
        return peaks.length > 0 ? Math.max(...peaks) : Math.max(...prices);
    }
};
exports.TechnicalAnalysisService = TechnicalAnalysisService;
exports.TechnicalAnalysisService = TechnicalAnalysisService = TechnicalAnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [price_monitoring_service_1.PriceMonitoringService])
], TechnicalAnalysisService);
//# sourceMappingURL=technical-analysis.service.js.map