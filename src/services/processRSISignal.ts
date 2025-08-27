import { Bot } from 'grammy';
import { delay } from '../bot/utils/delay';
import { renderRSISignal, RSISignal } from '../bot/utils/renderRSISignal';
import config from '../utils/config';
import { logger } from '../utils/helper/logger';
import { Duration, UpstoxInterval } from '@/utils/types/Duration';

import { BinancePriceApiService } from './binance-price-api.service';
import { TechnicalIndicatorsService } from '@/utils/helper/techincalIndicators';
import { upstoxPriceApiService } from './getStockHistoricalCandles';
import { Injectable } from '@nestjs/common';

// export default processRSIAnalysis;
@Injectable()
export class RSIAnalysisService {
  constructor(
    private readonly binancePriceApiService: BinancePriceApiService,
    private readonly technicalIndicatorsService: TechnicalIndicatorsService,
  ) {}

  processRSIAnalysis = async (
    bot: Bot,
    fallbackKeyPairs: string[],
    duration: Duration | UpstoxInterval,
    neutral: boolean = false,
  ): Promise<void> => {
    for (const keyPair of fallbackKeyPairs) {
      try {
        const candles: any = config.UPSTOX_KEY_PAIRS.includes(keyPair)
          ? await upstoxPriceApiService.getStockHistoricalCandles(
              keyPair,
              duration as UpstoxInterval,
            )
          : await this.binancePriceApiService.fetchBinanceCandleData(
              keyPair,
              duration as string,
            );
        const signals = await this.generateRSISignal(keyPair, candles, neutral);
        await renderRSISignal(keyPair, signals, bot, duration);
      } catch (error) {
        logger(
          `Error processing RSI analysis for ${keyPair} at ${duration}: ${error}`,
          'red',
        );
      } finally {
        // 1 sec timeout
        await delay(config.DELAY_BETWEEN_PAIRS_MS);
      }
    }
  };

  public generateRSISignal = (
    keyName: string,
    candles: any,
    neutral: boolean = false,
  ): RSISignal[] => {
    // const candles: any = await fetchCandleData(keyName, duration);
    const currentRSI = this.getRSIValue(candles);
    const mostRecentIndex = candles.length - 1;
    const signals: RSISignal[] = this.rsiSignal(
      currentRSI,
      candles[mostRecentIndex].close,
      candles[mostRecentIndex].closeTime,
      neutral,
    );
    return signals;
  };

  getRSIValue = (candles: any): number => {
    // const candles: any = await fetchCandleData(keyName, duration);
    const rsiValues = this.technicalIndicatorsService.calculateRSI(
      candles.map((candle: any) => candle.close),
      14,
    );
    const currentRSI = rsiValues[rsiValues.length - 1];

    return currentRSI;
  };

  private rsiSignal = (
    currentRSI: number,
    price: number,
    time: number,
    neutral: boolean = false,
  ) => {
    const signals: RSISignal[] = [];

    if (currentRSI >= config.RSI_EXTREME_OVERBOUGHT) {
      signals.push({
        type: `Extreme_Overbought`,
        time: time,
        price: price,
        rsi: currentRSI,
        details: `RSI is extremely overbought at ${currentRSI.toFixed(
          2,
        )}, strong sell signal`,
      });
    } else if (currentRSI >= config.RSI_OVERBOUGHT_THRESHOLD) {
      signals.push({
        type: `Overbought`,
        time: time,
        price: price,
        rsi: currentRSI,
        details: `RSI is overbought at ${currentRSI.toFixed(
          2,
        )}, potential sell signal`,
      });
    }
    if (currentRSI <= config.RSI_EXTREME_OVERSOLD) {
      signals.push({
        type: `Extreme_Oversold`,
        time: time,
        price: price,
        rsi: currentRSI,
        details: `RSI is extremely oversold at ${currentRSI.toFixed(
          2,
        )}, strong buy signal`,
      });
    } else if (currentRSI <= config.RSI_OVERSOLD_THRESHOLD) {
      signals.push({
        type: `Oversold`,
        time: time,
        price: price,
        rsi: currentRSI,
        details: `RSI is oversold at ${currentRSI.toFixed(
          2,
        )}, potential buy signal`,
      });
    } else if (neutral) {
      signals.push({
        type: `Neutral`,
        time: time,
        price: price,
        rsi: currentRSI,
        details: `RSI is neutral at ${currentRSI.toFixed(2)}`,
      });
    }

    return signals;
  };
}
