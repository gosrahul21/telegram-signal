import { Injectable, Logger } from '@nestjs/common';
import { PriceMonitoringService } from './price-monitoring.service';

export interface BollingerBandsResult {
  upperBand: number;
  lowerBand: number;
  middleBand: number;
  standardDeviation: number;
  period: number;
  stdDev: number;
  timestamp: Date;
}

export interface EMACrossoverResult {
  fastEMA: number;
  slowEMA: number;
  previousFastEMA: number;
  previousSlowEMA: number;
  fastPeriod: number;
  slowPeriod: number;
  crossover: string | null;
  timestamp: Date;
}

export interface RSIResult {
  rsi: number;
  period: number;
  avgGain: number;
  avgLoss: number;
  rs: number;
  timestamp: Date;
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  timestamp: Date;
}

export interface StochasticResult {
  k: number;
  d: number;
  kPeriod: number;
  dPeriod: number;
  timestamp: Date;
}

export interface VolumeAnalysisResult {
  currentVolume: number;
  avgVolume: number;
  volumeRatio: number;
  period: number;
  timestamp: Date;
}

export interface PriceActionResult {
  patterns: string[];
  support: number;
  resistance: number;
  period: number;
  timestamp: Date;
}

@Injectable()
export class TechnicalAnalysisService {
  private readonly logger = new Logger(TechnicalAnalysisService.name);

  constructor(
    private readonly priceMonitoringService: PriceMonitoringService,
  ) {}

