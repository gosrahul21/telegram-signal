"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBBSignal = void 0;
const config_1 = __importDefault(require("../../config"));
const techincalIndicators_1 = require("../../utils/helper/techincalIndicators");
const candleTracker_1 = __importDefault(require("./candleTracker"));
/**
 * Generate Bollinger Bands signals (bb_upper and bb_lower hits) for a given candle series
 */
const generateBBSignal = (keyName, candles, period = config_1.default.BB_PERIOD || 20, stdDev = config_1.default.BB_STD_DEV || 2) => {
    if (!candles || candles.length < period) {
        return [];
    }
    const closePrices = candles.map((candle) => candle.close);
    const bbResults = (0, techincalIndicators_1.calculateBollingerBands)(closePrices, period, stdDev);
    if (!bbResults || bbResults.length === 0) {
        return [];
    }
    const currentBB = bbResults[bbResults.length - 1];
    const mostRecentIndex = candles.length - 1;
    const currentCandle = candles[mostRecentIndex];
    const currentPrice = currentCandle.close;
    const candleId = candleTracker_1.default.getCandleId(currentCandle);
    const candleTime = currentCandle.closeTime ?? currentCandle.openTime ?? Date.now();
    const signals = [];
    // Check for BB Upper Band Hit
    if (currentPrice >= currentBB.upper) {
        signals.push({
            type: "bb_upper",
            keyName,
            price: currentPrice,
            upper: currentBB.upper,
            middle: currentBB.middle,
            lower: currentBB.lower,
            candleId,
            candleTime,
            details: `Price (${currentPrice}) crossed above Upper Band (${currentBB.upper.toFixed(2)})`,
        });
    }
    else if (currentCandle.high !== undefined && currentCandle.high >= currentBB.upper) {
        signals.push({
            type: "bb_upper",
            keyName,
            price: currentPrice,
            upper: currentBB.upper,
            middle: currentBB.middle,
            lower: currentBB.lower,
            candleId,
            candleTime,
            details: `Candle High (${currentCandle.high}) reached Upper Band (${currentBB.upper.toFixed(2)}) [Current Close: ${currentPrice}]`,
        });
    }
    // Check for BB Lower Band Hit
    if (currentPrice <= currentBB.lower) {
        signals.push({
            type: "bb_lower",
            keyName,
            price: currentPrice,
            upper: currentBB.upper,
            middle: currentBB.middle,
            lower: currentBB.lower,
            candleId,
            candleTime,
            details: `Price (${currentPrice}) crossed below Lower Band (${currentBB.lower.toFixed(2)})`,
        });
    }
    else if (currentCandle.low !== undefined && currentCandle.low <= currentBB.lower) {
        signals.push({
            type: "bb_lower",
            keyName,
            price: currentPrice,
            upper: currentBB.upper,
            middle: currentBB.middle,
            lower: currentBB.lower,
            candleId,
            candleTime,
            details: `Candle Low (${currentCandle.low}) reached Lower Band (${currentBB.lower.toFixed(2)}) [Current Close: ${currentPrice}]`,
        });
    }
    return signals;
};
exports.generateBBSignal = generateBBSignal;
exports.default = exports.generateBBSignal;
