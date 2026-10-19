"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRSIOverbought = exports.getTrend = exports.priceAwayFromAverage = exports.checkIfPriceNearEma = exports.getSmallSignal = exports.generateSignal = exports.generateCrossSignals = exports.calculateEMA = void 0;
const emaSignal_1 = require("../bot/utils/emaSignal");
Object.defineProperty(exports, "generateCrossSignals", { enumerable: true, get: function () { return emaSignal_1.generateCrossSignals; } });
const techincalIndicators_1 = require("../utils/helper/techincalIndicators");
Object.defineProperty(exports, "calculateEMA", { enumerable: true, get: function () { return techincalIndicators_1.calculateEMA; } });
const priceApi_1 = require("./priceApi");
exports.generateSignal = emaSignal_1.generateEMASignal;
exports.getSmallSignal = emaSignal_1.getSmallEMASignal;
const checkIfPriceNearEma = (prices, ema) => {
    const signals = [];
    const mostRecentIndex = 0;
    const priceToEMA9Ratio = Math.abs(prices[mostRecentIndex].close - ema[mostRecentIndex]) /
        ema[mostRecentIndex];
    const proximityThreshold = 0.01;
    if (priceToEMA9Ratio < proximityThreshold) {
        signals.push({
            type: "Price near 9 EMA",
            time: prices[mostRecentIndex].time || prices[mostRecentIndex].closeTime,
            price: prices[mostRecentIndex].close,
            details: `Price is within ${proximityThreshold * 100}% of 9 EMA`,
        });
    }
    return signals;
};
exports.checkIfPriceNearEma = checkIfPriceNearEma;
const priceAwayFromAverage = async (keyName, pairName, duration) => {
    const prices = await (0, priceApi_1.fetchTickerPrice)(keyName);
    if (!prices || !Array.isArray(prices))
        return [];
    const price = prices.find((p) => p.market === keyName);
    if (!price)
        return [];
    const candles = await (0, priceApi_1.fetchCandleData)(pairName, duration);
    if (!candles || candles.length === 0)
        return [];
    const ema = (0, techincalIndicators_1.calculateEMA)(candles.map((c) => c.close), 9);
    const mostRecentIndex = 0;
    const signals = [];
    const priceToEMA9Ratio = (price.last_price - ema[mostRecentIndex]) / ema[mostRecentIndex];
    const proximityThreshold = 0.12;
    if (priceToEMA9Ratio >= proximityThreshold) {
        signals.push({
            type: `${keyName} Price in overbought Zone`,
            time: Date.now(),
            price: price.last_price,
            details: `Price is ${proximityThreshold * 100}% above 9 EMA, sell signal`,
        });
    }
    return signals;
};
exports.priceAwayFromAverage = priceAwayFromAverage;
const getTrend = (emasShort, emasLong) => {
    return emasShort[0] > emasLong[0] ? "UPTREND" : "DOWNTREND";
};
exports.getTrend = getTrend;
const getRSIOverbought = async (keyname, duration) => {
    const candles = await (0, priceApi_1.fetchCandleData)(keyname, duration);
    if (!candles)
        return [];
    return (0, techincalIndicators_1.calculateRSI)(candles.map((candle) => candle.close), 14);
};
exports.getRSIOverbought = getRSIOverbought;
