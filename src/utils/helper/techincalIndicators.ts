import { Injectable } from '@nestjs/common';
const ti = require('technicalindicators');

@Injectable()
export class TechnicalIndicatorsService {
  constructor() {}

  calculateEMA(prices: number[], period: number) {
    return ti.EMA.calculate({ period, values: prices });
  }

  calculateRSI(prices: number[], period = 14) {
    return ti.RSI.calculate({ period, values: prices });
  }

  calculateMACD(prices: number[]) {
    return ti.MACD.calculate({
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
  }
}

export const technicalIndicatorsService = new TechnicalIndicatorsService();
