import { Injectable, Logger } from '@nestjs/common';
import { TechnicalAnalysisService } from './technical-analysis.service';

@Injectable()
export class BollingerBandsService {
  private readonly logger = new Logger(BollingerBandsService.name);

  constructor(
    private readonly technicalAnalysisService: TechnicalAnalysisService,
  ) {}

  async checkBollingerBandsConditions(symbol: string, timeframe: string, conditions: any): Promise<{
    triggered: boolean;
    data: any;
    message: string;
  }> {
    try {
      const bbData = await this.technicalAnalysisService.getBollingerBands(
        symbol, 
        timeframe, 
        conditions.period || 20, 
        conditions.stdDev || 2
      );

      const currentPrice = bbData.middleBand; // Using middle band as current price for demo
      const { upperBand, lowerBand, middleBand } = bbData;

      let triggered = false;
      let message = '';

      // Check breakout conditions
      if (conditions.breakout === 'upper' && currentPrice > upperBand) {
        triggered = true;
        message = `Upper Bollinger Band breakout detected for ${symbol}`;
      } else if (conditions.breakout === 'lower' && currentPrice < lowerBand) {
        triggered = true;
        message = `Lower Bollinger Band breakout detected for ${symbol}`;
      }

      // Check bounce conditions
      if (conditions.bounce === 'upper' && currentPrice <= upperBand && currentPrice > middleBand) {
        triggered = true;
        message = `Upper Bollinger Band bounce detected for ${symbol}`;
      } else if (conditions.bounce === 'lower' && currentPrice >= lowerBand && currentPrice < middleBand) {
        triggered = true;
        message = `Lower Bollinger Band bounce detected for ${symbol}`;
      }

      // Check squeeze conditions
      if (conditions.squeeze && this.isBollingerBandsSqueeze(bbData)) {
        triggered = true;
        message = `Bollinger Bands squeeze detected for ${symbol}`;
      }

      // Check expansion conditions
      if (conditions.expansion && this.isBollingerBandsExpansion(bbData)) {
        triggered = true;
        message = `Bollinger Bands expansion detected for ${symbol}`;
      }

      return {
        triggered,
        data: bbData,
        message,
      };

    } catch (error) {
      this.logger.error(`Error checking Bollinger Bands conditions for ${symbol}:`, error);
      throw error;
    }
  }

  private isBollingerBandsSqueeze(bbData: any): boolean {
    const { upperBand, lowerBand, middleBand } = bbData;
    const bandwidth = (upperBand - lowerBand) / middleBand;
    
    // Consider it a squeeze if bandwidth is less than 0.1 (10%)
    return bandwidth < 0.1;
  }

  private isBollingerBandsExpansion(bbData: any): boolean {
    const { upperBand, lowerBand, middleBand } = bbData;
    const bandwidth = (upperBand - lowerBand) / middleBand;
    
    // Consider it an expansion if bandwidth is greater than 0.3 (30%)
    return bandwidth > 0.3;
  }

  async getBollingerBandsAnalysis(symbol: string, timeframe: string): Promise<{
    analysis: string;
    recommendation: string;
    risk: 'low' | 'medium' | 'high';
    data: any;
  }> {
    try {
      const bbData = await this.technicalAnalysisService.getBollingerBands(symbol, timeframe);
      const { upperBand, lowerBand, middleBand, standardDeviation } = bbData;

      let analysis = '';
      let recommendation = '';
      let risk: 'low' | 'medium' | 'high' = 'medium';

      const bandwidth = (upperBand - lowerBand) / middleBand;
      const position = (middleBand - lowerBand) / (upperBand - lowerBand);

      if (bandwidth < 0.1) {
        analysis = 'Bollinger Bands are in a squeeze, indicating low volatility and potential breakout ahead.';
        recommendation = 'Prepare for potential breakout. Consider setting alerts for price movement beyond bands.';
        risk = 'medium';
      } else if (bandwidth > 0.3) {
        analysis = 'Bollinger Bands are expanded, indicating high volatility and potential reversal.';
        recommendation = 'Be cautious of potential reversal. Consider taking profits or setting tighter stops.';
        risk = 'high';
      } else {
        analysis = 'Bollinger Bands are in normal range, indicating moderate volatility.';
        recommendation = 'Monitor for standard breakout or bounce opportunities.';
        risk = 'low';
      }

      if (position > 0.8) {
        analysis += ' Price is near upper band, suggesting potential resistance.';
        recommendation += ' Consider selling or setting short positions.';
        risk = 'high';
      } else if (position < 0.2) {
        analysis += ' Price is near lower band, suggesting potential support.';
        recommendation += ' Consider buying or setting long positions.';
        risk = 'low';
      }

      return {
        analysis,
        recommendation,
        risk,
        data: bbData,
      };

    } catch (error) {
      this.logger.error(`Error getting Bollinger Bands analysis for ${symbol}:`, error);
      throw error;
    }
  }
}
