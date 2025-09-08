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
var PriceMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceMonitoringService = void 0;
const binance_price_api_service_1 = require("../../services/binance-price-api.service");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PriceMonitoringService = PriceMonitoringService_1 = class PriceMonitoringService {
    constructor(configService, binancePriceApiService) {
        this.configService = configService;
        this.binancePriceApiService = binancePriceApiService;
        this.logger = new common_1.Logger(PriceMonitoringService_1.name);
        this.priceCache = new Map();
        this.historicalCache = new Map();
        this.CACHE_DURATION = 30 * 1000;
        this.HISTORICAL_CACHE_DURATION = 5 * 60 * 1000;
    }
    async getCurrentPrice(symbol) {
        try {
            const cached = this.priceCache.get(symbol);
            if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
                return cached.price;
            }
            const price = await this.fetchCurrentPriceFromAPI(symbol);
            this.priceCache.set(symbol, {
                price,
                timestamp: Date.now(),
            });
            return price;
        }
        catch (error) {
            this.logger.error(`Error fetching current price for ${symbol}:`, error);
            const cached = this.priceCache.get(symbol);
            if (cached) {
                this.logger.warn(`Using cached price for ${symbol}: ${cached.price}`);
                return cached.price;
            }
            throw error;
        }
    }
    async getHistoricalPrices(symbol, timeframe, limit = 100) {
        try {
            const cacheKey = `${symbol}_${timeframe}_${limit}`;
            const cached = this.historicalCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.HISTORICAL_CACHE_DURATION) {
                return cached.data;
            }
            const prices = await this.binancePriceApiService.fetchBinanceCandleData(symbol, timeframe);
            this.historicalCache.set(cacheKey, {
                data: prices,
                timestamp: Date.now(),
            });
            return prices;
        }
        catch (error) {
            this.logger.error(`Error fetching historical prices for ${symbol}:`, error);
            const cached = this.historicalCache.get(`${symbol}_${timeframe}_${limit}`);
            if (cached) {
                this.logger.warn(`Using cached historical data for ${symbol}`);
                return cached.data;
            }
            throw error;
        }
    }
    async getHistoricalVolumes(symbol, timeframe, limit = 100) {
        try {
            const cacheKey = `volume_${symbol}_${timeframe}_${limit}`;
            const cached = this.historicalCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.HISTORICAL_CACHE_DURATION) {
                return cached.data;
            }
            const volumes = await this.fetchHistoricalVolumesFromAPI(symbol, timeframe, limit);
            this.historicalCache.set(cacheKey, {
                data: volumes,
                timestamp: Date.now(),
            });
            return volumes;
        }
        catch (error) {
            this.logger.error(`Error fetching historical volumes for ${symbol}:`, error);
            const cached = this.historicalCache.get(`volume_${symbol}_${timeframe}_${limit}`);
            if (cached) {
                this.logger.warn(`Using cached volume data for ${symbol}`);
                return cached.data;
            }
            throw error;
        }
    }
    async getPriceChange(symbol, timeframe) {
        try {
            const prices = await this.getHistoricalPrices(symbol, timeframe, 2);
            if (prices.length < 2) {
                throw new Error('Insufficient price data for change calculation');
            }
            const currentPrice = prices[prices.length - 1];
            const previousPrice = prices[prices.length - 2];
            const change = currentPrice - previousPrice;
            const changePercent = (change / previousPrice) * 100;
            return {
                currentPrice,
                previousPrice,
                change,
                changePercent,
            };
        }
        catch (error) {
            this.logger.error(`Error calculating price change for ${symbol}:`, error);
            throw error;
        }
    }
    async getPriceRange(symbol, timeframe, period = 24) {
        try {
            const prices = await this.getHistoricalPrices(symbol, timeframe, period);
            if (prices.length < period) {
                throw new Error('Insufficient price data for range calculation');
            }
            const high = Math.max(...prices);
            const low = Math.min(...prices);
            const open = prices[0];
            const close = prices[prices.length - 1];
            const range = high - low;
            const rangePercent = (range / low) * 100;
            return {
                high,
                low,
                open,
                close,
                range,
                rangePercent,
            };
        }
        catch (error) {
            this.logger.error(`Error calculating price range for ${symbol}:`, error);
            throw error;
        }
    }
    async getVolatility(symbol, timeframe, period = 20) {
        try {
            const prices = await this.getHistoricalPrices(symbol, timeframe, period);
            if (prices.length < period) {
                throw new Error('Insufficient price data for volatility calculation');
            }
            const returns = [];
            for (let i = 1; i < prices.length; i++) {
                const returnValue = (prices[i] - prices[i - 1]) / prices[i - 1];
                returns.push(returnValue);
            }
            const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
            const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
            const standardDeviation = Math.sqrt(variance);
            const volatility = standardDeviation * Math.sqrt(period);
            const volatilityPercent = volatility * 100;
            return {
                volatility,
                volatilityPercent,
                standardDeviation,
            };
        }
        catch (error) {
            this.logger.error(`Error calculating volatility for ${symbol}:`, error);
            throw error;
        }
    }
    clearCache(symbol) {
        if (symbol) {
            for (const key of this.priceCache.keys()) {
                if (key === symbol) {
                    this.priceCache.delete(key);
                }
            }
            for (const key of this.historicalCache.keys()) {
                if (key.includes(symbol)) {
                    this.historicalCache.delete(key);
                }
            }
        }
        else {
            this.priceCache.clear();
            this.historicalCache.clear();
        }
        this.logger.log(`Cache cleared ${symbol ? `for ${symbol}` : 'completely'}`);
    }
    getCacheStats() {
        return {
            priceCacheSize: this.priceCache.size,
            historicalCacheSize: this.historicalCache.size,
            totalCacheSize: this.priceCache.size + this.historicalCache.size,
        };
    }
    async fetchCurrentPriceFromAPI(symbol) {
        try {
            const response = await this.binancePriceApiService.fetchBinanceTickerPrice(symbol);
            const data = response;
            if (data.price) {
                return data.price;
            }
            throw new Error('Invalid response from price API');
        }
        catch (error) {
            this.logger.error(`API error for ${symbol}:`, error);
            return this.getMockPrice(symbol);
        }
    }
    async fetchHistoricalVolumesFromAPI(symbol, timeframe, limit) {
        try {
            const response = await this.binancePriceApiService.fetchBinanceCandleData(symbol, timeframe);
            const data = response;
            if (data.total_volumes && Array.isArray(data.total_volumes)) {
                return data.total_volumes.slice(-limit).map((volume) => volume[1]);
            }
            throw new Error('Invalid response from historical volume API');
        }
        catch (error) {
            this.logger.error(`API error for historical volumes ${symbol}:`, error);
            return this.getMockHistoricalVolumes(limit);
        }
    }
    timeframeToDays(timeframe) {
        const timeframes = {
            '1m': 1,
            '5m': 1,
            '15m': 1,
            '30m': 1,
            '1h': 1,
            '4h': 7,
            '1d': 30,
        };
        return timeframes[timeframe] || 1;
    }
    getMockPrice(symbol) {
        const basePrices = {
            'BTCUSDT': 45000,
            'ETHUSDT': 3000,
            'SOLUSDT': 100,
            'SUIUSDT': 1.5,
        };
        const basePrice = basePrices[symbol] || 100;
        const variation = (Math.random() - 0.5) * 0.1;
        return basePrice * (1 + variation);
    }
    getMockHistoricalPrices(limit) {
        const basePrice = 100;
        const prices = [];
        for (let i = 0; i < limit; i++) {
            const variation = (Math.random() - 0.5) * 0.2;
            prices.push(basePrice * (1 + variation));
        }
        return prices;
    }
    getMockHistoricalVolumes(limit) {
        const baseVolume = 1000000;
        const volumes = [];
        for (let i = 0; i < limit; i++) {
            const variation = (Math.random() - 0.5) * 0.5;
            volumes.push(baseVolume * (1 + variation));
        }
        return volumes;
    }
};
exports.PriceMonitoringService = PriceMonitoringService;
exports.PriceMonitoringService = PriceMonitoringService = PriceMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        binance_price_api_service_1.BinancePriceApiService])
], PriceMonitoringService);
//# sourceMappingURL=price-monitoring.service.js.map