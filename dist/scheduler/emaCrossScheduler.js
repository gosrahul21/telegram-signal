"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../utils/constants");
const priceApi_1 = require("../services/priceApi");
const logger_1 = require("../logger");
const bot_1 = require("../services/bot");
const ema = require("exponential-moving-average");
// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "SUIUSDT"];
// Scheduler intervals (in minutes)
const SCHEDULER_INTERVALS = {
    "15m": 15,
    "1h": 60,
    "4h": 240,
    "1d": 1440,
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
// EMA ANALYSIS FUNCTIONS
// ============================================================================
/**
 * Generate EMA crossover signals
 */
function generateCrossSignals(prices, ema9, ema21, ema20, ema50, getTrend = false) {
    const signals = [];
    const mostRecentIndex = 0;
    // Check for 9/21 EMA crossover
    if (ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "9 EMA crossed above 21 EMA, buy/long signal",
        });
    }
    else if (ema9[mostRecentIndex] < ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] >= ema21[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "21 EMA crossed above 9 EMA, sell/short signal",
        });
    }
    else if (getTrend) {
        signals.push({
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `${ema9[mostRecentIndex] < ema21[mostRecentIndex] ? "downtrend" : "uptrend"}`,
        });
    }
    // Check for 20/50 EMA crossover
    if (ema20[mostRecentIndex] > ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] <= ema50[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 20/50",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "20 EMA crossed above 50 EMA",
        });
    }
    else if (ema20[mostRecentIndex] < ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] >= ema50[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 20/50",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "50 EMA crossed above 20 EMA, sell/short signal",
        });
    }
    else if (getTrend) {
        signals.push({
            type: "EMA crossover 20/50",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `${ema20[mostRecentIndex] < ema50[mostRecentIndex]
                ? "downtrend"
                : "uptrend"}`,
        });
    }
    return signals;
}
exports.generateCrossSignals = generateCrossSignals;
/**
 * Generate EMA signals for a given pair and duration
 */
exports.generateSignal = async (keyname, duration) => {
    const candles = await priceApi_1.fetchCandleData(keyname, duration);
    const ema9 = calculateEMA(candles, 9);
    const ema21 = calculateEMA(candles, 21);
    const ema20 = calculateEMA(candles, 20);
    const ema50 = calculateEMA(candles, 50);
    return generateCrossSignals(candles, ema9, ema21, ema20, ema50);
};
/**
 * Generate custom EMA crossover signals with specified periods
 */
exports.getSmallSignal = async (keyname, duration, emaShort, emaLong) => {
    const pairname = constants_1.keyPairsMapping[keyname];
    const candles = await priceApi_1.fetchCandleData(pairname, duration);
    const emasShort = calculateEMA(candles, emaShort);
    const emasLong = calculateEMA(candles, emaLong);
    const mostRecentIndex = 0;
    const signals = [];
    // Check for EMA crossover
    if (emasShort[mostRecentIndex] > emasLong[mostRecentIndex] &&
        emasShort[mostRecentIndex + 1] <= emasLong[mostRecentIndex + 1]) {
        signals.push({
            type: `EMA crossover ${emaShort}/${emaLong}`,
            time: candles[mostRecentIndex].time,
            price: candles[mostRecentIndex].close,
            details: `${emaShort} EMA crossed above ${emaLong} EMA`,
        });
    }
    else if (emasShort[mostRecentIndex] < emasLong[mostRecentIndex] &&
        emasShort[mostRecentIndex + 1] >= emasLong[mostRecentIndex + 1]) {
        signals.push({
            type: `EMA crossover ${emaShort}/${emaLong}`,
            time: candles[mostRecentIndex].time,
            price: candles[mostRecentIndex].close,
            details: `${emaLong} EMA crossed above ${emaShort} EMA, sell/short signal`,
        });
    }
    // Check for trend reversal conditions
    const recentCandle = candles[mostRecentIndex];
    const secondRecentCandle = candles[mostRecentIndex + 1];
    const trend = emasShort[0] > emasLong[0] ? "UPTREND" : "DOWNTREND";
    if (trend === "UPTREND") {
        if (secondRecentCandle.close >= emasShort[mostRecentIndex + 1] &&
            recentCandle.close < emasShort[mostRecentIndex]) {
            signals.push({
                type: `Trend reversal condition ${emaShort}/${emaLong}`,
                time: candles[mostRecentIndex].time,
                price: candles[mostRecentIndex].close,
                details: "trend may change, from downtrend to uptrend, take decision wisely",
            });
        }
    }
    else {
        if (secondRecentCandle.close <= emasShort[mostRecentIndex + 1] &&
            recentCandle.close > emasShort[mostRecentIndex]) {
            signals.push({
                type: `Trend reversal condition ${emaShort}/${emaLong}`,
                time: candles[mostRecentIndex].time,
                price: candles[mostRecentIndex].close,
                details: "trend may change, from uptrend to downtrend, take decision wisely",
            });
        }
    }
    return signals;
};
// ============================================================================
// SIGNAL RENDERING
// ============================================================================
/**
 * Render EMA signals to Telegram
 */
