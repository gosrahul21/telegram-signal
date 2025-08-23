import { ConfigService } from '@nestjs/config';
export declare class PriceMonitoringService {
    private readonly configService;
    private readonly logger;
    private priceCache;
    private historicalCache;
    private readonly CACHE_DURATION;
    private readonly HISTORICAL_CACHE_DURATION;
    constructor(configService: ConfigService);
    getCurrentPrice(symbol: string): Promise<number>;
    getHistoricalPrices(symbol: string, timeframe: string, limit?: number): Promise<number[]>;
    getHistoricalVolumes(symbol: string, timeframe: string, limit?: number): Promise<number[]>;
    getPriceChange(symbol: string, timeframe: string): Promise<{
        currentPrice: number;
        previousPrice: number;
        change: number;
        changePercent: number;
    }>;
    getPriceRange(symbol: string, timeframe: string, period?: number): Promise<{
        high: number;
        low: number;
        open: number;
        close: number;
        range: number;
        rangePercent: number;
    }>;
    getVolatility(symbol: string, timeframe: string, period?: number): Promise<{
        volatility: number;
        volatilityPercent: number;
        standardDeviation: number;
    }>;
    clearCache(symbol?: string): void;
    getCacheStats(): {
        priceCacheSize: number;
        historicalCacheSize: number;
        totalCacheSize: number;
    };
    private fetchCurrentPriceFromAPI;
    private fetchHistoricalPricesFromAPI;
    private fetchHistoricalVolumesFromAPI;
    private timeframeToDays;
    private getMockPrice;
    private getMockHistoricalPrices;
    private getMockHistoricalVolumes;
}
