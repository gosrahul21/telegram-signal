import { Bot } from "grammy";
import { Duration } from "../types/Duration";
import { keyPairsMapping } from "../utils/constants";
import { fetchCandleData } from "../services/priceApi";
import { logger } from "../logger";
const ema = require("exponential-moving-average");

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "SUIUSDT"];

// Scheduler intervals (in minutes)
const SCHEDULER_INTERVALS = {
  "15m": 15, // 15-minute analysis every 15 minutes
  "1h": 60, // 1-hour analysis every 60 minutes
  "4h": 240, // 4-hour analysis every 4 hours
  "1d": 1440, // Daily analysis every 24 hours
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

interface EMASignal {
  type: string;
  time: number;
  price: number;
  details: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateEMA(
  candlePrices: { close: number }[],
  duration: number
): number[] {
  const arr = candlePrices.map((candle: any) => candle.close);
  arr.reverse();
  return ema(arr, duration).reverse();
}

// ============================================================================
// EMA ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Generate EMA crossover signals
 */
export function generateCrossSignals(
  prices: any,
  ema9: Array<number>,
  ema21: Array<number>,
  ema20: Array<number>,
  ema50: Array<number>,
  getTrend = false
): EMASignal[] {
  const signals: EMASignal[] = [];
  const mostRecentIndex = 0;

  // Check for 9/21 EMA crossover
  if (
    ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
    ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]
  ) {
    signals.push({
      type: "EMA crossover 9/21",
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: "9 EMA crossed above 21 EMA, buy/long signal",
    });
  } else if (
    ema9[mostRecentIndex] < ema21[mostRecentIndex] &&
    ema9[mostRecentIndex + 1] >= ema21[mostRecentIndex + 1]
  ) {
    signals.push({
      type: "EMA crossover 9/21",
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: "21 EMA crossed above 9 EMA, sell/short signal",
    });
  } else if (getTrend) {
    signals.push({
      type: "EMA crossover 9/21",
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
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
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: "20 EMA crossed above 50 EMA",
    });
  } else if (
    ema20[mostRecentIndex] < ema50[mostRecentIndex] &&
    ema20[mostRecentIndex + 1] >= ema50[mostRecentIndex + 1]
  ) {
    signals.push({
      type: "EMA crossover 20/50",
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: "50 EMA crossed above 20 EMA, sell/short signal",
    });
  } else if (getTrend) {
    signals.push({
      type: "EMA crossover 20/50",
      time: prices[mostRecentIndex].time,
      price: prices[mostRecentIndex].close,
      details: `${
        ema20[mostRecentIndex] < ema50[mostRecentIndex]
          ? "downtrend"
          : "uptrend"
      }`,
    });
  }

  return signals;
}

/**
 * Generate EMA signals for a given pair and duration
 */
export const generateSignal = async (
  keyname: string,
  duration: Duration
): Promise<EMASignal[]> => {
  const candles: any = await fetchCandleData(keyname, duration);
  const ema9 = calculateEMA(candles, 9);
  const ema21 = calculateEMA(candles, 21);
  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);

  return generateCrossSignals(candles, ema9, ema21, ema20, ema50);
};

/**
 * Generate custom EMA crossover signals with specified periods
 */
