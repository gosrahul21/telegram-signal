"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCandleData = fetchCandleData;
exports.fetchTickerPrice = fetchTickerPrice;
const axios_1 = __importDefault(require("axios"));
// Function to fetch candlestick (OHLC) data from Binance API
async function fetchCandleData(symbol, interval) {
    try {
        const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}`;
        const response = await axios_1.default.get(url);
        return response.data.map((candle) => ({
            openTime: candle[0],
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5]),
            closeTime: candle[6],
        }));
    }
    catch (error) {
        console.error("Error fetching Binance candle data:", error);
        return null;
    }
}
// Function to fetch the latest ticker price from Binance API
async function fetchTickerPrice(symbol) {
    try {
        const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching Binance ticker price:", error);
        return null;
    }
}