  async getBollingerBands(
    symbol: string,
    timeframe: string,
    period: number = 20,
    stdDev: number = 2,
  ): Promise<BollingerBandsResult> {
    try {
      const prices: number[] = await this.priceMonitoringService.getHistoricalPrices(
        symbol,
        timeframe,
        period + 1,
      );

      if (prices.length < period) {
        throw new Error(
          `Insufficient data for Bollinger Bands calculation. Need ${period}, got ${prices.length}`,
        );
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
    } catch (error) {
      this.logger.error(
        `Error calculating Bollinger Bands for ${symbol}:`,
        error,
      );
      throw error;
    }
  }

  async getEMACrossover(
    symbol: string,
    timeframe: string,
    fastPeriod: number = 12,
    slowPeriod: number = 26,
  ): Promise<EMACrossoverResult> {
    try {
      const prices: number[] = await this.priceMonitoringService.getHistoricalPrices(
        symbol,
        timeframe,
        Math.max(fastPeriod, slowPeriod) + 1,
      );

      if (prices.length < Math.max(fastPeriod, slowPeriod)) {
        throw new Error(`Insufficient data for EMA crossover calculation`);
      }

      const fastEMA = this.calculateEMA(prices, fastPeriod);
      const slowEMA = this.calculateEMA(prices, slowPeriod);

      // Get previous values for crossover detection
      const previousPrices =
        await this.priceMonitoringService.getHistoricalPrices(
          symbol,
          timeframe,
          Math.max(fastPeriod, slowPeriod) + 2,
        );
      const previousFastEMA = this.calculateEMA(
        previousPrices.slice(0, -1),
        fastPeriod,
      );
      const previousSlowEMA = this.calculateEMA(
        previousPrices.slice(0, -1),
        slowPeriod,
      );

      return {
        fastEMA,
        slowEMA,
        previousFastEMA,
        previousSlowEMA,
        fastPeriod,
        slowPeriod,
        crossover: this.detectCrossover(
          previousFastEMA,
          previousSlowEMA,
          fastEMA,
          slowEMA,
        ),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error calculating EMA crossover for ${symbol}:`,
        error,
      );
      throw error;
    }
  }

  async getRSI(
    symbol: string,
    timeframe: string,
    period: number = 14,
  ): Promise<RSIResult> {
    try {
      const prices = await this.priceMonitoringService.getHistoricalPrices(
        symbol,
        timeframe,
        period + 1,
      );

      if (prices.length < period + 1) {
        throw new Error(
          `Insufficient data for RSI calculation. Need ${period + 1}, got ${prices.length}`,
        );
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
    } catch (error) {
      this.logger.error(`Error calculating RSI for ${symbol}:`, error);
      throw error;
    }
  }

  async getMACD(
    symbol: string,
    timeframe: string,
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
  ): Promise<MACDResult> {
    try {
      const prices = await this.priceMonitoringService.getHistoricalPrices(
        symbol,
        timeframe,
        slowPeriod + signalPeriod,
      );

      if (prices.length < slowPeriod + signalPeriod) {
        throw new Error(`Insufficient data for MACD calculation`);
      }

      const fastEMA = this.calculateEMA(prices, fastPeriod);
      const slowEMA = this.calculateEMA(prices, slowPeriod);
      const macd = fastEMA - slowEMA;

      // Calculate signal line (EMA of MACD)
      const macdValues = [];
      for (let i = 0; i < prices.length - slowPeriod; i++) {
        const fastEMAValue = this.calculateEMA(
          prices.slice(i, i + slowPeriod),
          fastPeriod,
        );
        const slowEMAValue = this.calculateEMA(
          prices.slice(i, i + slowPeriod),
          slowPeriod,
        );
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
    } catch (error) {
      this.logger.error(`Error calculating MACD for ${symbol}:`, error);
      throw error;
    }
  }

  async getStochastic(
    symbol: string,
    timeframe: string,
    kPeriod: number = 14,
    dPeriod: number = 3,
  ): Promise<StochasticResult> {
    try {
      const prices = await this.priceMonitoringService.getHistoricalPrices(
        symbol,
        timeframe,
        kPeriod + dPeriod,
      );

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
    } catch (error) {
      this.logger.error(`Error calculating Stochastic for ${symbol}:`, error);
      throw error;
    }
  }

  // async getVolumeAnalysis(
  //   symbol: string,
  //   timeframe: string,
  //   period: number = 20,
  // ): Promise<VolumeAnalysisResult> {
  //   try {
  //     const volumeData = await this.priceMonitoringService.getHistoricalVolumes(
  //       symbol,
  //       timeframe,
  //       period,
  //     );

  //     if (volumeData.length < period) {
  //       throw new Error(`Insufficient volume data for analysis`);
  //     }

  //     const avgVolume = this.calculateSMA(volumeData, period);
  //     const currentVolume = volumeData[volumeData.length - 1];
  //     const volumeRatio = currentVolume / avgVolume;

  //     return {
  //       currentVolume,
  //       avgVolume,
  //       volumeRatio,
  //       period,
  //       timestamp: new Date(),
  //     };
  //   } catch (error) {
  //     this.logger.error(
  //       `Error calculating volume analysis for ${symbol}:`,
  //       error,
  //     );
  //     throw error;
  //   }
  // }

  async getPriceAction(
    symbol: string,
    timeframe: string,
    period: number = 5,
  ): Promise<PriceActionResult> {
    try {
      const prices = await this.priceMonitoringService.getHistoricalPrices(
        symbol,
        timeframe,
        period + 1,
      );

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
    } catch (error) {
      this.logger.error(`Error calculating price action for ${symbol}:`, error);
      throw error;
    }
  }

  // Helper methods
  private calculateSMA(prices: number[], period: number): number {
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  private calculateEMA(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  private calculateVariance(
    prices: number[],
    mean: number,
    period: number,
  ): number {
    const squaredDifferences = prices
      .slice(-period)
      .map((price) => Math.pow(price - mean, 2));
    const sum = squaredDifferences.reduce((acc, diff) => acc + diff, 0);
    return sum / period;
  }

  private detectCrossover(
    prevFast: number,
    prevSlow: number,
    currFast: number,
    currSlow: number,
  ): string | null {
    if (prevFast <= prevSlow && currFast > currSlow) {
      return 'bullish';
    } else if (prevFast >= prevSlow && currFast < currSlow) {
      return 'bearish';
    }
    return null;
  }

  private detectPricePatterns(prices: number[]): string[] {
    const patterns = [];

    // Check for double top
    if (this.isDoubleTop(prices)) {
      patterns.push('double_top');
    }

    // Check for double bottom
    if (this.isDoubleBottom(prices)) {
      patterns.push('double_bottom');
    }

    // Check for head and shoulders
    if (this.isHeadAndShoulders(prices)) {
      patterns.push('head_and_shoulders');
    }

    // Check for triangle
    if (this.isTriangle(prices)) {
      patterns.push('triangle');
    }

    return patterns;
  }

  private isDoubleTop(prices: number[]): boolean {
    // Simplified double top detection
    const peaks = this.findPeaks(prices);
    return peaks.length >= 2 && Math.abs(peaks[0] - peaks[1]) < 0.01;
  }

  private isDoubleBottom(prices: number[]): boolean {
    // Simplified double bottom detection
    const troughs = this.findTroughs(prices);
    return troughs.length >= 2 && Math.abs(troughs[0] - troughs[1]) < 0.01;
  }

  private isHeadAndShoulders(prices: number[]): boolean {
    // Simplified head and shoulders detection
    const peaks = this.findPeaks(prices);
    if (peaks.length < 3) return false;

    const [left, head, right] = peaks.slice(-3);
    return head > left && head > right && Math.abs(left - right) < 0.02;
  }

  private isTriangle(prices: number[]): boolean {
    // Simplified triangle detection
    const highs = this.findPeaks(prices);
    const lows = this.findTroughs(prices);

    if (highs.length < 2 || lows.length < 2) return false;

    // Check if highs are descending and lows are ascending (ascending triangle)
    const highSlope = (highs[1] - highs[0]) / (highs.length - 1);
    const lowSlope = (lows[1] - lows[0]) / (lows.length - 1);

    return highSlope < 0 && lowSlope > 0;
  }

  private findPeaks(prices: number[]): number[] {
    const peaks = [];
    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
        peaks.push(prices[i]);
      }
    }
    return peaks;
  }

  private findTroughs(prices: number[]): number[] {
    const troughs = [];
    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
        troughs.push(prices[i]);
      }
    }
    return troughs;
  }

  private findSupportLevel(prices: number[]): number {
    const troughs = this.findTroughs(prices);
    return troughs.length > 0 ? Math.min(...troughs) : Math.min(...prices);
  }

  private findResistanceLevel(prices: number[]): number {
    const peaks = this.findPeaks(prices);
    return peaks.length > 0 ? Math.max(...peaks) : Math.max(...prices);
  }
}
