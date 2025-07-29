"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const priceApi_1 = require("../../services/priceApi");
const ti = require("technicalindicators");
// Calculate EMA
function calculateEMA(prices, period) {
    return ti.EMA.calculate({ period, values: prices });
}
exports.calculateEMA = calculateEMA;
// Calculate RSI (Relative Strength Index)
function calculateRSI(prices, period = 14) {
    return ti.RSI.calculate({ period, values: prices });
}
exports.calculateRSI = calculateRSI;
// Calculate MACD (12, 26, 9)
function calculateMACD(prices) {
    return ti.MACD.calculate({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    });
}
exports.calculateMACD = calculateMACD;
exports.getIndicatorOnTimeFrame = async (symbol, timeframe) => {
    const candleData = await priceApi_1.fetchCandleData(symbol, timeframe);
    const prices = candleData.map(({ close }) => close);
    // Get last 7 values from each indicator
    const macdResult = calculateMACD(prices).slice(-7);
    const ema9Series = calculateEMA(prices, 9).slice(-7);
    const ema20Series = calculateEMA(prices, 20).slice(-7);
    const rsiSeries = calculateRSI(prices, 14).slice(-7);
    let indicatorDetails = [
        `Technical indicators for ${timeframe} ${symbol}`,
        `Current Price: ${candleData[candleData.length - 1].close}`,
        "MACD (12,26,9): " + JSON.stringify(macdResult),
        "EMA (9-day): " + JSON.stringify(ema9Series),
        "EMA (20-day): " + JSON.stringify(ema20Series),
        "RSI (14-day): " + JSON.stringify(rsiSeries),
    ].join("\n");
    return indicatorDetails;
};