export const getSmallSignal = async (
  keyname: string,
  duration: Duration,
  emaShort: number,
  emaLong: number
): Promise<EMASignal[]> => {
  const pairname = keyPairsMapping[keyname];
  const candles: any = await fetchCandleData(pairname, duration);
  const emasShort = calculateEMA(candles, emaShort);
  const emasLong = calculateEMA(candles, emaLong);
  const mostRecentIndex = 0;
  const signals: EMASignal[] = [];

  // Check for EMA crossover
  if (
    emasShort[mostRecentIndex] > emasLong[mostRecentIndex] &&
    emasShort[mostRecentIndex + 1] <= emasLong[mostRecentIndex + 1]
  ) {
    signals.push({
      type: `EMA crossover ${emaShort}/${emaLong}`,
      time: candles[mostRecentIndex].time,
      price: candles[mostRecentIndex].close,
      details: `${emaShort} EMA crossed above ${emaLong} EMA`,
    });
  } else if (
    emasShort[mostRecentIndex] < emasLong[mostRecentIndex] &&
    emasShort[mostRecentIndex + 1] >= emasLong[mostRecentIndex + 1]
  ) {
    signals.push({
      type: `EMA crossover ${emaShort}/${emaLong}`,
      time: candles[mostRecentIndex].time,
      price: candles[mostRecentIndex].close,
      details: `${emaLong} EMA crossed above ${emaShort} EMA, sell/short signal`,
    });
  }

  // Check for trend reversal conditions
  const recentCandle: CandleData = candles[mostRecentIndex];
  const secondRecentCandle: CandleData = candles[mostRecentIndex + 1];
  const trend = emasShort[0] > emasLong[0] ? "UPTREND" : "DOWNTREND";

  if (trend === "UPTREND") {
    if (
      secondRecentCandle.close >= emasShort[mostRecentIndex + 1] &&
      recentCandle.close < emasShort[mostRecentIndex]
    ) {
      signals.push({
        type: `Trend reversal condition ${emaShort}/${emaLong}`,
        time: candles[mostRecentIndex].time,
        price: candles[mostRecentIndex].close,
        details:
          "trend may change, from downtrend to uptrend, take decision wisely",
      });
    }
  } else {
    if (
      secondRecentCandle.close <= emasShort[mostRecentIndex + 1] &&
      recentCandle.close > emasShort[mostRecentIndex]
    ) {
      signals.push({
        type: `Trend reversal condition ${emaShort}/${emaLong}`,
        time: candles[mostRecentIndex].time,
        price: candles[mostRecentIndex].close,
        details:
          "trend may change, from uptrend to downtrend, take decision wisely",
      });
    }
  }

  return signals;
};

// ============================================================================
// SIGNAL RENDERING
// ============================================================================

/**
 * Render EMA signals to Telegram
 */
export const renderSignal = async (
  pairName: string,
  signals: EMASignal | EMASignal[],
  bot: Bot,
  duration: string
): Promise<void> => {
  const signalArray = Array.isArray(signals) ? signals : [signals];

  for (const signal of signalArray) {
    await bot.api.sendMessage(
      process.env.CHAT_ID || "",
      `<b>EMA Signal for ${pairName} - ${duration}</b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}\nDetails: ${signal.details}`,
      { parse_mode: "HTML" }
    );
  }
};

// ============================================================================
// SCHEDULER FUNCTIONS
// ============================================================================

/**
 * Process EMA analysis for all pairs at a given duration
 */
const processEMAAnalysis = async (
  bot: Bot,
  duration: Duration
): Promise<void> => {
  for (const keyPair of fallbackKeyPairs) {
    try {
      let signals: EMASignal[] = [];

      // Use different signal generation based on duration
      if (duration === "15m") {
        signals = await getSmallSignal(keyPair, duration, 20, 50);
      } else {
        signals = await generateSignal(keyPair, duration);
      }

      if (signals.length > 0) {
        await renderSignal(keyPair, signals, bot, duration);
      }
    } catch (error) {
      logger(
        `Error processing EMA analysis for ${keyPair} at ${duration}: ${error}`,
        "red"
      );
    }
  }
};

/**
 * Set up EMA analysis interval for a specific duration
 */
const setupEMAInterval = (
  bot: Bot,
  duration: Duration,
  intervalMinutes: number
): void => {
  const intervalMs = intervalMinutes * 60 * 1000;

  logger(
    `${duration} EMA analysis started every ${intervalMinutes} minutes`,
    "green"
  );

  setInterval(async () => {
    await processEMAAnalysis(bot, duration);
  }, intervalMs);
};

/**
 * Main EMA cross scheduler function
 */
export const emaCrossScheduler = async (bot: Bot): Promise<void> => {
  logger("EMA Cross Scheduler started", "green");

  // Set up intervals for all timeframes
  Object.entries(SCHEDULER_INTERVALS).forEach(([duration, interval]) => {
    console.log(duration, interval);
    setupEMAInterval(bot, duration as Duration, interval);
  });

  logger("All EMA analysis intervals configured", "green");
};
