"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateToDayCandle = exports.getIntradayCandles = exports.fetchCandleHistory = exports.aggregateToHourlyCandles = void 0;
const axios_1 = require("axios");
const candleData_1 = require("../utils/helper/models/candleData");
require("dotenv/config");
const config_1 = require("../utils/config");
const aggregateToHourlyCandles = (data) => {
    const hourlyCandles = [];
    for (let i = 0; i < data.length; i += 2) {
        const secondCandle = data[i];
        const firstCandle = data[i + 1];
        if (i + 1 >= data.length) {
            const hourlyCandle = {
                closeTime: secondCandle.closeTime,
                open: secondCandle.open,
                high: secondCandle.high,
                low: secondCandle.low,
                close: secondCandle.close,
                volume: secondCandle.volume,
                openInterest: secondCandle.openInterest,
            };
            hourlyCandles.push(hourlyCandle);
            break;
        }
        const hourlyCandle = {
            closeTime: firstCandle.closeTime,
            open: firstCandle.open,
            high: Math.max(firstCandle.high, secondCandle.high),
            low: Math.min(firstCandle.low, secondCandle.low),
            close: secondCandle.close,
            volume: firstCandle.volume + secondCandle.volume,
            openInterest: secondCandle.openInterest,
        };
        hourlyCandles.push(hourlyCandle);
    }
    return hourlyCandles;
};
exports.aggregateToHourlyCandles = aggregateToHourlyCandles;
const fetchCandleHistory = async (instrumentKey, interval, toDate) => {
    try {
        const url = `${config_1.default.UPSTOX_API_BASE}/historical-candle/${instrumentKey}/${interval}/${toDate}`;
        const response = await axios_1.default.get(url);
        const data = await response.data;
        const candleData = (0, candleData_1.CandleDataModal)(data);
        return candleData;
    }
    catch (error) {
        console.log(`Error in fetching candle history of ${instrumentKey}:`, error);
        return [];
    }
};
exports.fetchCandleHistory = fetchCandleHistory;
const getIntradayCandles = async (instrumentKey, interval) => {
    try {
        const url = `${config_1.default.UPSTOX_API_BASE}/historical-candle/intraday/${instrumentKey}/${interval}`;
        const response = await axios_1.default.get(url);
        const data = await response.data;
        const candleData = (0, candleData_1.CandleDataModal)(data);
        return candleData;
    }
    catch (error) {
        console.log(`Error in fetching candle history of ${instrumentKey}:`, error);
        return [];
    }
};
exports.getIntradayCandles = getIntradayCandles;
const aggregateToDayCandle = (intradayCandles) => {
    if (!intradayCandles || intradayCandles.length === 0) {
        throw new Error('No intraday candles provided');
    }
    const firstCandle = intradayCandles[intradayCandles.length - 1];
    const lastCandle = intradayCandles[0];
    let dailyCandle = {
        closeTime: lastCandle.closeTime,
        open: firstCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
        volume: 0,
        openInterest: lastCandle.openInterest,
    };
    intradayCandles.forEach((candle) => {
        dailyCandle.high = Math.max(dailyCandle.high, candle.high);
        dailyCandle.low = Math.min(dailyCandle.low, candle.low);
        dailyCandle.volume += candle.volume;
    });
    return dailyCandle;
};
exports.aggregateToDayCandle = aggregateToDayCandle;
//# sourceMappingURL=upstoxApi.js.map