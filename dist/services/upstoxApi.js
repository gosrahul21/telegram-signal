"use strict";
// TESTED - Ok
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var candleData_1 = require("../models/candleData");
var Duration_1 = require("../types/Duration");
require("dotenv/config");
exports.aggregateToHourlyCandles = function (data) {
    // Initialize an array to hold the aggregated hourly candles
    var hourlyCandles = [];
    // Iterate through the 30-minute candles in pairs
    for (var i = 0; i < data.length; i += 2) {
        // If there is not a second candle to pair with, break the loop
        // Get the first and second candles in the pair
        var secondCandle = data[i]; // secondCandle -> 0, firstCandle=> 1-> open
        var firstCandle = data[i + 1];
        if (i + 1 >= data.length) {
            var hourlyCandle_1 = {
                timestamp: secondCandle.timestamp,
                open: secondCandle.open,
                high: secondCandle.high,
                low: secondCandle.low,
                close: secondCandle.close,
                volume: secondCandle.volume,
                openInterest: secondCandle.openInterest
            };
            hourlyCandles.push(hourlyCandle_1);
            break;
        }
        // Aggregate the data into a 1-hour candle
        var hourlyCandle = {
            timestamp: firstCandle.timestamp,
            open: firstCandle.open,
            high: Math.max(firstCandle.high, secondCandle.high),
            low: Math.min(firstCandle.low, secondCandle.low),
            close: secondCandle.close,
            volume: firstCandle.volume + secondCandle.volume,
            openInterest: secondCandle.openInterest
        };
        // Add the aggregated 1-hour candle to the array
        hourlyCandles.push(hourlyCandle);
    }
    // Return the array of aggregated hourly candles
    return hourlyCandles;
};
exports.fetchCandleHistory = function (instrumentKey, interval, toDate, // yyyy-mm-dd
fromDate // yyyy-mm-dd
) { return __awaiter(_this, void 0, Promise, function () {
    var url, response, data, candleData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                url = process.env.UPSTOX_API_BASE + "/historical-candle/" + instrumentKey + "/" + interval + "/" + toDate + "/" + fromDate;
                return [4 /*yield*/, axios_1["default"].get(url)];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.data];
            case 2:
                data = _a.sent();
                candleData = candleData_1.CandleDataModal(data);
                // If interval is 30 minutes, convert to hourly candles
                if (interval === Duration_1.UpstoxInterval.ThirtyMinutes) {
                    return [2 /*return*/, exports.aggregateToHourlyCandles(candleData)];
                }
                // Return the candle data if no conversion is needed
                return [2 /*return*/, candleData];
            case 3:
                error_1 = _a.sent();
                console.log("Error in fetching candle history of " + instrumentKey + ":", error_1);
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); };
// hourly intraday candles
exports.getIntradayCandles = function (instrumentKey) { return __awaiter(_this, void 0, void 0, function () {
    var url, response, data, candleData, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                url = process.env.UPSTOX_API_BASE + "/historical-candle/intraday/" + instrumentKey + "/30minute";
                return [4 /*yield*/, axios_1["default"].get(url)];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.data];
            case 2:
                data = _a.sent();
                candleData = candleData_1.CandleDataModal(data);
                // If interval is 30 minutes, convert to hourly candles
                return [2 /*return*/, exports.aggregateToHourlyCandles(candleData)];
            case 3:
                error_2 = _a.sent();
                console.log("Error in fetching candle history of " + instrumentKey + ":", error_2);
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.aggregateToDayCandle = function (intradayCandles) {
    // Ensure the input list is not empty
    if (!intradayCandles || intradayCandles.length === 0) {
        throw new Error("No intraday candles provided");
    }
    var firstCandle = intradayCandles[intradayCandles.length - 1];
    var lastCandle = intradayCandles[0];
    // Initialize variables for aggregation
    var dailyCandle = {
        timestamp: lastCandle.timestamp,
        open: firstCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
        volume: 0,
        openInterest: lastCandle.openInterest
    };
    // Iterate through the intraday candles to calculate daily candle properties
    intradayCandles.forEach(function (candle) {
        // Update the daily high and low prices
        dailyCandle.high = Math.max(dailyCandle.high, candle.high);
        dailyCandle.low = Math.min(dailyCandle.low, candle.low);
        // Sum up the volume
        dailyCandle.volume += candle.volume;
    });
    return dailyCandle;
};
