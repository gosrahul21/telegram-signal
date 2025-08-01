import { Bot } from "grammy";
import { delay } from "../bot/utils/delay";
import generateRSISignal from "../bot/utils/generateRSIOverBoughtSignal";
import { renderRSISignal } from "../bot/utils/renderRSISignal";
import config from "../config";
import { logger } from "../logger";
import { Duration, UpstoxInterval } from "../types/Duration";
import getStockHistoricalCandles from "./getStockHistoricalCandles";
import { fetchCandleData } from "./priceApi";

/**
 * Process RSI analysis for all pairs at a given duration
 */
export const processRSIAnalysis = async (
    bot: Bot,
    fallbackKeyPairs: string[],
    duration: Duration | UpstoxInterval,
    neutral: boolean = false
  ): Promise<void> => {
    for (const keyPair of fallbackKeyPairs) {
      try {
        const candles: any = config.UPSTOX_KEY_PAIRS.includes(keyPair)
          ? await getStockHistoricalCandles(keyPair, duration as UpstoxInterval)
          : await fetchCandleData(keyPair, duration);
        const signals = await generateRSISignal(keyPair, candles, neutral);
        await renderRSISignal(keyPair, signals, bot, duration);
      } catch (error) {
        logger(
          `Error processing RSI analysis for ${keyPair} at ${duration}: ${error}`,
          "red"
        );
      } finally {
        // 1 sec timeout
        await delay(config.DELAY_BETWEEN_PAIRS_MS);
      }
    }
  };

  export default processRSIAnalysis;