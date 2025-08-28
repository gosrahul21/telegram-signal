"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upstoxPriceApiService = exports.UpstoxPriceApiService = void 0;
const Duration_1 = require("../utils/types/Duration");
const formatDate_1 = require("../utils/helper/formatDate");
const upstoxApi_1 = require("./upstoxApi");
const constants_1 = require("../utils/constants");
class UpstoxPriceApiService {
    constructor() { }
    async getStockHistoricalCandles(symbol, interval) {
        const toDate = new Date();
        const formattedToDate = (0, formatDate_1.default)(toDate);
        const intrumentKey = constants_1.instrumentMapping[symbol];
        let historicalCandles = await (0, upstoxApi_1.fetchCandleHistory)(intrumentKey, interval, formattedToDate);
        if (interval === Duration_1.UpstoxInterval.OneHour) {
            const intradayCandles = await (0, upstoxApi_1.getIntradayCandles)(intrumentKey, interval);
            historicalCandles = [
                ...intradayCandles,
                ...historicalCandles,
            ];
        }
        else if (interval === Duration_1.UpstoxInterval.OneDay) {
            const intradayCandles = await (0, upstoxApi_1.getIntradayCandles)(intrumentKey, Duration_1.UpstoxInterval.OneHour);
            historicalCandles = [
                (0, upstoxApi_1.aggregateToDayCandle)(intradayCandles),
                ...historicalCandles,
            ];
        }
        return historicalCandles.reverse();
    }
}
exports.UpstoxPriceApiService = UpstoxPriceApiService;
exports.upstoxPriceApiService = new UpstoxPriceApiService();
//# sourceMappingURL=getStockHistoricalCandles.js.map