exports.renderSignal = async (pairName, signals, bot, duration) => {
    const signalArray = Array.isArray(signals) ? signals : [signals];
    for (const signal of signalArray) {
        // Broadcast to all subscribed users
        for (const chatId of bot_1.subscriberId) {
            try {
                await bot.api.sendMessage(chatId, `<b>EMA Signal for ${pairName} - ${duration}</b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}\nDetails: ${signal.details}`, { parse_mode: "HTML" });
            }
            catch (error) {
                console.error(`Failed to send EMA signal to ${chatId}:`, error);
            }
        }
        // Also send to default chat ID if no subscribers
        if (bot_1.subscriberId.length === 0) {
            try {
                await bot.api.sendMessage(process.env.CHAT_ID || "", `<b>EMA Signal for ${pairName} - ${duration}</b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}\nDetails: ${signal.details}`, { parse_mode: "HTML" });
            }
            catch (error) {
                console.error(`Failed to send EMA signal to default chat:`, error);
            }
        }
    }
};
// ============================================================================
// SCHEDULER FUNCTIONS
// ============================================================================
/**
 * Process EMA analysis for all pairs at a given duration
 */
const processEMAAnalysis = async (bot, duration) => {
    for (const keyPair of fallbackKeyPairs) {
        try {
            let signals = [];
            // Use different signal generation based on duration
            if (duration === "15m") {
                signals = await exports.getSmallSignal(keyPair, duration, 20, 50);
            }
            else {
                signals = await exports.generateSignal(keyPair, duration);
            }
            if (signals.length > 0) {
                await exports.renderSignal(keyPair, signals, bot, duration);
            }
        }
        catch (error) {
            logger_1.logger(`Error processing EMA analysis for ${keyPair} at ${duration}: ${error}`, "red");
        }
    }
};
/**
 * Set up EMA analysis interval for a specific duration
 */
const setupEMAInterval = (bot, duration, intervalMinutes) => {
    const intervalMs = intervalMinutes * 60 * 1000;
    logger_1.logger(`${duration} EMA analysis started every ${intervalMinutes} minutes`, "green");
    setInterval(async () => {
        await processEMAAnalysis(bot, duration);
    }, intervalMs);
};
/**
 * Main EMA cross scheduler function
 */
exports.emaCrossScheduler = async (bot) => {
    logger_1.logger("EMA Cross Scheduler started", "green");
    // Set up intervals for all timeframes
    Object.entries(SCHEDULER_INTERVALS).forEach(([duration, interval]) => {
        console.log(duration, interval);
        setupEMAInterval(bot, duration, interval);
    });
    logger_1.logger("All EMA analysis intervals configured", "green");
};
