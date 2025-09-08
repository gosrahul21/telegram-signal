import { BinancePriceApiService } from '@/services/binance-price-api.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PriceMonitoringService {
  private readonly logger = new Logger(PriceMonitoringService.name);
  private priceCache = new Map<string, { price: number; timestamp: number }>();
  private historicalCache = new Map<string, { data: any[]; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds
  private readonly HISTORICAL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly binancePriceApiService: BinancePriceApiService,
  ) {}

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      // Check cache first
      const cached = this.priceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.price;
      }

      // Fetch from API (implement your price API integration here)
      const price = await this.fetchCurrentPriceFromAPI(symbol);
      
      // Update cache
      this.priceCache.set(symbol, {
        price,
        timestamp: Date.now(),
      });

      return price;
    } catch (error) {
      this.logger.error(`Error fetching current price for ${symbol}:`, error);
      
      // Return cached price if available, even if expired
      const cached = this.priceCache.get(symbol);
      if (cached) {
        this.logger.warn(`Using cached price for ${symbol}: ${cached.price}`);
        return cached.price;
      }
      
      throw error;
    }
  }

  async getHistoricalPrices(symbol: string, timeframe: string, limit: number = 100): Promise<number[]> {
    try {
      const cacheKey = `${symbol}_${timeframe}_${limit}`;
      
      // Check cache first
      const cached = this.historicalCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.HISTORICAL_CACHE_DURATION) {
        return cached.data;
      }

      // Fetch from API
      const prices = await this.binancePriceApiService.fetchBinanceCandleData(symbol, timeframe);
      
      // Update cache
      this.historicalCache.set(cacheKey, {
        data: prices,
        timestamp: Date.now(),
      });

      return prices;
    } catch (error) {
      this.logger.error(`Error fetching historical prices for ${symbol}:`, error);
      
      // Return cached data if available, even if expired
      const cached = this.historicalCache.get(`${symbol}_${timeframe}_${limit}`);
      if (cached) {
        this.logger.warn(`Using cached historical data for ${symbol}`);
        return cached.data;
      }
      
      throw error;
    }
  }

  async getHistoricalVolumes(symbol: string, timeframe: string, limit: number = 100): Promise<number[]> {
    try {
      const cacheKey = `volume_${symbol}_${timeframe}_${limit}`;
      
      // Check cache first
      const cached = this.historicalCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.HISTORICAL_CACHE_DURATION) {
        return cached.data;
      }

      // Fetch from API
      const volumes = await this.fetchHistoricalVolumesFromAPI(symbol, timeframe, limit);
      
      // Update cache
      this.historicalCache.set(cacheKey, {
        data: volumes,
        timestamp: Date.now(),
      });

      return volumes;
    } catch (error) {
      this.logger.error(`Error fetching historical volumes for ${symbol}:`, error);
      
      // Return cached data if available, even if expired
      const cached = this.historicalCache.get(`volume_${symbol}_${timeframe}_${limit}`);
      if (cached) {
        this.logger.warn(`Using cached volume data for ${symbol}`);
        return cached.data;
      }
      
      throw error;
    }
  }

  async getPriceChange(symbol: string, timeframe: string): Promise<{
    currentPrice: number;
    previousPrice: number;
    change: number;
    changePercent: number;
  }> {
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
    } catch (error) {
      this.logger.error(`Error calculating price change for ${symbol}:`, error);
      throw error;
    }
  }

  async getPriceRange(symbol: string, timeframe: string, period: number = 24): Promise<{
    high: number;
    low: number;
    open: number;
    close: number;
    range: number;
    rangePercent: number;
  }> {
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
    } catch (error) {
      this.logger.error(`Error calculating price range for ${symbol}:`, error);
      throw error;
    }
  }

  async getVolatility(symbol: string, timeframe: string, period: number = 20): Promise<{
    volatility: number;
    volatilityPercent: number;
    standardDeviation: number;
  }> {
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
    } catch (error) {
      this.logger.error(`Error calculating volatility for ${symbol}:`, error);
      throw error;
    }
  }

  // Cache management methods
  clearCache(symbol?: string): void {
    if (symbol) {
      // Clear specific symbol cache
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
    } else {
      // Clear all cache
      this.priceCache.clear();
      this.historicalCache.clear();
    }
    
    this.logger.log(`Cache cleared ${symbol ? `for ${symbol}` : 'completely'}`);
  }

  getCacheStats(): {
    priceCacheSize: number;
    historicalCacheSize: number;
    totalCacheSize: number;
  } {
    return {
      priceCacheSize: this.priceCache.size,
      historicalCacheSize: this.historicalCache.size,
      totalCacheSize: this.priceCache.size + this.historicalCache.size,
    };
  }

  // Private methods for API integration
  private async fetchCurrentPriceFromAPI(symbol: string): Promise<number> {
    // Implement your price API integration here
    // This is a placeholder - replace with actual API call
    
    // Example using a mock API
    try {
      // You can integrate with CoinGecko, Binance, Coinbase, etc.
      const response = await this.binancePriceApiService.fetchBinanceTickerPrice(symbol);
      
      const data = response;
      
      if (data.price) {
        return data.price;
      }
      
      throw new Error('Invalid response from price API');
    } catch (error) {
      this.logger.error(`API error for ${symbol}:`, error);
      
      // Return a mock price for development/testing
      // Remove this in production
      return this.getMockPrice(symbol);
    }
  }

  private async fetchHistoricalVolumesFromAPI(symbol: string, timeframe: string, limit: number): Promise<number[]> {
    // Implement your historical volume API integration here
    // This is a placeholder - replace with actual API call
    
    try {
      // You can integrate with CoinGecko, Binance, Coinbase, etc.
      const response = await this.binancePriceApiService.fetchBinanceCandleData(symbol, timeframe);
      const data = response;
      
      if (data.total_volumes && Array.isArray(data.total_volumes)) {
        return data.total_volumes.slice(-limit).map((volume: [number, number]) => volume[1]);
      }
      
      throw new Error('Invalid response from historical volume API');
    } catch (error) {
      this.logger.error(`API error for historical volumes ${symbol}:`, error);
      
      // Return mock data for development/testing
      // Remove this in production
      return this.getMockHistoricalVolumes(limit);
    }
  }

  private timeframeToDays(timeframe: string): number {
    const timeframes: Record<string, number> = {
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

  // Mock methods for development/testing - remove in production
  private getMockPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      'BTCUSDT': 45000,
      'ETHUSDT': 3000,
      'SOLUSDT': 100,
      'SUIUSDT': 1.5,
    };
    
    const basePrice = basePrices[symbol] || 100;
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    return basePrice * (1 + variation);
  }

  private getMockHistoricalPrices(limit: number): number[] {
    const basePrice = 100;
    const prices = [];
    
    for (let i = 0; i < limit; i++) {
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      prices.push(basePrice * (1 + variation));
    }
    
    return prices;
  }

  private getMockHistoricalVolumes(limit: number): number[] {
    const baseVolume = 1000000;
    const volumes = [];
    
    for (let i = 0; i < limit; i++) {
      const variation = (Math.random() - 0.5) * 0.5; // ±25% variation
      volumes.push(baseVolume * (1 + variation));
    }
    
    return volumes;
  }
}
