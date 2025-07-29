"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../utils/constants");
const priceApi_1 = require("./priceApi");
const techincalIndicators_1 = require("../utils/helper/techincalIndicators");
const ema = require("exponential-moving-average");
function calculateEMA(candlePrices, duration) {
    const arr = candlePrices.map((candle) => candle.close);
    arr.reverse();
    return ema(arr, duration).reverse();
}
exports.calculateEMA = calculateEMA;
const candlePriceMapping = {};
const ema9Map = {};
const ema21Map = {};
const ema20Map = {};
const ema50Map = {};
// Function to generate buy signals based on recent EMA values
function generateCrossSignals(prices, ema9, ema21, ema20, ema50, getTrend = false) {
    // Array to hold buy signals
    const signals = [];
    // Check for recent EMA crossovers
    const mostRecentIndex = 0; // Since the most recent values are first
    // Check for 9/21 EMA crossover
    if (ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]) {
        const signal = {
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "9 EMA crossed above 21 EMA, buy/long signal",
        };
        signals.push(signal);
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
            details: "21 EMA crossed above 9 EMA, sell/short signal",
        });
    }
    else if (getTrend) {
        signals.push({
            type: "EMA crossover 20/50",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `${ema9[mostRecentIndex] < ema21[mostRecentIndex] ? "downtrend" : "uptrend"}`,
        });
    }
    return signals;
}
exports.generateCrossSignals = generateCrossSignals;
exports.checkIfPriceNearEma = (prices, ema) => {
    let signals = [];
    const mostRecentIndex = 0;
    // Check if the price is near the 9 EMA
    const priceToEMA9Ratio = Math.abs(prices[mostRecentIndex].close - ema[mostRecentIndex]) /
        ema[mostRecentIndex];
    const proximityThreshold = 0.01; // Define a threshold (e.g., 1%) for proximity
    if (priceToEMA9Ratio < proximityThreshold) {
        signals.push({
            type: "Price near 9 EMA",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `Price is within ${proximityThreshold * 100}% of 9 EMA`,
        });
    }
    return signals;
};
exports.getTrendStatus = async (pairName, duration) => {
    const candles = candlePriceMapping[`${pairName}.${duration}`];
    const ema9 = calculateEMA(candles, 9);
    const ema21 = calculateEMA(candles, 21);
    const ema20 = calculateEMA(candles, 20);
    const ema50 = calculateEMA(candles, 50);
    // Generate crossing signals based on the EMAs and candle data
    // Process or display the signals (you can handle the output as per your requirement)
    return [
        ...generateCrossSignals(candles, ema9, ema21, ema20, ema50, true),
        ...exports.checkIfPriceNearEma(candles, ema9),
    ];
};
exports.generateSignal = async (keyname, duration) => {
    // const pairname = keyPairsMapping[keyname]
    const candles = await priceApi_1.fetchCandleData(keyname, duration);
    candlePriceMapping[`${keyname}.${duration}`] = candles;
    const ema9 = calculateEMA(candles, 9);
    const ema21 = calculateEMA(candles, 21);
    const ema20 = calculateEMA(candles, 20);
    const ema50 = calculateEMA(candles, 50);
    ema9Map[`${keyname}.${duration}`] = ema9;
    ema21Map[`${keyname}.${duration}`] = ema21;
    ema20Map[`${keyname}.${duration}`] = ema20;
    ema50Map[`${keyname}.${duration}`] = ema50;
    // Generate crossing signals based on the EMAs and candle data
    const signals = generateCrossSignals(candles, ema9, ema21, ema20, ema50);
    // Process or display the signals (you can handle the output as per your requirement)
    return signals;
};
exports.priceAwayFromAverage = async (keyName, pairName, duration) => {
    const prices = await priceApi_1.fetchTickerPrice(keyName);
    const price = prices.find((price) => price.market === keyName);
    const ema = ema9Map[`${pairName}.${duration}`];
    let signals = [];
    const mostRecentIndex = 0;
    // Check if the price is near the 9 EMA
    const priceToEMA9Ratio = (price.last_price - ema[mostRecentIndex]) / ema[mostRecentIndex];
    const proximityThreshold = 0.12; // Define a threshold (e.g., 1%) for proximity
    if (priceToEMA9Ratio >= proximityThreshold) {
        signals.push({
            type: `${keyName} Price in overbought Zone`,
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `Price is ${proximityThreshold * 100}% above 9 EMA, sell signal`,
        });
    }
    return signals;
};
exports.getTrend = (emasShort, emasLong) => {
    return emasShort[0] > emasLong[0] ? "UPTREND" : "DOWNTREND";
};
exports.getSmallSignal = async (keyname, duration, emaShort, emaLong) => {
    const pairname = constants_1.keyPairsMapping[keyname];
    const candles = await priceApi_1.fetchCandleData(pairname, duration);
    const emasShort = calculateEMA(candles, emaShort);
    const emasLong = calculateEMA(candles, emaLong);
    const mostRecentIndex = 0;
    const signals = [];
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
    const recentCandle = candles[mostRecentIndex];
    const secondRecentCandle = candles[mostRecentIndex + 1];
    const trend = exports.getTrend(emasShort, emasLong);
    if (trend === "UPTREND") {
        if (secondRecentCandle.close >= emasShort[mostRecentIndex + 1] &&
            recentCandle.close < emasShort[mostRecentIndex]) {
            // generate signal that trend may change, from downtrend to uptrend, take decision wisely
            signals.push({
                type: `Trend reversal condition  ${emaShort}/${emaLong}`,
                time: candles[mostRecentIndex].time,
                price: candles[mostRecentIndex].close,
                details: "trend may change, from downtrend to uptrend, take decision wisely ",
            });
        }
    }
    else {
        if (secondRecentCandle.close <= emasShort[mostRecentIndex + 1] &&
            recentCandle.close > emasShort[mostRecentIndex]) {
            // generate signal that trend may change, from downtrend to uptrend, take decision wisely
            signals.push({
                type: `Trend reversal condition ${emaShort}/${emaLong}`,
                time: candles[mostRecentIndex].time,
                price: candles[mostRecentIndex].close,
                details: "trend may change, from downtrend to uptrend, take decision wisely ",
            });
        }
    }
    return signals;
};
exports.getRSIOverbought = async (keyname, duration) => {
    // const pairname = keyPairsMapping[keyname];
    const candles = await priceApi_1.fetchCandleData(keyname, duration);
    console.log(candles);
    const rsi = techincalIndicators_1.calculateRSI(candles.map((candle) => candle.close), 14);
    console.log(rsi.slice(-1)[0]);
    return rsi;
};
