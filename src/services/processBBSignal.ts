import { Bot } from "grammy";
import candleTracker from "../bot/utils/candleTracker";
import { delay } from "../bot/utils/delay";
import { BBSignal, generateBBSignal } from "../bot/utils/bollingerBandsSignal";
import { renderBBSignal } from "../bot/utils/renderBBSignal";
import config from "../config";
import { logger } from "../logger";
import { Duration, UpstoxInterval } from "../types/Duration";
import getStockHistoricalCandles from "./getStockHistoricalCandles";
import { fetchCandleData } from "./priceApi";

/**
 * Process Bollinger Bands analysis for all pairs at a given duration.
 * Deduplicates alerts so that if a price hits BB band once in an iteration,
 * no telegram message is sent for the same candle on subsequent iterations.
 */
export const processBBAnalysis = async (
  bot: Bot,
  pairs: string[],
  duration: Duration | UpstoxInterval
): Promise<void> => {
  for (const keyPair of pairs) {
    try {
      const isUpstox =
        config.ENABLE_UPSTOX && config.UPSTOX_KEY_PAIRS.includes(keyPair);
      const candles: any = isUpstox
        ? await getStockHistoricalCandles(keyPair, duration as UpstoxInterval)
        : await fetchCandleData(keyPair, duration);

      if (!candles || candles.length === 0) {
        continue;
      }

      const signals: BBSignal[] = generateBBSignal(keyPair, candles);

      // Filter signals using candleTracker to ensure:
      // "if price hit bb band once in an iteration, don't send telegram message for same candle on next iteration"
      const eligibleSignals: BBSignal[] = [];

      for (const signal of signals) {
        const trackerKey = candleTracker.getKey(keyPair, duration, signal.type);
        if (candleTracker.isCandleAlerted(trackerKey, signal.candleId)) {
          logger(
            `[BB Deduplication] Skipping ${signal.type} for ${keyPair} (${duration}) - Candle ${signal.candleId} already alerted.`,
            "yellow"
          );
          continue;
        }

        eligibleSignals.push(signal);
      }

      if (eligibleSignals.length > 0) {
        const sentCount = await renderBBSignal(keyPair, eligibleSignals, bot, duration);

        // Record candle as alerted so next iterations on the same candle will NOT alert again
        if (sentCount > 0) {
          for (const signal of eligibleSignals) {
            const trackerKey = candleTracker.getKey(keyPair, duration, signal.type);
            candleTracker.recordCandleAlert(trackerKey, signal.candleId);
          }
        }
      }
    } catch (error) {
      logger(
        `Error processing Bollinger Bands analysis for ${keyPair} at ${duration}: ${error}`,
        "red"
      );
    } finally {
      await delay(config.DELAY_BETWEEN_PAIRS_MS);
    }
  }
};

export default processBBAnalysis;
