"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rsiScheduler = exports.priceAwayFromAverage = exports.getRSIStatus = exports.getCurrentRSI = exports.getRSIValues = void 0;
exports.calculateEMA = calculateEMA;
const priceApi_1 = require("../../services/priceApi");
const Duration_1 = require("../../types/Duration");
const techincalIndicators_1 = require("../../utils/helper/techincalIndicators");
const index_1 = __importDefault(require("../../config/index"));
const schedule = __importStar(require("node-schedule"));
const logger_1 = require("../../logger");
const delay_1 = require("../utils/delay");
const generateRSIOverBoughtSignal_1 = require("../utils/generateRSIOverBoughtSignal");
const generateRSIOverSoldSignal_1 = __importDefault(require("../utils/generateRSIOverSoldSignal"));
const getStockHistoricalCandles_1 = __importDefault(require("../../services/getStockHistoricalCandles"));
const renderRSISignal_1 = require("../utils/renderRSISignal");
const ema = require("exponential-moving-average");
// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "SUIUSDT"];
// Scheduler intervals (in minutes)
const SCHEDULER_INTERVALS = {
    "15m": 5, // 15-minute analysis every 5 minutes
    "1h": 15, // 1-hour analysis every 15 minutes
    "4h": 60, // 4-hour analysis every 60 minutes
    "1d": 720, // Daily analysis every 12 hours
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function calculateEMA(candlePrices, duration) {
    const arr = candlePrices.map((candle) => candle.close);
    arr.reverse();
    return ema(arr, duration).reverse();
}
// ============================================================================
// RSI ANALYSIS FUNCTIONS
// ============================================================================
/**
 * Get RSI values for a given pair and duration
 */
const getRSIValues = async (keyname, duration) => {
    const candles = await (0, priceApi_1.fetchCandleData)(keyname, duration);
    return (0, techincalIndicators_1.calculateRSI)(candles.map((candle) => candle.close), 14);
};
exports.getRSIValues = getRSIValues;
/**
 * Get current RSI value for a given pair and duration
 */
const getCurrentRSI = async (keyname, duration) => {
    const rsiValues = await (0, exports.getRSIValues)(keyname, duration);
    return rsiValues[rsiValues.length - 1];
};
exports.getCurrentRSI = getCurrentRSI;
/**
 * Get RSI status for a specific pair and duration
 */
const getRSIStatus = async (keyName, duration) => {
    const currentRSI = await (0, exports.getCurrentRSI)(keyName, duration);
    const { price } = await (0, priceApi_1.fetchTickerPrice)(keyName);
    const time = new Date().toISOString();
    if (currentRSI >= index_1.default.RSI_EXTREME_OVERBOUGHT) {
        return {
            type: "Extreme Overbought",
            rsi: currentRSI,
            price: price,
            time: time,
            signal: "Strong Sell",
            details: `RSI is extremely overbought at ${currentRSI.toFixed(2)}`,
        };
    }
    else if (currentRSI >= index_1.default.RSI_OVERBOUGHT_THRESHOLD) {
        return {
            type: "Overbought",
            rsi: currentRSI,
            price: price,
            time: time,
            signal: "Sell",
            details: `RSI is overbought at ${currentRSI.toFixed(2)}`,
        };
    }
    else if (currentRSI <= index_1.default.RSI_EXTREME_OVERSOLD) {
        return {
            type: "Extreme Oversold",
            rsi: currentRSI,
            price: price,
            time: time,
            signal: "Strong Buy",
            details: `RSI is extremely oversold at ${currentRSI.toFixed(2)}`,
        };
    }
    else if (currentRSI <= index_1.default.RSI_OVERSOLD_THRESHOLD) {
        return {
            type: "Oversold",
            rsi: currentRSI,
            price: price,
            time: time,
            signal: "Buy",
            details: `RSI is oversold at ${currentRSI.toFixed(2)}`,
        };
    }
    else {
        return {
            type: "Neutral",
            rsi: currentRSI,
            price: price,
            time: time,
            signal: "Hold",
            details: `RSI is neutral at ${currentRSI.toFixed(2)}`,
        };
    }
};
exports.getRSIStatus = getRSIStatus;
// ============================================================================
// PRICE ANALYSIS FUNCTIONS
// ============================================================================
/**
 * Check if price is away from EMA (overbought zone)
 */
const priceAwayFromAverage = async (keyName, pairName, duration) => {
    const prices = await (0, priceApi_1.fetchTickerPrice)(keyName);
    const price = prices.find((price) => price.market === keyName);
    const signals = [];
    // Note: This function needs EMA data to work properly
    // For now, we'll return empty array as EMA mapping is not implemented
    // TODO: Implement proper EMA mapping and calculation
    return signals;
};
exports.priceAwayFromAverage = priceAwayFromAverage;
// ============================================================================
// SCHEDULER FUNCTIONS
// ============================================================================
/**
 * Process RSI analysis for all pairs at a given duration
 */
const processRSIAnalysis = async (bot, fallbackKeyPairs, duration) => {
    for (const keyPair of fallbackKeyPairs) {
        try {
            const candles = index_1.default.UPSTOX_KEY_PAIRS.includes(keyPair)
                ? await (0, getStockHistoricalCandles_1.default)(keyPair, duration)
                : await (0, priceApi_1.fetchCandleData)(keyPair, duration);
            // Check overbought conditions
            const overboughtSignals = await (0, generateRSIOverBoughtSignal_1.generateRSIOverboughtSignal)(keyPair, candles);
            if (overboughtSignals.length > 0) {
                await (0, renderRSISignal_1.renderRSISignal)(keyPair, overboughtSignals, bot, duration);
            }
            // Check oversold conditions
            const oversoldSignals = await (0, generateRSIOverSoldSignal_1.default)(keyPair, candles);
            if (oversoldSignals.length > 0) {
                await (0, renderRSISignal_1.renderRSISignal)(keyPair, oversoldSignals, bot, duration);
            }
        }
        catch (error) {
            (0, logger_1.logger)(`Error processing RSI analysis for ${keyPair} at ${duration}: ${error}`, "red");
        }
        finally {
            // 1 sec timeout
            await (0, delay_1.delay)(index_1.default.DELAY_BETWEEN_PAIRS_MS);
        }
    }
};
/**
 * Set up RSI analysis interval for a specific duration
 */
const setupRSIInterval = (bot, duration, intervalMinutes) => {
    const intervalMs = intervalMinutes * 60 * 1000;
    (0, logger_1.logger)(`${duration} RSI analysis started every ${intervalMinutes} minutes`, "green");
    // cryto scheduler
    setInterval(async () => {
        await processRSIAnalysis(bot, index_1.default.BINANCE_KEY_PAIRS, duration);
    }, intervalMs);
};
/**
 * Main RSI scheduler function
 */
const rsiScheduler = async (bot) => {
    (0, logger_1.logger)("RSI Scheduler crypto started", "green");
    // Set up intervals for all timeframes
    for (let [duration, interval] of Object.entries(SCHEDULER_INTERVALS)) {
        setupRSIInterval(bot, duration, interval);
        await (0, delay_1.delay)(7000);
        console.log("setup of listner");
    }
    (0, logger_1.logger)("RSI Scheduler stock started", "green");
    // stock scheduler - every 15 minutes from 9:15 AM to 3:30 PM
    const cronExpressions = [
        // "15 9 * * 1-5", // 9:15 AM
        "30 9 * * 1-5", // 9:30 AM
        "45 9 * * 1-5", // 9:45 AM
        "0 10 * * 1-5", // 10:00 AM
        "15 10 * * 1-5", // 10:15 AM
        "30 10 * * 1-5", // 10:30 AM
        "45 10 * * 1-5", // 10:45 AM
        "0 11 * * 1-5", // 11:00 AM
        "15 11 * * 1-5", // 11:15 AM
        "30 11 * * 1-5", // 11:30 AM
        "45 11 * * 1-5", // 11:45 AM
        "0 12 * * 1-5", // 12:00 PM
        "15 12 * * 1-5", // 12:15 PM
        "30 12 * * 1-5", // 12:30 PM
        "45 12 * * 1-5", // 12:45 PM
        "0 13 * * 1-5", // 1:00 PM
        "15 13 * * 1-5", // 1:15 PM
        "30 13 * * 1-5", // 1:30 PM
        "45 13 * * 1-5", // 1:45 PM
        "0 14 * * 1-5", // 2:00 PM
        "15 14 * * 1-5", // 2:15 PM
        "30 14 * * 1-5", // 2:30 PM
        "45 14 * * 1-5", // 2:45 PM
        "0 15 * * 1-5", // 3:00 PM
        "15 15 * * 1-5", // 3:15 PM
        "30 15 * * 1-5", // 3:30 PM
    ];
    // Schedule the task for each cron expression
    cronExpressions.forEach((cronExpression) => {
        schedule.scheduleJob(cronExpression, () => {
            processRSIAnalysis(bot, index_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneHour);
        });
    });
    // Schedule daily reports at 12 PM and 3 PM
    schedule.scheduleJob("0 12 * * 1-5", () => {
        return processRSIAnalysis(bot, index_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneDay);
    });
    schedule.scheduleJob("0 15 * * 1-5", () => {
        return processRSIAnalysis(bot, index_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneDay);
    });
    (0, logger_1.logger)("All RSI analysis intervals configured", "green");
};
exports.rsiScheduler = rsiScheduler;
