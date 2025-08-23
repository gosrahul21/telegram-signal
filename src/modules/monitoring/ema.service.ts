import { Injectable, Logger } from '@nestjs/common';
import { TechnicalAnalysisService } from './technical-analysis.service';

@Injectable()
export class EMAService {
  private readonly logger = new Logger(EMAService.name);

  constructor(
    private readonly technicalAnalysisService: TechnicalAnalysisService,
  ) {}

  async checkEMACrossoverConditions(symbol: string, timeframe: string, conditions: any): Promise<{
    triggered: boolean;
    data: any;
    message: string;
  }> {
    try {
      const emaData = await this.technicalAnalysisService.getEMACrossover(
        symbol, 
        timeframe, 
        conditions.fastPeriod || 12, 
        conditions.slowPeriod || 26
      );

      const { fastEMA, slowEMA, previousFastEMA, previousSlowEMA, crossover } = emaData;

      let triggered = false;
      let message = '';

      // Check crossover conditions
      if (conditions.crossover === 'bullish' && crossover === 'bullish') {
        triggered = true;
        message = `Bullish EMA crossover detected for ${symbol}`;
      } else if (conditions.crossover === 'bearish' && crossover === 'bearish') {
        triggered = true;
        message = `Bearish EMA crossover detected for ${symbol}`;
      }

      // Check EMA position conditions
      if (conditions.position === 'above' && fastEMA > slowEMA) {
        triggered = true;
        message = `Fast EMA above slow EMA detected for ${symbol}`;
      } else if (conditions.position === 'below' && fastEMA < slowEMA) {
        triggered = true;
        message = `Fast EMA below slow EMA detected for ${symbol}`;
      }

      // Check EMA distance conditions
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

      // Check trend strength conditions
      if (conditions.trendStrength && await this.checkTrendStrength(emaData, conditions.trendStrength)) {
        triggered = true;
        message = `Strong EMA trend detected for ${symbol}`;
      }

      return {
        triggered,
        data: emaData,
        message,
      };

    } catch (error) {
      this.logger.error(`Error checking EMA crossover conditions for ${symbol}:`, error);
      throw error;
    }
  }

  private async checkTrendStrength(emaData: any, requiredStrength: number): Promise<boolean> {
    try {
      const { fastEMA, slowEMA } = emaData;
      const distance = Math.abs(fastEMA - slowEMA) / slowEMA * 100;
      
      return distance > requiredStrength;
    } catch (error) {
      this.logger.error('Error checking trend strength:', error);
      return false;
    }
  }

  async getEMAAnalysis(symbol: string, timeframe: string): Promise<{
    analysis: string;
    recommendation: string;
    risk: 'low' | 'medium' | 'high';
    data: any;
  }> {
    try {
      const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe);
      const { fastEMA, slowEMA, crossover } = emaData;

      let analysis = '';
      let recommendation = '';
      let risk: 'low' | 'medium' | 'high' = 'medium';

      // Analyze EMA position
      if (fastEMA > slowEMA) {
        analysis = 'Fast EMA is above slow EMA, indicating bullish trend.';
        recommendation = 'Consider long positions or holding existing long positions.';
        risk = 'low';
      } else {
        analysis = 'Fast EMA is below slow EMA, indicating bearish trend.';
        recommendation = 'Consider short positions or reducing long positions.';
        risk = 'high';
      }

      // Analyze crossover
      if (crossover === 'bullish') {
        analysis += ' Recent bullish crossover detected, confirming trend change.';
        recommendation += ' Trend change confirmed, consider entering long positions.';
        risk = 'low';
      } else if (crossover === 'bearish') {
        analysis += ' Recent bearish crossover detected, confirming trend change.';
        recommendation += ' Trend change confirmed, consider entering short positions.';
        risk = 'high';
      } else {
        analysis += ' No recent crossover, trend continues.';
        recommendation += ' Follow existing trend direction.';
        risk = 'medium';
      }

      // Analyze trend strength
      const distance = Math.abs(fastEMA - slowEMA) / slowEMA * 100;
      if (distance > 5) {
        analysis += ' Strong trend with significant EMA separation.';
        recommendation += ' Trend is strong, consider adding to positions.';
        risk = 'low';
      } else if (distance < 1) {
        analysis += ' Weak trend with minimal EMA separation.';
        recommendation += ' Trend is weak, be cautious of potential reversal.';
        risk = 'medium';
      } else {
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

    } catch (error) {
      this.logger.error(`Error getting EMA analysis for ${symbol}:`, error);
      throw error;
    }
  }

  async getEMASignals(symbol: string, timeframe: string): Promise<{
    signals: string[];
    strength: 'weak' | 'moderate' | 'strong';
    data: any;
  }> {
    try {
      const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe);
      const { fastEMA, slowEMA, crossover } = emaData;

      const signals: string[] = [];
      let strength: 'weak' | 'moderate' | 'strong' = 'weak';

      // Generate trading signals based on EMA position
      if (fastEMA > slowEMA) {
        signals.push('BUY');
        if (crossover === 'bullish') {
          signals.push('STRONG_BUY');
          strength = 'strong';
        } else {
          strength = 'moderate';
        }
      } else {
        signals.push('SELL');
        if (crossover === 'bearish') {
          signals.push('STRONG_SELL');
          strength = 'strong';
        } else {
          strength = 'moderate';
        }
      }

      // Add trend signals
      const distance = Math.abs(fastEMA - slowEMA) / slowEMA * 100;
      if (distance > 5) {
        signals.push('STRONG_TREND');
        strength = 'strong';
      } else if (distance > 2) {
        signals.push('MODERATE_TREND');
        strength = 'moderate';
      } else {
        signals.push('WEAK_TREND');
        strength = 'weak';
      }

      // Add momentum signals
      if (crossover === 'bullish') {
        signals.push('BULLISH_MOMENTUM');
      } else if (crossover === 'bearish') {
        signals.push('BEARISH_MOMENTUM');
      }

      // Add reversal signals
      if (distance < 1) {
        signals.push('REVERSAL_WARNING');
      }

      return {
        signals,
        strength,
        data: emaData,
      };

    } catch (error) {
      this.logger.error(`Error getting EMA signals for ${symbol}:`, error);
      throw error;
    }
  }

  async getEMALevels(symbol: string, timeframe: string): Promise<{
    fastEMA: number;
    slowEMA: number;
    distance: number;
    distancePercent: number;
    data: any;
  }> {
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

    } catch (error) {
      this.logger.error(`Error getting EMA levels for ${symbol}:`, error);
      throw error;
    }
  }

  async getMultipleEMAs(symbol: string, timeframe: string, periods: number[] = [9, 21, 50, 200]): Promise<{
    emas: Record<string, number>;
    analysis: string;
    data: any;
  }> {
    try {
      // This would require extending the technical analysis service to support multiple EMAs
      // For now, we'll use the existing crossover data
      const emaData = await this.technicalAnalysisService.getEMACrossover(symbol, timeframe);
      
      const emas: Record<string, number> = {
        'fast': emaData.fastEMA,
        'slow': emaData.slowEMA,
      };

      let analysis = '';
      
      // Analyze multiple EMA alignment
      if (emas.fast > emas.slow) {
        analysis = 'EMAs are aligned bullishly (shorter > longer).';
      } else {
        analysis = 'EMAs are aligned bearishly (shorter < longer).';
      }

      return {
        emas,
        analysis,
        data: emaData,
      };

    } catch (error) {
      this.logger.error(`Error getting multiple EMAs for ${symbol}:`, error);
      throw error;
    }
  }
}
