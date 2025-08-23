import { Injectable, Logger } from '@nestjs/common';
import { TechnicalAnalysisService } from './technical-analysis.service';

@Injectable()
export class MACDService {
  private readonly logger = new Logger(MACDService.name);

  constructor(
    private readonly technicalAnalysisService: TechnicalAnalysisService,
  ) {}

  async checkMACDConditions(symbol: string, timeframe: string, conditions: any): Promise<{
    triggered: boolean;
    data: any;
    message: string;
  }> {
    try {
      const macdData = await this.technicalAnalysisService.getMACD(
        symbol, 
        timeframe, 
        conditions.fastPeriod || 12, 
        conditions.slowPeriod || 26, 
        conditions.signalPeriod || 9
      );

      const { macd, signal, histogram } = macdData;

      let triggered = false;
      let message = '';

      // Check crossover conditions
      if (conditions.crossover === 'bullish' && macd > signal && histogram > 0) {
        triggered = true;
        message = `Bullish MACD crossover detected for ${symbol}`;
      } else if (conditions.crossover === 'bearish' && macd < signal && histogram < 0) {
        triggered = true;
        message = `Bearish MACD crossover detected for ${symbol}`;
      }

      // Check histogram conditions
      if (conditions.histogramPositive && histogram > 0) {
        triggered = true;
        message = `Positive MACD histogram detected for ${symbol}`;
      } else if (conditions.histogramNegative && histogram < 0) {
        triggered = true;
        message = `Negative MACD histogram detected for ${symbol}`;
      }

      // Check divergence conditions
      if (conditions.divergence && await this.checkMACDDivergence(symbol, timeframe, macdData)) {
        triggered = true;
        message = `MACD divergence detected for ${symbol}`;
      }

      // Check overbought/oversold conditions
      if (conditions.overbought && macd > conditions.overboughtThreshold) {
        triggered = true;
        message = `MACD overbought condition detected for ${symbol}`;
      } else if (conditions.oversold && macd < conditions.oversoldThreshold) {
        triggered = true;
        message = `MACD oversold condition detected for ${symbol}`;
      }

      return {
        triggered,
        data: macdData,
        message,
      };

    } catch (error) {
      this.logger.error(`Error checking MACD conditions for ${symbol}:`, error);
      throw error;
    }
  }

  private async checkMACDDivergence(symbol: string, timeframe: string, macdData: any): Promise<boolean> {
    try {
      // This is a simplified divergence check
      // In a real implementation, you would compare price highs/lows with MACD highs/lows
      const { macd, signal } = macdData;
      
      // Check if MACD and signal are moving in opposite directions
      const macdChange = Math.abs(macd - signal);
      const threshold = 0.001; // Adjust based on your needs
      
      return macdChange > threshold;
    } catch (error) {
      this.logger.error(`Error checking MACD divergence for ${symbol}:`, error);
      return false;
    }
  }

  async getMACDAnalysis(symbol: string, timeframe: string): Promise<{
    analysis: string;
    recommendation: string;
    risk: 'low' | 'medium' | 'high';
    data: any;
  }> {
    try {
      const macdData = await this.technicalAnalysisService.getMACD(symbol, timeframe);
      const { macd, signal, histogram } = macdData;

      let analysis = '';
      let recommendation = '';
      let risk: 'low' | 'medium' | 'high' = 'medium';

      // Analyze MACD position relative to signal line
      if (macd > signal) {
        analysis = 'MACD is above signal line, indicating bullish momentum.';
        recommendation = 'Consider long positions or holding existing long positions.';
        risk = 'low';
      } else {
        analysis = 'MACD is below signal line, indicating bearish momentum.';
        recommendation = 'Consider short positions or reducing long positions.';
        risk = 'high';
      }

      // Analyze histogram
      if (histogram > 0 && histogram > Math.abs(histogram * 0.1)) {
        analysis += ' Histogram is positive and growing, confirming bullish momentum.';
        recommendation += ' Momentum is strong, consider adding to positions.';
        risk = 'low';
      } else if (histogram < 0 && Math.abs(histogram) > Math.abs(histogram * 0.1)) {
        analysis += ' Histogram is negative and growing, confirming bearish momentum.';
        recommendation += ' Momentum is strong, consider reducing positions.';
        risk = 'high';
      } else {
        analysis += ' Histogram is weak, indicating potential reversal or consolidation.';
        recommendation += ' Be cautious, momentum may be changing.';
        risk = 'medium';
      }

      // Check for extreme values
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

    } catch (error) {
      this.logger.error(`Error getting MACD analysis for ${symbol}:`, error);
      throw error;
    }
  }

  async getMACDSignals(symbol: string, timeframe: string): Promise<{
    signals: string[];
    strength: 'weak' | 'moderate' | 'strong';
    data: any;
  }> {
    try {
      const macdData = await this.technicalAnalysisService.getMACD(symbol, timeframe);
      const { macd, signal, histogram } = macdData;

      const signals: string[] = [];
      let strength: 'weak' | 'moderate' | 'strong' = 'weak';

      // Generate trading signals
      if (macd > signal) {
        signals.push('BUY');
        if (histogram > 0) {
          signals.push('STRONG_BUY');
          strength = 'strong';
        } else {
          strength = 'moderate';
        }
      } else {
        signals.push('SELL');
        if (histogram < 0) {
          signals.push('STRONG_SELL');
          strength = 'strong';
        } else {
          strength = 'moderate';
        }
      }

      // Check for momentum signals
      if (Math.abs(histogram) > 0.01) {
        signals.push('MOMENTUM');
      }

      // Check for reversal signals
      if (Math.abs(macd) > 0.05) {
        signals.push('REVERSAL_WARNING');
      }

      return {
        signals,
        strength,
        data: macdData,
      };

    } catch (error) {
      this.logger.error(`Error getting MACD signals for ${symbol}:`, error);
      throw error;
    }
  }
}
