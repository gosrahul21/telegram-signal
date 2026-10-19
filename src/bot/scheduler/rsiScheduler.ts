import { Bot } from "grammy";
import * as schedule from "node-schedule";
import config from "../../config";
import {
  CRYPTO_SCHEDULER_INTERVALS,
  STOCK_DAILY_CRON_EXPRESSIONS,
  STOCK_MARKET_CRON_EXPRESSIONS,
} from "../../constants/scheduler";
import { logger } from "../../logger";
import processRSIAnalysis from "../../services/processRSISignal";
import { Duration, UpstoxInterval } from "../../types/Duration";
import { delay } from "../utils/delay";

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
    await processRSIAnalysis(bot, config.BINANCE_KEY_PAIRS, duration);
  }, intervalMs);
};

/**
 * Main RSI scheduler function
 */
export const rsiScheduler = async (bot: Bot): Promise<void> => {
  logger("RSI Scheduler crypto started", "green");

  // Set up intervals for all crypto timeframes
  for (const [duration, interval] of Object.entries(CRYPTO_SCHEDULER_INTERVALS)) {
    setupRSIInterval(bot, duration as Duration, interval);
    await delay(7000);
  }

  logger("RSI Scheduler stock started", "green");
  // Stock scheduler during market hours
  STOCK_MARKET_CRON_EXPRESSIONS.forEach((cronExpression) => {
    schedule.scheduleJob(cronExpression, () => {
      processRSIAnalysis(bot, config.UPSTOX_KEY_PAIRS, UpstoxInterval.OneHour);
    });
  });

  logger("RSI daily Scheduler stock started", "green");
  // Daily reports for stocks
  STOCK_DAILY_CRON_EXPRESSIONS.forEach((cronExpression) => {
    schedule.scheduleJob(cronExpression, () => {
      processRSIAnalysis(bot, config.UPSTOX_KEY_PAIRS, UpstoxInterval.OneDay);
    });
  });

  logger("All RSI analysis intervals configured", "green");
};

export default rsiScheduler;
