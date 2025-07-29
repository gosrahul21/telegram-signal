"use strict";
// TESTED - Ok
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const candleData_1 = require("../models/candleData");
const Duration_1 = require("../types/Duration");
require("dotenv/config");
exports.aggregateToHourlyCandles = (data) => {
    // Initialize an array to hold the aggregated hourly candles
    const hourlyCandles = [];
    // Iterate through the 30-minute candles in pairs
    for (let i = 0; i < data.length; i += 2) {
        // If there is not a second candle to pair with, break the loop
        // Get the first and second candles in the pair
        const secondCandle = data[i]; // secondCandle -> 0, firstCandle=> 1-> open
        const firstCandle = data[i + 1];
        if (i + 1 >= data.length) {
            const hourlyCandle = {
                timestamp: secondCandle.timestamp,
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
        // Aggregate the data into a 1-hour candle
        const hourlyCandle = {
            timestamp: firstCandle.timestamp,
            open: firstCandle.open,
            high: Math.max(firstCandle.high, secondCandle.high),
            low: Math.min(firstCandle.low, secondCandle.low),
            close: secondCandle.close,
            volume: firstCandle.volume + secondCandle.volume,
            openInterest: secondCandle.openInterest,
        };
        // Add the aggregated 1-hour candle to the array
        hourlyCandles.push(hourlyCandle);
    }
    // Return the array of aggregated hourly candles
    return hourlyCandles;
};
exports.fetchCandleHistory = async (instrumentKey, interval, toDate, // yyyy-mm-dd
fromDate // yyyy-mm-dd
) => {
    try {
        // Construct the URL
        const url = `${process.env.UPSTOX_API_BASE}/historical-candle/${instrumentKey}/${interval}/${toDate}/${fromDate}`;
        // Fetch the data
        const response = await axios_1.default.get(url);
        const data = await response.data;
        // Convert the data using the CandleDataModal function
        const candleData = candleData_1.CandleDataModal(data);
        // If interval is 30 minutes, convert to hourly candles
        if (interval === Duration_1.UpstoxInterval.ThirtyMinutes) {
            return exports.aggregateToHourlyCandles(candleData);
        }
        // Return the candle data if no conversion is needed
        return candleData;
    }
    catch (error) {
        console.log(`Error in fetching candle history of ${instrumentKey}:`, error);
        return [];
    }
};
// hourly intraday candles
exports.getIntradayCandles = async (instrumentKey) => {
    try {
        // Construct the URL
        const url = `${process.env.UPSTOX_API_BASE}/historical-candle/intraday/${instrumentKey}/30minute`;
        // Fetch the data
        const response = await axios_1.default.get(url);
        const data = await response.data;
        // Convert the data using the CandleDataModal function
        const candleData = candleData_1.CandleDataModal(data);
        // If interval is 30 minutes, convert to hourly candles
        return exports.aggregateToHourlyCandles(candleData);
    }
    catch (error) {
        console.log(`Error in fetching candle history of ${instrumentKey}:`, error);
        return [];
    }
};
exports.aggregateToDayCandle = (intradayCandles) => {
    // Ensure the input list is not empty
    if (!intradayCandles || intradayCandles.length === 0) {
        throw new Error("No intraday candles provided");
    }
    const firstCandle = intradayCandles[intradayCandles.length - 1];
    const lastCandle = intradayCandles[0];
    // Initialize variables for aggregation
    let dailyCandle = {
        timestamp: lastCandle.timestamp,
        open: firstCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
        volume: 0,
        openInterest: lastCandle.openInterest,
    };
    // Iterate through the intraday candles to calculate daily candle properties
    intradayCandles.forEach((candle) => {
        // Update the daily high and low prices
        dailyCandle.high = Math.max(dailyCandle.high, candle.high);
        dailyCandle.low = Math.min(dailyCandle.low, candle.low);
        // Sum up the volume
        dailyCandle.volume += candle.volume;
    });
    return dailyCandle;
};
