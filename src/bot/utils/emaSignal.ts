import { fetchCandleData } from "../../services/priceApi";
import { Duration } from "../../types/Duration";
import { keyPairsMapping } from "../../utils/constants";
import { calculateEMA } from "../../utils/helper/techincalIndicators";
import candleTracker from "./candleTracker";

export interface EMASignal {
  type: string;
  time: number;
  price: number;
  details: string;
  candleId?: string | number;
}

/**
 * Generate EMA crossover signals based on EMA series
 */
export function generateCrossSignals(
  prices: any[],
  ema9: number[],
  ema21: number[],
  ema20: number[],
  ema50: number[],
  getTrend = false
): EMASignal[] {
  const signals: EMASignal[] = [];
  const mostRecentIndex = 0;
  const currentCandle = prices[mostRecentIndex];
  const candleId = candleTracker.getCandleId(currentCandle);

  // Check for 9/21 EMA crossover
  if (
    ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
    ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]
  ) {
    signals.push({
      type: "EMA crossover 9/21",
      time: currentCandle.time || currentCandle.closeTime,
      price: currentCandle.close,
      candleId,
      details: "9 EMA crossed above 21 EMA, buy/long signal",
    });
  } else if (
    ema9[mostRecentIndex] < ema21[mostRecentIndex] &&
    ema9[mostRecentIndex + 1] >= ema21[mostRecentIndex + 1]
  ) {
    signals.push({
      type: "EMA crossover 9/21",
      time: currentCandle.time || currentCandle.closeTime,
      price: currentCandle.close,
      candleId,
      details: "21 EMA crossed above 9 EMA, sell/short signal",
    });
  } else if (getTrend) {
    signals.push({
      type: "EMA crossover 9/21",
      time: currentCandle.time || currentCandle.closeTime,
      price: currentCandle.close,
      candleId,
      details: `${
        ema9[mostRecentIndex] < ema21[mostRecentIndex] ? "downtrend" : "uptrend"
      }`,
    });
  }

  // Check for 20/50 EMA crossover
  if (
    ema20[mostRecentIndex] > ema50[mostRecentIndex] &&
    ema20[mostRecentIndex + 1] <= ema50[mostRecentIndex + 1]
  ) {
    signals.push({
      type: "EMA crossover 20/50",
      time: currentCandle.time || currentCandle.closeTime,
      price: currentCandle.close,
      candleId,
      details: "20 EMA crossed above 50 EMA, buy/long signal",
    });
  } else if (
    ema20[mostRecentIndex] < ema50[mostRecentIndex] &&
    ema20[mostRecentIndex + 1] >= ema50[mostRecentIndex + 1]
  ) {
    signals.push({
      type: "EMA crossover 20/50",
      time: currentCandle.time || currentCandle.closeTime,
      price: currentCandle.close,
      candleId,
      details: "50 EMA crossed above 20 EMA, sell/short signal",
    });
  } else if (getTrend) {
    signals.push({
      type: "EMA crossover 20/50",
      time: currentCandle.time || currentCandle.closeTime,
      price: currentCandle.close,
      candleId,
      details: `${
        ema20[mostRecentIndex] < ema50[mostRecentIndex] ? "downtrend" : "uptrend"
      }`,
    });
  }

  return signals;
}

/**
 * Generate standard EMA crossover signals for a given pair and duration
 */
export const generateEMASignal = async (
  keyname: string,
  duration: Duration
): Promise<EMASignal[]> => {
  const candles: any = await fetchCandleData(keyname, duration);
  if (!candles || candles.length < 50) return [];

  const closePrices = candles.map((c: any) => c.close);
  const ema9 = calculateEMA(closePrices, 9);
  const ema21 = calculateEMA(closePrices, 21);
  const ema20 = calculateEMA(closePrices, 20);
  const ema50 = calculateEMA(closePrices, 50);

  return generateCrossSignals(candles, ema9, ema21, ema20, ema50);
};

/**
 * Generate custom period EMA crossover signals
 */
export const getSmallEMASignal = async (
  keyname: string,
  duration: Duration,
  emaShort: number,
  emaLong: number
): Promise<EMASignal[]> => {
  const pairname = keyPairsMapping[keyname] || keyname;
  const candles: any = await fetchCandleData(pairname, duration);
  if (!candles || candles.length < emaLong) return [];

  const closePrices = candles.map((c: any) => c.close);
  const emasShort = calculateEMA(closePrices, emaShort);
  const emasLong = calculateEMA(closePrices, emaLong);
  const mostRecentIndex = 0;
  const currentCandle = candles[mostRecentIndex];
  const candleId = candleTracker.getCandleId(currentCandle);
  const signals: EMASignal[] = [];

  // Check for crossover
  if (
    emasShort[mostRecentIndex] > emasLong[mostRecentIndex] &&
    emasShort[mostRecentIndex + 1] <= emasLong[mostRecentIndex + 1]
  ) {
    signals.push({
      type: `EMA crossover ${emaShort}/${emaLong}`,
      time: currentCandle.time || currentCandle.closeTime,
      price: currentCandle.close,
      candleId,
      details: `${emaShort} EMA crossed above ${emaLong} EMA, buy signal`,
    });
  } else if (
    emasShort[mostRecentIndex] < emasLong[mostRecentIndex] &&
    emasShort[mostRecentIndex + 1] >= emasLong[mostRecentIndex + 1]
  ) {
    signals.push({
      type: `EMA crossover ${emaShort}/${emaLong}`,
      time: currentCandle.time || currentCandle.closeTime,
      price: currentCandle.close,
      candleId,
      details: `${emaLong} EMA crossed above ${emaShort} EMA, sell signal`,
    });
  }

  // Trend reversal condition
  const secondRecentCandle = candles[mostRecentIndex + 1];
  const isUptrend = emasShort[0] > emasLong[0];

  if (isUptrend) {
    if (
      secondRecentCandle &&
      secondRecentCandle.close >= emasShort[mostRecentIndex + 1] &&
      currentCandle.close < emasShort[mostRecentIndex]
    ) {
      signals.push({
        type: `Trend reversal condition ${emaShort}/${emaLong}`,
        time: currentCandle.time || currentCandle.closeTime,
        price: currentCandle.close,
        candleId,
        details: "Trend may change from uptrend to downtrend",
      });
    }
  } else {
    if (
      secondRecentCandle &&
      secondRecentCandle.close <= emasShort[mostRecentIndex + 1] &&
      currentCandle.close > emasShort[mostRecentIndex]
    ) {
      signals.push({
        type: `Trend reversal condition ${emaShort}/${emaLong}`,
        time: currentCandle.time || currentCandle.closeTime,
        price: currentCandle.close,
        candleId,
        details: "Trend may change from downtrend to uptrend",
      });
    }
  }

  return signals;
};

export default generateEMASignal;
