import { Injectable, Logger } from '@nestjs/common';
import { TechnicalAnalysisService } from './technical-analysis.service';

@Injectable()
export class RSIService {
  private readonly logger = new Logger(RSIService.name);

  constructor(
    private readonly technicalAnalysisService: TechnicalAnalysisService,
  ) {}

  async checkRSIConditions(symbol: string, timeframe: string, conditions: any): Promise<{
    triggered: boolean;
    data: any;
    message: string;
  }> {
    try {
      const rsiData = await this.technicalAnalysisService.getRSI(
        symbol, 
        timeframe, 
        conditions.period || 14
      );

      const { rsi } = rsiData;

      let triggered = false;
      let message = '';

      // Check oversold conditions
      if (conditions.oversold && rsi < conditions.oversold) {
        triggered = true;
        message = `RSI oversold condition detected for ${symbol} (RSI: ${rsi.toFixed(2)})`;
      }

      // Check overbought conditions
      if (conditions.overbought && rsi > conditions.overbought) {
        triggered = true;
        message = `RSI overbought condition detected for ${symbol} (RSI: ${rsi.toFixed(2)})`;
      }

      // Check specific RSI levels
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

      // Check divergence conditions
      if (conditions.divergence && await this.checkRSIDivergence(symbol, timeframe, rsiData)) {
        triggered = true;
        message = `RSI divergence detected for ${symbol}`;
      }

      // Check momentum conditions
      if (conditions.momentum && await this.checkRSIMomentum(symbol, timeframe, rsiData)) {
        triggered = true;
        message = `RSI momentum condition detected for ${symbol}`;
      }

      return {
        triggered,
        data: rsiData,
        message,
      };

    } catch (error) {
      this.logger.error(`Error checking RSI conditions for ${symbol}:`, error);
      throw error;
    }
  }

  private async checkRSIDivergence(symbol: string, timeframe: string, rsiData: any): Promise<boolean> {
    try {
      // This is a simplified divergence check
      // In a real implementation, you would compare price highs/lows with RSI highs/lows
      const { rsi } = rsiData;
      
      // Check if RSI is at extreme levels (potential divergence)
      return rsi < 20 || rsi > 80;
    } catch (error) {
      this.logger.error(`Error checking RSI divergence for ${symbol}:`, error);
      return false;
    }
  }

  private async checkRSIMomentum(symbol: string, timeframe: string, rsiData: any): Promise<boolean> {
    try {
      // This is a simplified momentum check
      // In a real implementation, you would compare current RSI with previous values
      const { rsi } = rsiData;
      
      // Check if RSI is showing strong momentum
      return rsi > 70 || rsi < 30;
    } catch (error) {
      this.logger.error(`Error checking RSI momentum for ${symbol}:`, error);
      return false;
    }
  }

  async getRSIAnalysis(symbol: string, timeframe: string): Promise<{
    analysis: string;
    recommendation: string;
    risk: 'low' | 'medium' | 'high';
    data: any;
  }> {
    try {
      const rsiData = await this.technicalAnalysisService.getRSI(symbol, timeframe);
      const { rsi } = rsiData;

      let analysis = '';
      let recommendation = '';
      let risk: 'low' | 'medium' | 'high' = 'medium';

      // Analyze RSI levels
      if (rsi < 20) {
        analysis = 'RSI indicates extremely oversold conditions, suggesting potential reversal.';
        recommendation = 'Consider buying or setting long positions. Look for bullish candlestick patterns.';
        risk = 'low';
      } else if (rsi < 30) {
        analysis = 'RSI indicates oversold conditions, suggesting potential buying opportunity.';
        recommendation = 'Consider buying with tight stops. Monitor for reversal signals.';
        risk = 'low';
      } else if (rsi > 80) {
        analysis = 'RSI indicates extremely overbought conditions, suggesting potential reversal.';
        recommendation = 'Consider selling or setting short positions. Look for bearish candlestick patterns.';
        risk = 'high';
      } else if (rsi > 70) {
        analysis = 'RSI indicates overbought conditions, suggesting potential selling opportunity.';
        recommendation = 'Consider selling with tight stops. Monitor for reversal signals.';
        risk = 'high';
      } else {
        analysis = 'RSI is in neutral territory, indicating balanced market conditions.';
        recommendation = 'Monitor for breakout or breakdown signals. Consider range trading strategies.';
        risk = 'medium';
      }

      // Add momentum analysis
      if (rsi > 50) {
        analysis += ' RSI is above 50, indicating bullish momentum.';
        recommendation += ' Trend is favorable for long positions.';
      } else {
        analysis += ' RSI is below 50, indicating bearish momentum.';
        recommendation += ' Trend is unfavorable for long positions.';
      }

      return {
        analysis,
        recommendation,
        risk,
        data: rsiData,
      };

    } catch (error) {
      this.logger.error(`Error getting RSI analysis for ${symbol}:`, error);
      throw error;
    }
  }

  async getRSISignals(symbol: string, timeframe: string): Promise<{
    signals: string[];
    strength: 'weak' | 'moderate' | 'strong';
    data: any;
  }> {
    try {
      const rsiData = await this.technicalAnalysisService.getRSI(symbol, timeframe);
      const { rsi } = rsiData;

      const signals: string[] = [];
      let strength: 'weak' | 'moderate' | 'strong' = 'weak';

      // Generate trading signals based on RSI levels
      if (rsi < 20) {
        signals.push('STRONG_BUY');
        signals.push('OVERSOLD');
        strength = 'strong';
      } else if (rsi < 30) {
        signals.push('BUY');
        signals.push('OVERSOLD');
        strength = 'moderate';
      } else if (rsi > 80) {
        signals.push('STRONG_SELL');
        signals.push('OVERBOUGHT');
        strength = 'strong';
      } else if (rsi > 70) {
        signals.push('SELL');
        signals.push('OVERBOUGHT');
        strength = 'moderate';
      } else if (rsi > 50) {
        signals.push('BULLISH_MOMENTUM');
        strength = 'weak';
      } else {
        signals.push('BEARISH_MOMENTUM');
        strength = 'weak';
      }

      // Add trend signals
      if (rsi > 60) {
        signals.push('BULLISH_TREND');
      } else if (rsi < 40) {
        signals.push('BEARISH_TREND');
      }

      // Add reversal signals
      if (rsi < 25 || rsi > 75) {
        signals.push('REVERSAL_WARNING');
      }

      return {
        signals,
        strength,
        data: rsiData,
      };

    } catch (error) {
      this.logger.error(`Error getting RSI signals for ${symbol}:`, error);
      throw error;
    }
  }

  async getRSILevels(symbol: string, timeframe: string): Promise<{
    oversold: number;
    overbought: number;
    neutral: {
      low: number;
      high: number;
    };
    data: any;
  }> {
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

    } catch (error) {
      this.logger.error(`Error getting RSI levels for ${symbol}:`, error);
      throw error;
    }
  }
}
