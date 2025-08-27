import { Duration } from '@/utils/types/Duration';
import { keyPairsMapping } from '../utils/constants';
const ema = require('exponential-moving-average');

interface CandleData {
  open: number;
  high: number;
  low: number;
  volume: number;
  close: number;
  time: number; // Time as a timestamp in milliseconds
}

export function calculateEMA(
  candlePrices: { close: number }[],
  duration: number,
) {
  const arr = candlePrices.map((candle: any) => candle.close);
  arr.reverse();
  return ema(arr, duration).reverse();
}

const candlePriceMapping: Record<string, any> = {};
const ema9Map: Record<string, any> = {};
const ema21Map: Record<string, any> = {};
const ema20Map: Record<string, any> = {};
const ema50Map: Record<string, any> = {};

// Function to generate buy signals based on recent EMA values
export function generateCrossSignals(
  prices: any,
  ema9: Array<number>,
  ema21: Array<number>,
  ema20: Array<number>,
  ema50: Array<number>,
  getTrend = false,
) {
  // Array to hold buy signals
  const signals = [];

  // Check for recent EMA crossovers
  const mostRecentIndex = 0; // Since the most recent values are first

  // Check for 9/21 EMA crossover
  if (
    ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
    ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]
  ) {
    const signal = {
      type: 'EMA crossover 9/21',
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: '9 EMA crossed above 21 EMA, buy/long signal',
    };
    signals.push(signal);
  } else if (
    ema9[mostRecentIndex] < ema21[mostRecentIndex] &&
    ema9[mostRecentIndex + 1] >= ema21[mostRecentIndex + 1]
  ) {
    signals.push({
      type: 'EMA crossover 9/21',
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: '21 EMA crossed above 9 EMA, sell/short signal',
    });
  } else if (getTrend) {
    signals.push({
      type: 'EMA crossover 9/21',
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: `${
        ema9[mostRecentIndex] < ema21[mostRecentIndex] ? 'downtrend' : 'uptrend'
      }`,
    });
  }

  // Check for 20/50 EMA crossover
  if (
    ema20[mostRecentIndex] > ema50[mostRecentIndex] &&
    ema20[mostRecentIndex + 1] <= ema50[mostRecentIndex + 1]
  ) {
    signals.push({
      type: 'EMA crossover 20/50',
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: '20 EMA crossed above 50 EMA',
    });
  } else if (
    ema20[mostRecentIndex] < ema50[mostRecentIndex] &&
    ema20[mostRecentIndex + 1] >= ema50[mostRecentIndex + 1]
  ) {
    signals.push({
      type: 'EMA crossover 20/50',
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: '21 EMA crossed above 9 EMA, sell/short signal',
    });
  } else if (getTrend) {
    signals.push({
      type: 'EMA crossover 20/50',
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: `${
        ema9[mostRecentIndex] < ema21[mostRecentIndex] ? 'downtrend' : 'uptrend'
      }`,
    });
  }
  return signals;
}

export const checkIfPriceNearEma = (prices: any, ema: any) => {
  let signals = [];
  const mostRecentIndex = 0;
  // Check if the price is near the 9 EMA
  const priceToEMA9Ratio =
    Math.abs(prices[mostRecentIndex].close - ema[mostRecentIndex]) /
    ema[mostRecentIndex];
  const proximityThreshold = 0.01; // Define a threshold (e.g., 1%) for proximity

  if (priceToEMA9Ratio < proximityThreshold) {
    signals.push({
      type: 'Price near 9 EMA',
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: `Price is within ${proximityThreshold * 100}% of 9 EMA`,
    });
  }
  return signals;
};

export const getTrendStatus = async (pairName: string, duration: Duration) => {
  const candles: any = candlePriceMapping[`${pairName}.${duration}`];
  const ema9 = calculateEMA(candles, 9);
  const ema21 = calculateEMA(candles, 21);
  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);
  // Generate crossing signals based on the EMAs and candle data
  // Process or display the signals (you can handle the output as per your requirement)
  return [
    ...generateCrossSignals(candles, ema9, ema21, ema20, ema50, true),
    ...checkIfPriceNearEma(candles, ema9),
  ];
};

export const getTrend = (emasShort: number[], emasLong: number[]) => {
  return emasShort[0] > emasLong[0] ? 'UPTREND' : 'DOWNTREND';
};
