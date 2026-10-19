import config from "../../config";
import { calculateBollingerBands } from "../../utils/helper/techincalIndicators";
import candleTracker from "./candleTracker";

export interface BBSignal {
  type: "bb_upper" | "bb_lower";
  keyName: string;
  price: number;
  upper: number;
  middle: number;
  lower: number;
  candleId: string | number;
  candleTime: string | number;
  details: string;
}

/**
 * Generate Bollinger Bands signals (bb_upper and bb_lower hits) for a given candle series
 */
export const generateBBSignal = (
  keyName: string,
  candles: any[],
  period: number = config.BB_PERIOD || 20,
  stdDev: number = config.BB_STD_DEV || 2
): BBSignal[] => {
  if (!candles || candles.length < period) {
    return [];
  }

  const closePrices = candles.map((candle: any) => candle.close);
  const bbResults = calculateBollingerBands(closePrices, period, stdDev);

  if (!bbResults || bbResults.length === 0) {
    return [];
  }

  const currentBB = bbResults[bbResults.length - 1];
  const mostRecentIndex = candles.length - 1;
  const currentCandle = candles[mostRecentIndex];
  const currentPrice = currentCandle.close;
  const candleId = candleTracker.getCandleId(currentCandle);
  const candleTime = currentCandle.closeTime ?? currentCandle.openTime ?? Date.now();

  const signals: BBSignal[] = [];

  // Check for BB Upper Band Hit
  if (currentPrice >= currentBB.upper) {
    signals.push({
      type: "bb_upper",
      keyName,
      price: currentPrice,
      upper: currentBB.upper,
      middle: currentBB.middle,
      lower: currentBB.lower,
      candleId,
      candleTime,
      details: `Price (${currentPrice}) crossed above Upper Band (${currentBB.upper.toFixed(2)})`,
    });
  } else if (currentCandle.high !== undefined && currentCandle.high >= currentBB.upper) {
    signals.push({
      type: "bb_upper",
      keyName,
      price: currentPrice,
      upper: currentBB.upper,
      middle: currentBB.middle,
      lower: currentBB.lower,
      candleId,
      candleTime,
      details: `Candle High (${currentCandle.high}) reached Upper Band (${currentBB.upper.toFixed(2)}) [Current Close: ${currentPrice}]`,
    });
  }

  // Check for BB Lower Band Hit
  if (currentPrice <= currentBB.lower) {
    signals.push({
      type: "bb_lower",
      keyName,
      price: currentPrice,
      upper: currentBB.upper,
      middle: currentBB.middle,
      lower: currentBB.lower,
      candleId,
      candleTime,
      details: `Price (${currentPrice}) crossed below Lower Band (${currentBB.lower.toFixed(2)})`,
    });
  } else if (currentCandle.low !== undefined && currentCandle.low <= currentBB.lower) {
    signals.push({
      type: "bb_lower",
      keyName,
      price: currentPrice,
      upper: currentBB.upper,
      middle: currentBB.middle,
      lower: currentBB.lower,
      candleId,
      candleTime,
      details: `Candle Low (${currentCandle.low}) reached Lower Band (${currentBB.lower.toFixed(2)}) [Current Close: ${currentPrice}]`,
    });
  }

  return signals;
};

export default generateBBSignal;
