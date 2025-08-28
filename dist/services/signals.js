"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrend = exports.getTrendStatus = exports.checkIfPriceNearEma = void 0;
exports.calculateEMA = calculateEMA;
exports.generateCrossSignals = generateCrossSignals;
const ema = require('exponential-moving-average');
function calculateEMA(candlePrices, duration) {
    const arr = candlePrices.map((candle) => candle.close);
    arr.reverse();
    return ema(arr, duration).reverse();
}
const candlePriceMapping = {};
const ema9Map = {};
const ema21Map = {};
const ema20Map = {};
const ema50Map = {};
function generateCrossSignals(prices, ema9, ema21, ema20, ema50, getTrend = false) {
    const signals = [];
    const mostRecentIndex = 0;
    if (ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]) {
        const signal = {
            type: 'EMA crossover 9/21',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: '9 EMA crossed above 21 EMA, buy/long signal',
        };
        signals.push(signal);
    }
    else if (ema9[mostRecentIndex] < ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] >= ema21[mostRecentIndex + 1]) {
        signals.push({
            type: 'EMA crossover 9/21',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: '21 EMA crossed above 9 EMA, sell/short signal',
        });
    }
    else if (getTrend) {
        signals.push({
            type: 'EMA crossover 9/21',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `${ema9[mostRecentIndex] < ema21[mostRecentIndex] ? 'downtrend' : 'uptrend'}`,
        });
    }
    if (ema20[mostRecentIndex] > ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] <= ema50[mostRecentIndex + 1]) {
        signals.push({
            type: 'EMA crossover 20/50',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: '20 EMA crossed above 50 EMA',
        });
    }
    else if (ema20[mostRecentIndex] < ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] >= ema50[mostRecentIndex + 1]) {
        signals.push({
            type: 'EMA crossover 20/50',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: '21 EMA crossed above 9 EMA, sell/short signal',
        });
    }
    else if (getTrend) {
        signals.push({
            type: 'EMA crossover 20/50',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `${ema9[mostRecentIndex] < ema21[mostRecentIndex] ? 'downtrend' : 'uptrend'}`,
        });
    }
    return signals;
}
const checkIfPriceNearEma = (prices, ema) => {
    let signals = [];
    const mostRecentIndex = 0;
    const priceToEMA9Ratio = Math.abs(prices[mostRecentIndex].close - ema[mostRecentIndex]) /
        ema[mostRecentIndex];
    const proximityThreshold = 0.01;
    if (priceToEMA9Ratio < proximityThreshold) {
        signals.push({
            type: 'Price near 9 EMA',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `Price is within ${proximityThreshold * 100}% of 9 EMA`,
        });
    }
    return signals;
};
exports.checkIfPriceNearEma = checkIfPriceNearEma;
const getTrendStatus = async (pairName, duration) => {
    const candles = candlePriceMapping[`${pairName}.${duration}`];
    const ema9 = calculateEMA(candles, 9);
    const ema21 = calculateEMA(candles, 21);
    const ema20 = calculateEMA(candles, 20);
    const ema50 = calculateEMA(candles, 50);
    return [
        ...generateCrossSignals(candles, ema9, ema21, ema20, ema50, true),
        ...(0, exports.checkIfPriceNearEma)(candles, ema9),
    ];
};
exports.getTrendStatus = getTrendStatus;
const getTrend = (emasShort, emasLong) => {
    return emasShort[0] > emasLong[0] ? 'UPTREND' : 'DOWNTREND';
};
exports.getTrend = getTrend;
//# sourceMappingURL=signals.js.map