"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmallEMASignal = exports.generateEMASignal = void 0;
exports.generateCrossSignals = generateCrossSignals;
const priceApi_1 = require("../../services/priceApi");
const constants_1 = require("../../utils/constants");
const techincalIndicators_1 = require("../../utils/helper/techincalIndicators");
const candleTracker_1 = __importDefault(require("./candleTracker"));
/**
 * Generate EMA crossover signals based on EMA series
 */
function generateCrossSignals(prices, ema9, ema21, ema20, ema50, getTrend = false) {
    const signals = [];
    const mostRecentIndex = 0;
    const currentCandle = prices[mostRecentIndex];
    const candleId = candleTracker_1.default.getCandleId(currentCandle);
    // Check for 9/21 EMA crossover
    if (ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 9/21",
            time: currentCandle.time || currentCandle.closeTime,
            price: currentCandle.close,
            candleId,
            details: "9 EMA crossed above 21 EMA, buy/long signal",
        });
    }
    else if (ema9[mostRecentIndex] < ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] >= ema21[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 9/21",
            time: currentCandle.time || currentCandle.closeTime,
            price: currentCandle.close,
            candleId,
            details: "21 EMA crossed above 9 EMA, sell/short signal",
        });
    }
    else if (getTrend) {
        signals.push({
            type: "EMA crossover 9/21",
            time: currentCandle.time || currentCandle.closeTime,
            price: currentCandle.close,
            candleId,
            details: `${ema9[mostRecentIndex] < ema21[mostRecentIndex] ? "downtrend" : "uptrend"}`,
        });
    }
    // Check for 20/50 EMA crossover
    if (ema20[mostRecentIndex] > ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] <= ema50[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 20/50",
            time: currentCandle.time || currentCandle.closeTime,
            price: currentCandle.close,
            candleId,
            details: "20 EMA crossed above 50 EMA, buy/long signal",
        });
    }
    else if (ema20[mostRecentIndex] < ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] >= ema50[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 20/50",
            time: currentCandle.time || currentCandle.closeTime,
            price: currentCandle.close,
            candleId,
            details: "50 EMA crossed above 20 EMA, sell/short signal",
        });
    }
    else if (getTrend) {
        signals.push({
            type: "EMA crossover 20/50",
            time: currentCandle.time || currentCandle.closeTime,
            price: currentCandle.close,
            candleId,
            details: `${ema20[mostRecentIndex] < ema50[mostRecentIndex] ? "downtrend" : "uptrend"}`,
        });
    }
    return signals;
}
/**
 * Generate standard EMA crossover signals for a given pair and duration
 */
const generateEMASignal = async (keyname, duration) => {
    const candles = await (0, priceApi_1.fetchCandleData)(keyname, duration);
    if (!candles || candles.length < 50)
        return [];
    const closePrices = candles.map((c) => c.close);
    const ema9 = (0, techincalIndicators_1.calculateEMA)(closePrices, 9);
    const ema21 = (0, techincalIndicators_1.calculateEMA)(closePrices, 21);
    const ema20 = (0, techincalIndicators_1.calculateEMA)(closePrices, 20);
    const ema50 = (0, techincalIndicators_1.calculateEMA)(closePrices, 50);
    return generateCrossSignals(candles, ema9, ema21, ema20, ema50);
};
exports.generateEMASignal = generateEMASignal;
/**
 * Generate custom period EMA crossover signals
 */
const getSmallEMASignal = async (keyname, duration, emaShort, emaLong) => {
    const pairname = constants_1.keyPairsMapping[keyname] || keyname;
    const candles = await (0, priceApi_1.fetchCandleData)(pairname, duration);
    if (!candles || candles.length < emaLong)
        return [];
    const closePrices = candles.map((c) => c.close);
    const emasShort = (0, techincalIndicators_1.calculateEMA)(closePrices, emaShort);
    const emasLong = (0, techincalIndicators_1.calculateEMA)(closePrices, emaLong);
    const mostRecentIndex = 0;
    const currentCandle = candles[mostRecentIndex];
    const candleId = candleTracker_1.default.getCandleId(currentCandle);
    const signals = [];
    // Check for crossover
    if (emasShort[mostRecentIndex] > emasLong[mostRecentIndex] &&
        emasShort[mostRecentIndex + 1] <= emasLong[mostRecentIndex + 1]) {
        signals.push({
            type: `EMA crossover ${emaShort}/${emaLong}`,
            time: currentCandle.time || currentCandle.closeTime,
            price: currentCandle.close,
            candleId,
            details: `${emaShort} EMA crossed above ${emaLong} EMA, buy signal`,
        });
    }
    else if (emasShort[mostRecentIndex] < emasLong[mostRecentIndex] &&
        emasShort[mostRecentIndex + 1] >= emasLong[mostRecentIndex + 1]) {
        signals.push({
            type: `EMA crossover ${emaShort}/${emaLong}`,
            time: currentCandle.time || currentCandle.closeTime,
            price: currentCandle.close,
            candleId,
            details: `${emaLong} EMA crossed above ${emaShort} EMA, sell signal`,
        });
    }
    // Trend reversal condition
    const secondRecentCandle = candles[mostRecentIndex + 1];
    const isUptrend = emasShort[0] > emasLong[0];
    if (isUptrend) {
        if (secondRecentCandle &&
            secondRecentCandle.close >= emasShort[mostRecentIndex + 1] &&
            currentCandle.close < emasShort[mostRecentIndex]) {
            signals.push({
                type: `Trend reversal condition ${emaShort}/${emaLong}`,
                time: currentCandle.time || currentCandle.closeTime,
                price: currentCandle.close,
                candleId,
                details: "Trend may change from uptrend to downtrend",
            });
        }
    }
    else {
        if (secondRecentCandle &&
            secondRecentCandle.close <= emasShort[mostRecentIndex + 1] &&
            currentCandle.close > emasShort[mostRecentIndex]) {
            signals.push({
                type: `Trend reversal condition ${emaShort}/${emaLong}`,
                time: currentCandle.time || currentCandle.closeTime,
                price: currentCandle.close,
                candleId,
                details: "Trend may change from downtrend to uptrend",
            });
        }
    }
    return signals;
};
exports.getSmallEMASignal = getSmallEMASignal;
exports.default = exports.generateEMASignal;
