import { Bot } from "grammy";
import { fetchCandleData, fetchTickerPrice } from "../../services/priceApi";
import { Duration } from "../../types/Duration";
import { calculateRSI } from "../../utils/helper/techincalIndicators";
import userRepository from "../../repositories/userRepository";
import config from "../../config/index";
import { logger } from "../../logger";
import {
  renderRSISignal,
  RSISignal,
  RSIStatus,
} from "../utils/renderRSISignal";
import { resolve } from "path";

const ema = require("exponential-moving-average");

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "SUIUSDT"];

// RSI thresholds

// Scheduler intervals (in minutes)
const SCHEDULER_INTERVALS = {
  "15m": 5, // 15-minute analysis every 5 minutes
  "1h": 15, // 1-hour analysis every 15 minutes
  "4h": 60, // 4-hour analysis every 60 minutes
  "1d": 720, // Daily analysis every 12 hours
};

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface CandleData {
  open: number;
  high: number;
  low: number;
  volume: number;
  close: number;
  time: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateEMA(
  candlePrices: { close: number }[],
  duration: number
) {
  const arr = candlePrices.map((candle: any) => candle.close);
  arr.reverse();
  return ema(arr, duration).reverse();
}

// ============================================================================
// RSI ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get RSI values for a given pair and duration
 */
export const getRSIValues = async (
  keyname: string,
  duration: Duration
): Promise<number[]> => {
  const candles: any = await fetchCandleData(keyname, duration);
  return calculateRSI(
    candles.map((candle: any) => candle.close),
    14
  );
};

/**
 * Get current RSI value for a given pair and duration
 */
export const getCurrentRSI = async (
  keyname: string,
  duration: Duration
): Promise<number> => {
  const rsiValues = await getRSIValues(keyname, duration);
  return rsiValues[rsiValues.length - 1];
};

/**
 * Check RSI overbought conditions
 */
export const checkRSIOverbought = async (
  keyName: string,
  pairName: string,
  duration: Duration
): Promise<RSISignal[]> => {
  const candles: any = await fetchCandleData(keyName, duration);
  const rsiValues = calculateRSI(
    candles.map((candle: any) => candle.close),
    14
  );
  const currentRSI = rsiValues[rsiValues.length - 1];
  const mostRecentIndex = 0;
  const signals: RSISignal[] = [];

  if (currentRSI >= config.RSI_EXTREME_OVERBOUGHT) {
    signals.push({
      type: `${keyName} RSI Extreme Overbought`,
      time: candles[mostRecentIndex].time,
      price: candles[mostRecentIndex].close,
      rsi: currentRSI,
      details: `RSI is extremely overbought at ${currentRSI.toFixed(
        2
      )}, strong sell signal`,
    });
  } else if (currentRSI >= config.RSI_OVERBOUGHT_THRESHOLD) {
    signals.push({
      type: `${keyName} RSI Overbought`,
      time: candles[mostRecentIndex].time,
      price: candles[mostRecentIndex].close,
      rsi: currentRSI,
      details: `RSI is overbought at ${currentRSI.toFixed(
        2
      )}, potential sell signal`,
    });
  }

  return signals;
};

/**
 * Check RSI oversold conditions
 */
export const checkRSIOversold = async (
  keyName: string,
  pairName: string,
  duration: Duration
): Promise<RSISignal[]> => {
  const candles: any = await fetchCandleData(keyName, duration);
  const rsiValues = calculateRSI(
    candles.map((candle: any) => candle.close),
    14
  );
  const currentRSI = rsiValues[rsiValues.length - 1];
  const mostRecentIndex = 0;
  const signals: RSISignal[] = [];

  if (currentRSI <= config.RSI_EXTREME_OVERSOLD) {
    signals.push({
      type: `${keyName} RSI Extreme Oversold`,
      time: candles[mostRecentIndex].time,
      price: candles[mostRecentIndex].close,
      rsi: currentRSI,
      details: `RSI is extremely oversold at ${currentRSI.toFixed(
        2
      )}, strong buy signal`,
    });
  } else if (currentRSI <= config.RSI_OVERSOLD_THRESHOLD) {
    signals.push({
      type: `${keyName} RSI Oversold`,
      time: candles[mostRecentIndex].time,
      price: candles[mostRecentIndex].close,
      rsi: currentRSI,
      details: `RSI is oversold at ${currentRSI.toFixed(
        2
      )}, potential buy signal`,
    });
  }

  return signals;
};

/**
 * Get RSI status for a specific pair and duration
 */
export const getRSIStatus = async (
  keyName: string,
  duration: Duration
): Promise<RSIStatus> => {
  const currentRSI = await getCurrentRSI(keyName, duration);
  const { price } = await fetchTickerPrice(keyName);
  const time = new Date().toISOString();

  if (currentRSI >= config.RSI_EXTREME_OVERBOUGHT) {
    return {
      type: "Extreme Overbought",
      rsi: currentRSI,
      price: price,
      time: time,
      signal: "Strong Sell",
      details: `RSI is extremely overbought at ${currentRSI.toFixed(2)}`,
    };
  } else if (currentRSI >= config.RSI_OVERBOUGHT_THRESHOLD) {
    return {
      type: "Overbought",
      rsi: currentRSI,
      price: price,
      time: time,
      signal: "Sell",
      details: `RSI is overbought at ${currentRSI.toFixed(2)}`,
    };
  } else if (currentRSI <= config.RSI_EXTREME_OVERSOLD) {
    return {
      type: "Extreme Oversold",
      rsi: currentRSI,
      price: price,
      time: time,
      signal: "Strong Buy",
      details: `RSI is extremely oversold at ${currentRSI.toFixed(2)}`,
    };
  } else if (currentRSI <= config.RSI_OVERSOLD_THRESHOLD) {
    return {
      type: "Oversold",
      rsi: currentRSI,
      price: price,
      time: time,
      signal: "Buy",
      details: `RSI is oversold at ${currentRSI.toFixed(2)}`,
    };
  } else {
    return {
      type: "Neutral",
      rsi: currentRSI,
      price: price,
      time: time,
      signal: "Hold",
      details: `RSI is neutral at ${currentRSI.toFixed(2)}`,
    };
  }
};

// ============================================================================
// PRICE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Check if price is away from EMA (overbought zone)
 */
export const priceAwayFromAverage = async (
  keyName: string,
  pairName: string,
  duration: Duration
): Promise<RSISignal[]> => {
  const prices: any = await fetchTickerPrice(keyName);
  const price = prices.find((price: any) => price.market === keyName);
  const signals: RSISignal[] = [];

  // Note: This function needs EMA data to work properly
  // For now, we'll return empty array as EMA mapping is not implemented
  // TODO: Implement proper EMA mapping and calculation

  return signals;
};

// ============================================================================
// SCHEDULER FUNCTIONS
// ============================================================================

/**
 * Process RSI analysis for all pairs at a given duration
 */
const processRSIAnalysis = async (
  bot: Bot,
  duration: Duration
): Promise<void> => {
  for (const keyPair of fallbackKeyPairs) {
    try {
      // Check overbought conditions
      const overboughtSignals = await checkRSIOverbought(
        keyPair,
        keyPair,
        duration
      );
      if (overboughtSignals.length > 0) {
        await renderRSISignal(keyPair, overboughtSignals, bot, duration);
      }

      // Check oversold conditions
      const oversoldSignals = await checkRSIOversold(
        keyPair,
        keyPair,
        duration
      );
      if (oversoldSignals.length > 0) {
        await renderRSISignal(keyPair, oversoldSignals, bot, duration);
      }
    } catch (error) {
      logger(
        `Error processing RSI analysis for ${keyPair} at ${duration}: ${error}`,
        "red"
      );
    } finally {
      // 1 sec timeout
      await new Promise((resolve) =>
        setTimeout(() => resolve(1), config.DELAY_BETWEEN_PAIRS_MS)
      );
    }
  }
};

/**
 * Set up RSI analysis interval for a specific duration
 */
const setupRSIInterval = (
  bot: Bot,
  duration: Duration,
  intervalMinutes: number
): void => {
  const intervalMs = intervalMinutes * 60 * 1000;

  logger(
    `${duration} RSI analysis started every ${intervalMinutes} minutes`,
    "green"
  );

  setInterval(async () => {
    await processRSIAnalysis(bot, duration);
  }, intervalMs);
};

/**
 * Main RSI scheduler function
 */
export const rsiScheduler = async (bot: Bot): Promise<void> => {
  logger("RSI Scheduler started", "green");

  // Set up intervals for all timeframes
  Object.entries(SCHEDULER_INTERVALS).forEach(([duration, interval]) => {
    setupRSIInterval(bot, duration as Duration, interval);
  });

  logger("All RSI analysis intervals configured", "green");
};
