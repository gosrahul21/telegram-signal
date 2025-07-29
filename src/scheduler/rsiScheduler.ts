import { Bot } from "grammy";
import { Duration } from "../types/Duration";
import { fetchCandleData, fetchTickerPrice } from "../services/priceApi";
import { calculateRSI } from "../utils/helper/techincalIndicators";
import { logger } from "../logger";
import { subscriberId } from "../services/bot";
const ema = require("exponential-moving-average");

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "SUIUSDT"];

// RSI thresholds
const RSI_OVERBOUGHT_THRESHOLD = 70;
const RSI_OVERSOLD_THRESHOLD = 30;
const RSI_EXTREME_OVERBOUGHT = 80;
const RSI_EXTREME_OVERSOLD = 20;

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

interface CandleData {
  open: number;
  high: number;
  low: number;
  volume: number;
  close: number;
  time: number;
}

interface RSISignal {
  type: string;
  time: number;
  price: number;
  rsi?: number;
  details: string;
}

interface RSIStatus {
  status:
    | "Extreme Overbought"
    | "Overbought"
    | "Neutral"
    | "Oversold"
    | "Extreme Oversold";
  rsi: number;
  signal: "Strong Sell" | "Sell" | "Hold" | "Buy" | "Strong Buy";
  details: string;
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

  if (currentRSI >= RSI_EXTREME_OVERBOUGHT) {
    signals.push({
      type: `${keyName} RSI Extreme Overbought`,
      time: candles[mostRecentIndex].time,
      price: candles[mostRecentIndex].close,
      rsi: currentRSI,
      details: `RSI is extremely overbought at ${currentRSI.toFixed(
        2
      )}, strong sell signal`,
    });
  } else if (currentRSI >= RSI_OVERBOUGHT_THRESHOLD) {
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

  if (currentRSI <= RSI_EXTREME_OVERSOLD) {
    signals.push({
      type: `${keyName} RSI Extreme Oversold`,
      time: candles[mostRecentIndex].time,
      price: candles[mostRecentIndex].close,
      rsi: currentRSI,
      details: `RSI is extremely oversold at ${currentRSI.toFixed(
        2
      )}, strong buy signal`,
    });
  } else if (currentRSI <= RSI_OVERSOLD_THRESHOLD) {
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

  if (currentRSI >= RSI_EXTREME_OVERBOUGHT) {
    return {
      status: "Extreme Overbought",
      rsi: currentRSI,
      signal: "Strong Sell",
      details: `RSI is extremely overbought at ${currentRSI.toFixed(2)}`,
    };
  } else if (currentRSI >= RSI_OVERBOUGHT_THRESHOLD) {
    return {
      status: "Overbought",
      rsi: currentRSI,
      signal: "Sell",
      details: `RSI is overbought at ${currentRSI.toFixed(2)}`,
    };
  } else if (currentRSI <= RSI_EXTREME_OVERSOLD) {
    return {
      status: "Extreme Oversold",
      rsi: currentRSI,
      signal: "Strong Buy",
      details: `RSI is extremely oversold at ${currentRSI.toFixed(2)}`,
    };
  } else if (currentRSI <= RSI_OVERSOLD_THRESHOLD) {
    return {
      status: "Oversold",
      rsi: currentRSI,
      signal: "Buy",
      details: `RSI is oversold at ${currentRSI.toFixed(2)}`,
    };
  } else {
    return {
      status: "Neutral",
      rsi: currentRSI,
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
// SIGNAL RENDERING
// ============================================================================

/**
 * Render RSI signals to Telegram
 */
export const renderRSISignal = async (
  pairName: string,
  signals: RSISignal | RSISignal[],
  bot: Bot,
  duration: string
): Promise<void> => {
  const signalArray = Array.isArray(signals) ? signals : [signals];

  for (const signal of signalArray) {
    const rsiInfo = signal.rsi ? `\nRSI: ${signal.rsi.toFixed(2)}` : "";

    // Broadcast to all subscribed users
    for (const chatId of subscriberId) {
      try {
        await bot.api.sendMessage(
          chatId,
          `<b>RSI Signal for ${pairName} - ${duration}</b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}${rsiInfo}\nDetails: ${signal.details}`,
          { parse_mode: "HTML" }
        );
      } catch (error) {
        console.error(`Failed to send RSI signal to ${chatId}:`, error);
      }
    }

    // Also send to default chat ID if no subscribers
    if (subscriberId.length === 0) {
      try {
        await bot.api.sendMessage(
          process.env.CHAT_ID || "",
          `<b>RSI Signal for ${pairName} - ${duration}</b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}${rsiInfo}\nDetails: ${signal.details}`,
          { parse_mode: "HTML" }
        );
      } catch (error) {
        console.error(`Failed to send RSI signal to default chat:`, error);
      }
    }
  }
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
    // bot.api.sendMessage(subscriberId?.[0] || "", "RSI Scheduler started");
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
