"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCandleData = fetchCandleData;
exports.fetchTickerPrice = fetchTickerPrice;
const axios_1 = require("axios");
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
        console.error('Error fetching Binance candle data:', error);
        return null;
    }
}
async function fetchTickerPrice(symbol) {
    try {
        const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching Binance ticker price:', error);
        return null;
    }
}
//# sourceMappingURL=priceApi.js.map