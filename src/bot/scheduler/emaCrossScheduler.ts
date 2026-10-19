import { Bot } from "grammy";
import { EMA_SCHEDULER_INTERVALS } from "../../constants/scheduler";
import { logger } from "../../logger";
import { processEMAAnalysis } from "../../services/processEMASignal";
import { Duration } from "../../types/Duration";

// Re-export functions for backwards-compatibility
export {
  generateCrossSignals,
  generateEMASignal as generateSignal,
  getSmallEMASignal as getSmallSignal,
} from "../utils/emaSignal";
export { renderEMASignal as renderSignal } from "../utils/renderEMASignal";

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

  // Set up intervals for all configured timeframes
  Object.entries(EMA_SCHEDULER_INTERVALS).forEach(([duration, interval]) => {
    setupEMAInterval(bot, duration as Duration, interval);
  });

  logger("All EMA analysis intervals configured", "green");
};

export default emaCrossScheduler;
