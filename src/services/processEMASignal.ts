import { Bot } from "grammy";
import candleTracker from "../bot/utils/candleTracker";
import { delay } from "../bot/utils/delay";
import {
  EMASignal,
  generateEMASignal,
  getSmallEMASignal,
} from "../bot/utils/emaSignal";
import { renderEMASignal } from "../bot/utils/renderEMASignal";
import config from "../config";
import { logger } from "../logger";
import { Duration } from "../types/Duration";

/**
 * Process EMA analysis across pairs for a given duration with candle deduplication
 */
export const processEMAAnalysis = async (
  bot: Bot,
  duration: Duration
): Promise<void> => {
  const pairs: string[] = config.BINANCE_KEY_PAIRS;

  for (const keyPair of pairs) {
    try {
      let signals: EMASignal[] = [];

      if (duration === "15m") {
        signals = await getSmallEMASignal(keyPair, duration, 20, 50);
      } else {
        signals = await generateEMASignal(keyPair, duration);
      }

      if (signals.length === 0) continue;

      // Candle deduplication: don't alert for the same candle twice across iterations
      const eligibleSignals: EMASignal[] = [];
      for (const signal of signals) {
        const trackerKey = candleTracker.getKey(keyPair, duration, signal.type);
        if (signal.candleId && candleTracker.isCandleAlerted(trackerKey, signal.candleId)) {
          continue;
        }
        eligibleSignals.push(signal);
      }

      if (eligibleSignals.length > 0) {
        await renderEMASignal(keyPair, eligibleSignals, bot, duration);

        for (const signal of eligibleSignals) {
          if (signal.candleId) {
            const trackerKey = candleTracker.getKey(keyPair, duration, signal.type);
            candleTracker.recordCandleAlert(trackerKey, signal.candleId);
          }
        }
      }
    } catch (error) {
      logger(
        `Error processing EMA analysis for ${keyPair} at ${duration}: ${error}`,
        "red"
      );
    } finally {
      await delay(config.DELAY_BETWEEN_PAIRS_MS);
    }
  }
};

export default processEMAAnalysis;
