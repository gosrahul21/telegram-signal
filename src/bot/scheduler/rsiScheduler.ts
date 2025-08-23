import { Bot } from 'grammy';
import { fetchCandleData, fetchTickerPrice } from '../../services/priceApi';
import { Duration, UpstoxInterval } from '@/types/Duration';
import { calculateRSI } from '../../utils/helper/techincalIndicators';
import config from '../../config/index';
import * as schedule from 'node-schedule';
import { logger } from '../../logger';
import { delay } from '../utils/delay';
import generateRSISignal from '../utils/generateRSIOverBoughtSignal';
import getStockHistoricalCandles from '../../services/getStockHistoricalCandles';
import {
  renderRSISignal,
  RSISignal,
  RSIStatus,
} from '../utils/renderRSISignal';
import processRSIAnalysis from '../../services/processRSISignal';

const ema = require('exponential-moving-average');

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const fallbackKeyPairs = ['BTCUSDT', 'SOLUSDT', 'SUIUSDT'];

// Scheduler intervals (in minutes)
const SCHEDULER_INTERVALS = {
  '15m': 5, // 15-minute analysis every 5 minutes
  '1h': 15, // 1-hour analysis every 15 minutes
  '4h': 60, // 4-hour analysis every 60 minutes
  '1d': 720, // Daily analysis every 12 hours
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
  duration: number,
) {
  const arr = candlePrices.map((candle: any) => candle.close);
  arr.reverse();
  return ema(arr, duration).reverse();
}

// ============================================================================
// PRICE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Check if price is away from EMA (overbought zone)
 */
export const priceAwayFromAverage = async (
  keyName: string,
  pairName: string,
  duration: Duration,
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
 * Set up RSI analysis interval for a specific duration
 */
const setupRSIInterval = (
  bot: Bot,
  duration: Duration,
  intervalMinutes: number,
): void => {
  const intervalMs = intervalMinutes * 60 * 1000;

  logger(
    `${duration} RSI analysis started every ${intervalMinutes} minutes`,
    'green',
  );

  // cryto scheduler
  setInterval(async () => {
    await processRSIAnalysis(bot, config.BINANCE_KEY_PAIRS, duration);
  }, intervalMs);
};

/**
 * Main RSI scheduler function
 */
export const rsiScheduler = async (bot: Bot): Promise<void> => {
  logger('RSI Scheduler crypto started', 'green');

  // Set up intervals for all timeframes
  for (let [duration, interval] of Object.entries(SCHEDULER_INTERVALS)) {
    setupRSIInterval(bot, duration as Duration, interval);
    await delay(7000);
    console.log('setup of listner');
  }

  logger('RSI Scheduler stock started', 'green');
  // stock scheduler - every 15 minutes from 9:15 AM to 3:30 PM
  const cronExpressions = [
    // "15 9 * * 1-5", // 9:15 AM
    '30 9 * * 1-5', // 9:30 AM
    '45 9 * * 1-5', // 9:45 AM
    '0 10 * * 1-5', // 10:00 AM
    '15 10 * * 1-5', // 10:15 AM
    '30 10 * * 1-5', // 10:30 AM
    '45 10 * * 1-5', // 10:45 AM
    '0 11 * * 1-5', // 11:00 AM
    '15 11 * * 1-5', // 11:15 AM
    '30 11 * * 1-5', // 11:30 AM
    '45 11 * * 1-5', // 11:45 AM
    '0 12 * * 1-5', // 12:00 PM
    '15 12 * * 1-5', // 12:15 PM
    '30 12 * * 1-5', // 12:30 PM
    '45 12 * * 1-5', // 12:45 PM
    '0 13 * * 1-5', // 1:00 PM
    '15 13 * * 1-5', // 1:15 PM
    '30 13 * * 1-5', // 1:30 PM
    '45 13 * * 1-5', // 1:45 PM
    '0 14 * * 1-5', // 2:00 PM
    '15 14 * * 1-5', // 2:15 PM
    '30 14 * * 1-5', // 2:30 PM
    '45 14 * * 1-5', // 2:45 PM
    '0 15 * * 1-5', // 3:00 PM
    '15 15 * * 1-5', // 3:15 PM
    '30 15 * * 1-5', // 3:30 PM
  ];

  // Schedule the task for each cron expression
  cronExpressions.forEach((cronExpression) => {
    schedule.scheduleJob(cronExpression, () => {
      processRSIAnalysis(bot, config.UPSTOX_KEY_PAIRS, UpstoxInterval.OneHour);
    });
  });

  logger('RSI daily Scheduler stock started', 'green');

  // Schedule daily reports at 12 PM and 3 PM
  schedule.scheduleJob('0 12 * * 1-5', () => {
    return processRSIAnalysis(
      bot,
      config.UPSTOX_KEY_PAIRS,
      UpstoxInterval.OneDay,
    );
  });

  schedule.scheduleJob('0 15 * * 1-5', () => {
    return processRSIAnalysis(
      bot,
      config.UPSTOX_KEY_PAIRS,
      UpstoxInterval.OneDay,
    );
  });

  logger('All RSI analysis intervals configured', 'green');
};
