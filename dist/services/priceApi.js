"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
// // Function to fetch candle data from the Coindcx API
// export async function fetchCandleData(pair: string, interval: Duration) {
//     try {
//         const url = `https://public.coindcx.com/market_data/candles/?pair=${pair}&interval=${interval}`;
//         const response: any = await axios.get(url);
//         const data = await response.data;
//         return data;
//     } catch (error) {
//         console.log(error);
//     }
// }
// export async function fetchTickerPrice() {
//     const url = `https://api.coindcx.com/exchange/ticker/`;
//     const response: any = await axios.get(url);
//     const data = await response.data;
//     return data;
// }
// Function to fetch candlestick (OHLC) data from Binance API
async function fetchCandleData(symbol, interval) {
    try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`;
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
exports.fetchCandleData = fetchCandleData;
// Function to fetch the latest ticker price from Binance API
async function fetchTickerPrice(symbol) {
    try {
        const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching Binance ticker price:", error);
        return null;
    }
}
exports.fetchTickerPrice = fetchTickerPrice;
