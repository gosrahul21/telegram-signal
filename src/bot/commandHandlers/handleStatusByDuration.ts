import config from "../../config";
import getStockHistoricalCandles from "../../services/getStockHistoricalCandles";
import { fetchCandleData } from "../../services/priceApi";
import { UpstoxInterval } from "../../types/Duration";
import {
  calculateBollingerBands,
  calculateEMA,
  calculateRSI,
} from "../../utils/helper/techincalIndicators";
import { delay } from "../utils/delay";

/**
 * Generates a comprehensive technical status report for a single pair on a given timeframe
 */
export const getSinglePairStatusMessage = async (
  symbol: string,
  duration: "1h" | "4h" | "1d"
): Promise<string | null> => {
  const isUpstox =
    config.ENABLE_UPSTOX &&
    config.UPSTOX_KEY_PAIRS &&
    config.UPSTOX_KEY_PAIRS.includes(symbol);
  const upstoxInterval =
    duration === "1h"
      ? UpstoxInterval.OneHour
      : duration === "4h"
      ? UpstoxInterval.FourHours
      : UpstoxInterval.OneDay;

  const candles: any = isUpstox
    ? await getStockHistoricalCandles(symbol, upstoxInterval)
    : await fetchCandleData(symbol, duration);

  if (!candles || candles.length < 20) {
    return null;
  }

  const currentCandle = candles[candles.length - 1];
  const closePrices: number[] = candles.map((c: any) => c.close);

  // Technical Indicators
  const rsiValues = calculateRSI(closePrices, 14);
  const rsi = rsiValues[rsiValues.length - 1];

  const bbValues = calculateBollingerBands(closePrices, 20, 2);
  const bb = bbValues && bbValues.length > 0 ? bbValues[bbValues.length - 1] : null;

  const ema9Values = calculateEMA(closePrices, 9);
  const ema21Values = calculateEMA(closePrices, 21);
  const e9 = ema9Values[ema9Values.length - 1];
  const e21 = ema21Values[ema21Values.length - 1];

  const trend = e9 > e21 ? "🟢 Bullish (Uptrend)" : "🔴 Bearish (Downtrend)";

  let rsiState = "⚪ Neutral";
  if (
    rsi >= (config.RSI_EXTREME_OVERBOUGHT || 80) ||
    rsi >= (config.RSI_OVERBOUGHT_THRESHOLD || 70)
  ) {
    rsiState = "🔴 Overbought";
  } else if (
    rsi <= (config.RSI_EXTREME_OVERSOLD || 20) ||
    rsi <= (config.RSI_OVERSOLD_THRESHOLD || 30)
  ) {
    rsiState = "🟢 Oversold";
  }

  let bbDetails = "N/A";
  if (bb) {
    let bbState = "⚪ Within Bands";
    if (currentCandle.close >= bb.upper) {
      bbState = "🔴 At/Above Upper Band";
    } else if (currentCandle.close <= bb.lower) {
      bbState = "🟢 At/Below Lower Band";
    }
    bbDetails = `
📊 <b>Bollinger Bands:</b> ${bbState}
   • Upper: $${bb.upper.toFixed(2)}
   • Mid (20 SMA): $${bb.middle.toFixed(2)}
   • Lower: $${bb.lower.toFixed(2)}`.trim();
  }

  const formattedTime =
    typeof currentCandle.closeTime === "number"
      ? new Date(currentCandle.closeTime).toLocaleString()
      : currentCandle.closeTime || new Date().toLocaleString();

  return `
📊 <b>Status for ${symbol} [${duration}]</b>
💰 <b>Current Price:</b> $${currentCandle.close}
📈 <b>RSI (14):</b> ${rsi ? rsi.toFixed(2) : "N/A"} (${rsiState})
⚖️ <b>EMA (9/21):</b> ${trend}
${bbDetails}
⏰ <b>Time:</b> ${formattedTime}
  `.trim();
};

/**
 * Common handler to deliver on-demand price & technical status by duration directly to the requesting user
 */
export const handleStatusByDuration = async (
  ctx: any,
  duration: "1h" | "4h" | "1d"
) => {
  try {
    const rawMatch = ctx.match ? String(ctx.match).trim() : "";
    let symbol = rawMatch.toUpperCase();

    // Support entering short ticker like "BTC" -> "BTCUSDT"
    if (
      symbol &&
      !symbol.endsWith("USDT") &&
      !config.UPSTOX_KEY_PAIRS?.includes(symbol)
    ) {
      const matchedPair = config.BINANCE_KEY_PAIRS.find(
        (p: string) => p === `${symbol}USDT` || p === symbol
      );
      if (matchedPair) symbol = matchedPair;
    }

    if (symbol) {
      // Single pair requested
      const statusMsg = await getSinglePairStatusMessage(symbol, duration);
      if (statusMsg) {
        await ctx.reply(statusMsg, { parse_mode: "HTML" });
      } else {
        await ctx.reply(
          `⚠️ Unable to fetch data for <b>${symbol}</b> on timeframe <b>${duration}</b>. Please check the symbol and try again.`,
          { parse_mode: "HTML" }
        );
      }
      return;
    }

    // No symbol provided: reply with the status of all default monitored crypto pairs
    await ctx.reply(
      `⏳ Fetching <b>${duration}</b> status for monitored pairs...`,
      { parse_mode: "HTML" }
    );

    const pairs: string[] = config.BINANCE_KEY_PAIRS;
    for (const pair of pairs) {
      try {
        const msg = await getSinglePairStatusMessage(pair, duration);
        if (msg) {
          await ctx.reply(msg, { parse_mode: "HTML" });
        }
      } catch (err) {
        console.error(`Error delivering ${duration} status for ${pair}:`, err);
      } finally {
        await delay(config.DELAY_BETWEEN_PAIRS_MS || 5000);
      }
    }
  } catch (error) {
    console.error(`Error in handleStatusByDuration (${duration}):`, error);
    await ctx.reply(`❌ Error getting status for timeframe ${duration}.`);
  }
};

export default handleStatusByDuration;
