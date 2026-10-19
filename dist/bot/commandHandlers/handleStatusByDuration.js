"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStatusByDuration = exports.getSinglePairStatusMessage = void 0;
const config_1 = __importDefault(require("../../config"));
const getStockHistoricalCandles_1 = __importDefault(require("../../services/getStockHistoricalCandles"));
const priceApi_1 = require("../../services/priceApi");
const Duration_1 = require("../../types/Duration");
const techincalIndicators_1 = require("../../utils/helper/techincalIndicators");
const delay_1 = require("../utils/delay");
/**
 * Generates a comprehensive technical status report for a single pair on a given timeframe
 */
const getSinglePairStatusMessage = async (symbol, duration) => {
    const isUpstox = config_1.default.UPSTOX_KEY_PAIRS && config_1.default.UPSTOX_KEY_PAIRS.includes(symbol);
    const upstoxInterval = duration === "1h"
        ? Duration_1.UpstoxInterval.OneHour
        : duration === "4h"
            ? Duration_1.UpstoxInterval.FourHours
            : Duration_1.UpstoxInterval.OneDay;
    const candles = isUpstox
        ? await (0, getStockHistoricalCandles_1.default)(symbol, upstoxInterval)
        : await (0, priceApi_1.fetchCandleData)(symbol, duration);
    if (!candles || candles.length < 20) {
        return null;
    }
    const currentCandle = candles[candles.length - 1];
    const closePrices = candles.map((c) => c.close);
    // Technical Indicators
    const rsiValues = (0, techincalIndicators_1.calculateRSI)(closePrices, 14);
    const rsi = rsiValues[rsiValues.length - 1];
    const bbValues = (0, techincalIndicators_1.calculateBollingerBands)(closePrices, 20, 2);
    const bb = bbValues && bbValues.length > 0 ? bbValues[bbValues.length - 1] : null;
    const ema9Values = (0, techincalIndicators_1.calculateEMA)(closePrices, 9);
    const ema21Values = (0, techincalIndicators_1.calculateEMA)(closePrices, 21);
    const e9 = ema9Values[ema9Values.length - 1];
    const e21 = ema21Values[ema21Values.length - 1];
    const trend = e9 > e21 ? "🟢 Bullish (Uptrend)" : "🔴 Bearish (Downtrend)";
    let rsiState = "⚪ Neutral";
    if (rsi >= (config_1.default.RSI_EXTREME_OVERBOUGHT || 80) ||
        rsi >= (config_1.default.RSI_OVERBOUGHT_THRESHOLD || 70)) {
        rsiState = "🔴 Overbought";
    }
    else if (rsi <= (config_1.default.RSI_EXTREME_OVERSOLD || 20) ||
        rsi <= (config_1.default.RSI_OVERSOLD_THRESHOLD || 30)) {
        rsiState = "🟢 Oversold";
    }
    let bbDetails = "N/A";
    if (bb) {
        let bbState = "⚪ Within Bands";
        if (currentCandle.close >= bb.upper) {
            bbState = "🔴 At/Above Upper Band";
        }
        else if (currentCandle.close <= bb.lower) {
            bbState = "🟢 At/Below Lower Band";
        }
        bbDetails = `
📊 <b>Bollinger Bands:</b> ${bbState}
   • Upper: $${bb.upper.toFixed(2)}
   • Mid (20 SMA): $${bb.middle.toFixed(2)}
   • Lower: $${bb.lower.toFixed(2)}`.trim();
    }
    const formattedTime = typeof currentCandle.closeTime === "number"
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
exports.getSinglePairStatusMessage = getSinglePairStatusMessage;
/**
 * Common handler to deliver on-demand price & technical status by duration directly to the requesting user
 */
const handleStatusByDuration = async (ctx, duration) => {
    try {
        const rawMatch = ctx.match ? String(ctx.match).trim() : "";
        let symbol = rawMatch.toUpperCase();
        // Support entering short ticker like "BTC" -> "BTCUSDT"
        if (symbol &&
            !symbol.endsWith("USDT") &&
            !config_1.default.UPSTOX_KEY_PAIRS?.includes(symbol)) {
            const matchedPair = config_1.default.BINANCE_KEY_PAIRS.find((p) => p === `${symbol}USDT` || p === symbol);
            if (matchedPair)
                symbol = matchedPair;
        }
        if (symbol) {
            // Single pair requested
            const statusMsg = await (0, exports.getSinglePairStatusMessage)(symbol, duration);
            if (statusMsg) {
                await ctx.reply(statusMsg, { parse_mode: "HTML" });
            }
            else {
                await ctx.reply(`⚠️ Unable to fetch data for <b>${symbol}</b> on timeframe <b>${duration}</b>. Please check the symbol and try again.`, { parse_mode: "HTML" });
            }
            return;
        }
        // No symbol provided: reply with the status of all default monitored crypto pairs
        await ctx.reply(`⏳ Fetching <b>${duration}</b> status for monitored pairs...`, { parse_mode: "HTML" });
        const pairs = config_1.default.BINANCE_KEY_PAIRS;
        for (const pair of pairs) {
            try {
                const msg = await (0, exports.getSinglePairStatusMessage)(pair, duration);
                if (msg) {
                    await ctx.reply(msg, { parse_mode: "HTML" });
                    await (0, delay_1.delay)(300);
                }
            }
            catch (err) {
                console.error(`Error delivering ${duration} status for ${pair}:`, err);
            }
        }
    }
    catch (error) {
        console.error(`Error in handleStatusByDuration (${duration}):`, error);
        await ctx.reply(`❌ Error getting status for timeframe ${duration}.`);
    }
};
exports.handleStatusByDuration = handleStatusByDuration;
exports.default = exports.handleStatusByDuration;
