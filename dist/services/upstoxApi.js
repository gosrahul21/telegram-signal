"use strict";
// TESTED - Ok
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateToDayCandle = exports.getIntradayCandles = exports.fetchCandleHistory = exports.aggregateToHourlyCandles = void 0;
const axios_1 = __importDefault(require("axios"));
const candleData_1 = require("../models/candleData");
require("dotenv/config");
const config_1 = __importDefault(require("../config"));
const aggregateToHourlyCandles = (data) => {
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
                closeTime: secondCandle.closeTime, // Use the timestamp of the first 30-minute candle
                open: secondCandle.open, // Open price is the open of the first 30-minute candle
                high: secondCandle.high, // High price is the max of the highs from both 30-minute candles
                low: secondCandle.low, // Low price is the min of the lows from both 30-minute candles
                close: secondCandle.close, // Close price is the close of the second 30-minute candle
                volume: secondCandle.volume, // Volume is the sum of the volumes from both 30-minute candles
                openInterest: secondCandle.openInterest, // Use the open interest of the second candle
            };
            hourlyCandles.push(hourlyCandle);
            break;
        }
        // Aggregate the data into a 1-hour candle
        const hourlyCandle = {
            closeTime: firstCandle.closeTime, // Use the timestamp of the first 30-minute candle
            open: firstCandle.open, // Open price is the open of the first 30-minute candle
            high: Math.max(firstCandle.high, secondCandle.high), // High price is the max of the highs from both 30-minute candles
            low: Math.min(firstCandle.low, secondCandle.low), // Low price is the min of the lows from both 30-minute candles
            close: secondCandle.close, // Close price is the close of the second 30-minute candle
            volume: firstCandle.volume + secondCandle.volume, // Volume is the sum of the volumes from both 30-minute candles
            openInterest: secondCandle.openInterest, // Use the open interest of the second candle
        };
        // Add the aggregated 1-hour candle to the array
        hourlyCandles.push(hourlyCandle);
    }
    // Return the array of aggregated hourly candles
    return hourlyCandles;
};
exports.aggregateToHourlyCandles = aggregateToHourlyCandles;
const fetchCandleHistory = async (instrumentKey, interval, toDate) => {
    try {
        // Construct the URL
        const url = `${config_1.default.UPSTOX_API_BASE}/historical-candle/${instrumentKey}/${interval}/${toDate}`;
        // Fetch the data
        const response = await axios_1.default.get(url);
        const data = await response.data;
        // Convert the data using the CandleDataModal function
        const candleData = (0, candleData_1.CandleDataModal)(data);
        return candleData;
    }
    catch (error) {
        console.log(`Error in fetching candle history of ${instrumentKey}:`, error);
        return [];
    }
};
exports.fetchCandleHistory = fetchCandleHistory;
// hourly intraday candles
const getIntradayCandles = async (instrumentKey, interval) => {
    try {
        // Construct the URL
        const url = `${config_1.default.UPSTOX_API_BASE}/historical-candle/intraday/${instrumentKey}/${interval}`;
        // Fetch the data
        const response = await axios_1.default.get(url);
        const data = await response.data;
        // Convert the data using the CandleDataModal function
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
    // Ensure the input list is not empty
    if (!intradayCandles || intradayCandles.length === 0) {
        throw new Error("No intraday candles provided");
    }
    const firstCandle = intradayCandles[intradayCandles.length - 1];
    const lastCandle = intradayCandles[0];
    // Initialize variables for aggregation
    let dailyCandle = {
        closeTime: lastCandle.closeTime, // Use the timestamp of the first candle as the daily candle's timestamp
        open: firstCandle.open, // Open price is the open of the first candle
        high: lastCandle.high, // Start with the first candle's high price
        low: lastCandle.low, // Start with the first candle's low price
        close: lastCandle.close, // Close price is the close of the last candle
        volume: 0, // Start with zero volume
        openInterest: lastCandle.openInterest, // Use the open interest of the last candle
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
exports.aggregateToDayCandle = aggregateToDayCandle;
