"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const priceApi_1 = require("../services/priceApi");
const techincalIndicators_1 = require("../utils/helper/techincalIndicators");
const logger_1 = require("../logger");
const bot_1 = require("../services/bot");
const ema = require("exponential-moving-average");
// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "SUIUSDT"];
// RSI thresholds
const RSI_OVERBOUGHT_THRESHOLD = 70;
const RSI_OVERSOLD_THRESHOLD = 30;
const RSI_EXTREME_OVERBOUGHT = 80;
const RSI_EXTREME_OVERSOLD = 20;
// Scheduler intervals (in minutes)
const SCHEDULER_INTERVALS = {
    "15m": 5,
    "1h": 15,
    "4h": 60,
    "1d": 720,
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function calculateEMA(candlePrices, duration) {
    const arr = candlePrices.map((candle) => candle.close);
    arr.reverse();
    return ema(arr, duration).reverse();
}
exports.calculateEMA = calculateEMA;
// ============================================================================
// RSI ANALYSIS FUNCTIONS
// ============================================================================
/**
 * Get RSI values for a given pair and duration
 */
exports.getRSIValues = async (keyname, duration) => {
    const candles = await priceApi_1.fetchCandleData(keyname, duration);
    return techincalIndicators_1.calculateRSI(candles.map((candle) => candle.close), 14);
};
/**
 * Get current RSI value for a given pair and duration
 */
exports.getCurrentRSI = async (keyname, duration) => {
    const rsiValues = await exports.getRSIValues(keyname, duration);
    return rsiValues[rsiValues.length - 1];
};
/**
 * Check RSI overbought conditions
 */
exports.checkRSIOverbought = async (keyName, pairName, duration) => {
    const candles = await priceApi_1.fetchCandleData(keyName, duration);
    const rsiValues = techincalIndicators_1.calculateRSI(candles.map((candle) => candle.close), 14);
    const currentRSI = rsiValues[rsiValues.length - 1];
    const mostRecentIndex = 0;
    const signals = [];
    if (currentRSI >= RSI_EXTREME_OVERBOUGHT) {
        signals.push({
            type: `${keyName} RSI Extreme Overbought`,
            time: candles[mostRecentIndex].time,
            price: candles[mostRecentIndex].close,
            rsi: currentRSI,
            details: `RSI is extremely overbought at ${currentRSI.toFixed(2)}, strong sell signal`,
        });
    }
    else if (currentRSI >= RSI_OVERBOUGHT_THRESHOLD) {
        signals.push({
            type: `${keyName} RSI Overbought`,
            time: candles[mostRecentIndex].time,
            price: candles[mostRecentIndex].close,
            rsi: currentRSI,
            details: `RSI is overbought at ${currentRSI.toFixed(2)}, potential sell signal`,
        });
    }
    return signals;
};
/**
 * Check RSI oversold conditions
 */
exports.checkRSIOversold = async (keyName, pairName, duration) => {
    const candles = await priceApi_1.fetchCandleData(keyName, duration);
    const rsiValues = techincalIndicators_1.calculateRSI(candles.map((candle) => candle.close), 14);
    const currentRSI = rsiValues[rsiValues.length - 1];
    const mostRecentIndex = 0;
    const signals = [];
    if (currentRSI <= RSI_EXTREME_OVERSOLD) {
        signals.push({
            type: `${keyName} RSI Extreme Oversold`,
            time: candles[mostRecentIndex].time,
            price: candles[mostRecentIndex].close,
            rsi: currentRSI,
            details: `RSI is extremely oversold at ${currentRSI.toFixed(2)}, strong buy signal`,
        });
    }
    else if (currentRSI <= RSI_OVERSOLD_THRESHOLD) {
        signals.push({
            type: `${keyName} RSI Oversold`,
            time: candles[mostRecentIndex].time,
            price: candles[mostRecentIndex].close,
            rsi: currentRSI,
            details: `RSI is oversold at ${currentRSI.toFixed(2)}, potential buy signal`,
        });
    }
    return signals;
};
/**
 * Get RSI status for a specific pair and duration
 */
exports.getRSIStatus = async (keyName, duration) => {
    const currentRSI = await exports.getCurrentRSI(keyName, duration);
    if (currentRSI >= RSI_EXTREME_OVERBOUGHT) {
        return {
            status: "Extreme Overbought",
            rsi: currentRSI,
            signal: "Strong Sell",
            details: `RSI is extremely overbought at ${currentRSI.toFixed(2)}`,
        };
    }
    else if (currentRSI >= RSI_OVERBOUGHT_THRESHOLD) {
        return {
            status: "Overbought",
            rsi: currentRSI,
            signal: "Sell",
            details: `RSI is overbought at ${currentRSI.toFixed(2)}`,
        };
    }
    else if (currentRSI <= RSI_EXTREME_OVERSOLD) {
        return {
            status: "Extreme Oversold",
            rsi: currentRSI,
            signal: "Strong Buy",
            details: `RSI is extremely oversold at ${currentRSI.toFixed(2)}`,
        };
    }
    else if (currentRSI <= RSI_OVERSOLD_THRESHOLD) {
        return {
            status: "Oversold",
            rsi: currentRSI,
            signal: "Buy",
            details: `RSI is oversold at ${currentRSI.toFixed(2)}`,
        };
    }
    else {
        return {
            status: "Neutral",
            rsi: currentRSI,
            signal: "Hold",
            details: `RSI is neutral at ${currentRSI.toFixed(2)}`,
        };
    }
};
// ============================================================================
// PRICE ANALYSIS FUNCTIONS
// ============================================================================
/**
 * Check if price is away from EMA (overbought zone)
 */
exports.priceAwayFromAverage = async (keyName, pairName, duration) => {
    const prices = await priceApi_1.fetchTickerPrice(keyName);
    const price = prices.find((price) => price.market === keyName);
    const signals = [];
    // Note: This function needs EMA data to work properly
    // For now, we'll return empty array as EMA mapping is not implemented
    // TODO: Implement proper EMA mapping and calculation
    return signals;
};
// ============================================================================
// SIGNAL RENDERING
// ============================================================================
/**
 * Render RSI signals to Telegram
 */
exports.renderRSISignal = async (pairName, signals, bot, duration) => {
    const signalArray = Array.isArray(signals) ? signals : [signals];
    for (const signal of signalArray) {
        const rsiInfo = signal.rsi ? `\nRSI: ${signal.rsi.toFixed(2)}` : "";
        // Broadcast to all subscribed users
        for (const chatId of bot_1.subscriberId) {
            try {
                await bot.api.sendMessage(chatId, `<b>RSI Signal for ${pairName} - ${duration}</b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}${rsiInfo}\nDetails: ${signal.details}`, { parse_mode: "HTML" });
            }
            catch (error) {
                console.error(`Failed to send RSI signal to ${chatId}:`, error);
            }
        }
        // Also send to default chat ID if no subscribers
        if (bot_1.subscriberId.length === 0) {
            try {
                await bot.api.sendMessage(process.env.CHAT_ID || "", `<b>RSI Signal for ${pairName} - ${duration}</b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}${rsiInfo}\nDetails: ${signal.details}`, { parse_mode: "HTML" });
            }
            catch (error) {
                console.error(`Failed to send RSI signal to default chat:`, error);
            }
        }
    }
};
// ============================================================================
// SCHEDULER FUNCTIONS
// ============================================================================
/**
 * Process RSI analysis for all pairs at a given duration
 */
const processRSIAnalysis = async (bot, duration) => {
    for (const keyPair of fallbackKeyPairs) {
        try {
            // Check overbought conditions
            const overboughtSignals = await exports.checkRSIOverbought(keyPair, keyPair, duration);
            if (overboughtSignals.length > 0) {
                await exports.renderRSISignal(keyPair, overboughtSignals, bot, duration);
            }
            // Check oversold conditions
            const oversoldSignals = await exports.checkRSIOversold(keyPair, keyPair, duration);
            if (oversoldSignals.length > 0) {
                await exports.renderRSISignal(keyPair, oversoldSignals, bot, duration);
            }
        }
        catch (error) {
            logger_1.logger(`Error processing RSI analysis for ${keyPair} at ${duration}: ${error}`, "red");
        }
    }
};
/**
 * Set up RSI analysis interval for a specific duration
 */
const setupRSIInterval = (bot, duration, intervalMinutes) => {
    const intervalMs = intervalMinutes * 60 * 1000;
    logger_1.logger(`${duration} RSI analysis started every ${intervalMinutes} minutes`, "green");
    setInterval(async () => {
        await processRSIAnalysis(bot, duration);
    }, intervalMs);
};
/**
 * Main RSI scheduler function
 */
exports.rsiScheduler = async (bot) => {
    logger_1.logger("RSI Scheduler started", "green");
    // Set up intervals for all timeframes
    Object.entries(SCHEDULER_INTERVALS).forEach(([duration, interval]) => {
        setupRSIInterval(bot, duration, interval);
    });
    logger_1.logger("All RSI analysis intervals configured", "green");
};
