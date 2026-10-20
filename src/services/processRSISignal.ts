import { Bot } from "grammy";
import candleTracker from "../bot/utils/candleTracker";
import { delay } from "../bot/utils/delay";
import generateRSISignal from "../bot/utils/generateRSIOverBoughtSignal";
import { renderRSISignal, RSISignal } from "../bot/utils/renderRSISignal";
import config from "../config";
import { logger } from "../logger";
import { Duration, UpstoxInterval } from "../types/Duration";
import getStockHistoricalCandles from "./getStockHistoricalCandles";
import { fetchCandleData } from "./priceApi";

/**
 * Process RSI analysis for all pairs at a given duration with candle deduplication
 */
export const processRSIAnalysis = async (
  bot: Bot,
  fallbackKeyPairs: string[],
  duration: Duration | UpstoxInterval,
  neutral: boolean = false
): Promise<void> => {
  for (const keyPair of fallbackKeyPairs) {
    try {
      const isUpstox =
        config.ENABLE_UPSTOX && config.UPSTOX_KEY_PAIRS.includes(keyPair);
      const candles: any = isUpstox
        ? await getStockHistoricalCandles(keyPair, duration as UpstoxInterval)
        : await fetchCandleData(keyPair, duration);

      if (!candles || candles.length === 0) continue;

      const signals: RSISignal[] = await generateRSISignal(keyPair, candles, neutral);

      // Deduplicate: don't alert for the same candle twice across scheduler iterations
      const eligibleSignals: RSISignal[] = [];
      const currentCandle = candles[candles.length - 1];
      const candleId = candleTracker.getCandleId(currentCandle);

      for (const signal of signals) {
        // Skip neutral from spamming if already notified
        const trackerKey = candleTracker.getKey(keyPair, duration, signal.type);
        if (candleTracker.isCandleAlerted(trackerKey, candleId)) {
          continue;
        }
        signal.candleId = candleId;
        eligibleSignals.push(signal);
      }

      if (eligibleSignals.length > 0) {
        const sentCount = await renderRSISignal(keyPair, eligibleSignals, bot, duration);

        if (sentCount > 0) {
          for (const signal of eligibleSignals) {
            const trackerKey = candleTracker.getKey(keyPair, duration, signal.type);
            candleTracker.recordCandleAlert(trackerKey, candleId);
          }
        }
      }
    } catch (error) {
      logger(
        `Error processing RSI analysis for ${keyPair} at ${duration}: ${error}`,
        "red"
      );
    } finally {
      await delay(config.DELAY_BETWEEN_PAIRS_MS);
    }
  }
};

export default processRSIAnalysis;