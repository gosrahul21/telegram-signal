import { Bot } from "grammy";
import * as schedule from "node-schedule";
import config from "../../config";
import {
  CRYPTO_SCHEDULER_INTERVALS,
  STOCK_DAILY_CRON_EXPRESSIONS,
  STOCK_MARKET_CRON_EXPRESSIONS,
} from "../../constants/scheduler";
import { logger } from "../../logger";
import { processBBAnalysis } from "../../services/processBBSignal";
import { Duration, UpstoxInterval } from "../../types/Duration";
import { delay } from "../utils/delay";

/**
 * Set up Bollinger Bands analysis interval for a specific duration
 */
const setupBBInterval = (
  bot: Bot,
  duration: Duration,
  intervalMinutes: number
): void => {
  const intervalMs = intervalMinutes * 60 * 1000;

  logger(
    `${duration} Bollinger Bands analysis started every ${intervalMinutes} minutes`,
    "green"
  );

  setInterval(async () => {
    await processBBAnalysis(bot, config.BINANCE_KEY_PAIRS, duration);
  }, intervalMs);
};

/**
 * Main Bollinger Bands scheduler function
 */
export const bbScheduler = async (bot: Bot): Promise<void> => {
  logger("Bollinger Bands Scheduler crypto started", "green");

  // Set up intervals for all crypto timeframes
  for (const [duration, interval] of Object.entries(CRYPTO_SCHEDULER_INTERVALS)) {
    setupBBInterval(bot, duration as Duration, interval);
    await delay(7000);
  }

  logger("Bollinger Bands Scheduler stock started", "green");
  // Stock scheduler during market hours
  STOCK_MARKET_CRON_EXPRESSIONS.forEach((cronExpression) => {
    schedule.scheduleJob(cronExpression, () => {
      processBBAnalysis(bot, config.UPSTOX_KEY_PAIRS, UpstoxInterval.OneHour);
    });
  });

  logger("Bollinger Bands daily Scheduler stock started", "green");
  // Daily reports for stocks
  STOCK_DAILY_CRON_EXPRESSIONS.forEach((cronExpression) => {
    schedule.scheduleJob(cronExpression, () => {
      processBBAnalysis(bot, config.UPSTOX_KEY_PAIRS, UpstoxInterval.OneDay);
    });
  });

  logger("All Bollinger Bands analysis intervals configured", "green");
};

export default bbScheduler;
