"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../constants/symbols");
const Duration_1 = require("../types/Duration");
const formatDate_1 = __importDefault(require("../utils/helper/formatDate"));
const upstoxApi_1 = require("./upstoxApi");
// to be tested
async function getStockHistoricalCandles(symbol, interval) {
    // Iterate through each instrument in the instrument mapping
    // Calculate the toDate as current date
    const toDate = new Date();
    // Format the dates to "yyyy:mm:dd" format
    const formattedToDate = (0, formatDate_1.default)(toDate); //current date
    let historicalCandles = await (0, upstoxApi_1.fetchCandleHistory)(symbols_1.instrumentMapping[symbol], interval, formattedToDate);
    if (interval === Duration_1.UpstoxInterval.OneHour) {
        const intradayCandles = await (0, upstoxApi_1.getIntradayCandles)(symbol, interval);
        // const fiveMinutesCandles = await getIntradayCandles(
        //   symbol,
        //   UpstoxInterval.FiveMinutes
        // );
        historicalCandles = [
            // ...(fiveMinutesCandles.length > 0 ? [fiveMinutesCandles[0]] : []), // first 5 minutes candle
            ...intradayCandles,
            ...historicalCandles,
        ];
    }
    else if (interval === Duration_1.UpstoxInterval.OneDay) {
        const intradayCandles = await (0, upstoxApi_1.getIntradayCandles)(symbol, Duration_1.UpstoxInterval.OneHour);
        historicalCandles = [
            (0, upstoxApi_1.aggregateToDayCandle)(intradayCandles),
            ...historicalCandles,
        ];
    }
    return historicalCandles.reverse();
}
exports.default = getStockHistoricalCandles;
