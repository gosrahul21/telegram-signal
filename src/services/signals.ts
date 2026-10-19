import { Duration } from "../types/Duration";
import {
  generateCrossSignals,
  generateEMASignal,
  getSmallEMASignal,
} from "../bot/utils/emaSignal";
import { calculateEMA, calculateRSI } from "../utils/helper/techincalIndicators";
import { fetchCandleData, fetchTickerPrice } from "./priceApi";

// Re-export core indicator and signal functions to eliminate duplicate implementations
export { calculateEMA, generateCrossSignals };
export const generateSignal = generateEMASignal;
export const getSmallSignal = getSmallEMASignal;

export const checkIfPriceNearEma = (prices: any, ema: any) => {
  const signals = [];
  const mostRecentIndex = 0;
  const priceToEMA9Ratio =
    Math.abs(prices[mostRecentIndex].close - ema[mostRecentIndex]) /
    ema[mostRecentIndex];
  const proximityThreshold = 0.01;

  if (priceToEMA9Ratio < proximityThreshold) {
    signals.push({
      type: "Price near 9 EMA",
      time: prices[mostRecentIndex].time || prices[mostRecentIndex].closeTime,
      price: prices[mostRecentIndex].close,
      details: `Price is within ${proximityThreshold * 100}% of 9 EMA`,
    });
  }
  return signals;
};

export const priceAwayFromAverage = async (
  keyName: string,
  pairName: string,
  duration: Duration
) => {
  const prices: any = await fetchTickerPrice(keyName);
  if (!prices || !Array.isArray(prices)) return [];
  const price = prices.find((p: any) => p.market === keyName);
  if (!price) return [];

  const candles: any = await fetchCandleData(pairName, duration);
  if (!candles || candles.length === 0) return [];
  const ema = calculateEMA(candles.map((c: any) => c.close), 9);
  const mostRecentIndex = 0;
  const signals = [];

  const priceToEMA9Ratio =
    (price.last_price - ema[mostRecentIndex]) / ema[mostRecentIndex];
  const proximityThreshold = 0.12;
  if (priceToEMA9Ratio >= proximityThreshold) {
    signals.push({
      type: `${keyName} Price in overbought Zone`,
      time: Date.now(),
      price: price.last_price,
      details: `Price is ${proximityThreshold * 100}% above 9 EMA, sell signal`,
    });
  }
  return signals;
};

export const getTrend = (emasShort: number[], emasLong: number[]) => {
  return emasShort[0] > emasLong[0] ? "UPTREND" : "DOWNTREND";
};

export const getRSIOverbought = async (keyname: string, duration: Duration) => {
  const candles: any = await fetchCandleData(keyname, duration);
  if (!candles) return [];
  return calculateRSI(
    candles.map((candle: any) => candle.close),
    14
  );
};
