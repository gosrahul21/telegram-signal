"use strict";
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
var _this = this;
exports.__esModule = true;
var constants_1 = require("../utils/constants");
var priceApi_1 = require("./priceApi");
var techincalIndicators_1 = require("../utils/helper/techincalIndicators");
var ema = require("exponential-moving-average");
function calculateEMA(candlePrices, duration) {
    var arr = candlePrices.map(function (candle) { return candle.close; });
    arr.reverse();
    return ema(arr, duration).reverse();
}
exports.calculateEMA = calculateEMA;
var candlePriceMapping = {};
var ema9Map = {};
var ema21Map = {};
var ema20Map = {};
var ema50Map = {};
// Function to generate buy signals based on recent EMA values
function generateCrossSignals(prices, ema9, ema21, ema20, ema50, getTrend) {
    if (getTrend === void 0) { getTrend = false; }
    // Array to hold buy signals
    var signals = [];
    // Check for recent EMA crossovers
    var mostRecentIndex = 0; // Since the most recent values are first
    // Check for 9/21 EMA crossover
    if (ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]) {
        var signal = {
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "9 EMA crossed above 21 EMA, buy/long signal"
        };
        signals.push(signal);
    }
    else if (ema9[mostRecentIndex] < ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] >= ema21[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "21 EMA crossed above 9 EMA, sell/short signal"
        });
    }
    else if (getTrend) {
        signals.push({
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "" + (ema9[mostRecentIndex] < ema21[mostRecentIndex] ? "downtrend" : "uptrend")
        });
    }
    // Check for 20/50 EMA crossover
    if (ema20[mostRecentIndex] > ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] <= ema50[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 20/50",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "20 EMA crossed above 50 EMA"
        });
    }
    else if (ema20[mostRecentIndex] < ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] >= ema50[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 20/50",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "21 EMA crossed above 9 EMA, sell/short signal"
        });
    }
    else if (getTrend) {
        signals.push({
            type: "EMA crossover 20/50",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "" + (ema9[mostRecentIndex] < ema21[mostRecentIndex] ? "downtrend" : "uptrend")
        });
    }
    return signals;
}
exports.generateCrossSignals = generateCrossSignals;
exports.checkIfPriceNearEma = function (prices, ema) {
    var signals = [];
    var mostRecentIndex = 0;
    // Check if the price is near the 9 EMA
    var priceToEMA9Ratio = Math.abs(prices[mostRecentIndex].close - ema[mostRecentIndex]) /
        ema[mostRecentIndex];
    var proximityThreshold = 0.01; // Define a threshold (e.g., 1%) for proximity
    if (priceToEMA9Ratio < proximityThreshold) {
        signals.push({
            type: "Price near 9 EMA",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "Price is within " + proximityThreshold * 100 + "% of 9 EMA"
        });
    }
    return signals;
};
exports.getTrendStatus = function (pairName, duration) { return __awaiter(_this, void 0, void 0, function () {
    var candles, ema9, ema21, ema20, ema50;
    return __generator(this, function (_a) {
        candles = candlePriceMapping[pairName + "." + duration];
        ema9 = calculateEMA(candles, 9);
        ema21 = calculateEMA(candles, 21);
        ema20 = calculateEMA(candles, 20);
        ema50 = calculateEMA(candles, 50);
        // Generate crossing signals based on the EMAs and candle data
        // Process or display the signals (you can handle the output as per your requirement)
        return [2 /*return*/, generateCrossSignals(candles, ema9, ema21, ema20, ema50, true).concat(exports.checkIfPriceNearEma(candles, ema9))];
    });
}); };
exports.generateSignal = function (keyname, duration) { return __awaiter(_this, void 0, void 0, function () {
    var candles, ema9, ema21, ema20, ema50, signals;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, priceApi_1.fetchCandleData(keyname, duration)];
            case 1:
                candles = _a.sent();
                candlePriceMapping[keyname + "." + duration] = candles;
                ema9 = calculateEMA(candles, 9);
                ema21 = calculateEMA(candles, 21);
                ema20 = calculateEMA(candles, 20);
                ema50 = calculateEMA(candles, 50);
                ema9Map[keyname + "." + duration] = ema9;
                ema21Map[keyname + "." + duration] = ema21;
                ema20Map[keyname + "." + duration] = ema20;
                ema50Map[keyname + "." + duration] = ema50;
                signals = generateCrossSignals(candles, ema9, ema21, ema20, ema50);
                // Process or display the signals (you can handle the output as per your requirement)
                return [2 /*return*/, signals];
        }
    });
}); };
exports.priceAwayFromAverage = function (keyName, pairName, duration) { return __awaiter(_this, void 0, void 0, function () {
    var prices, price, ema, signals, mostRecentIndex, priceToEMA9Ratio, proximityThreshold;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, priceApi_1.fetchTickerPrice(keyName)];
            case 1:
                prices = _a.sent();
                price = prices.find(function (price) { return price.market === keyName; });
                ema = ema9Map[pairName + "." + duration];
                signals = [];
                mostRecentIndex = 0;
                priceToEMA9Ratio = (price.last_price - ema[mostRecentIndex]) / ema[mostRecentIndex];
                proximityThreshold = 0.12;
                if (priceToEMA9Ratio >= proximityThreshold) {
                    signals.push({
                        type: keyName + " Price in overbought Zone",
                        time: prices[mostRecentIndex].time,
                        price: prices[mostRecentIndex].close,
                        details: "Price is " + proximityThreshold * 100 + "% above 9 EMA, sell signal"
                    });
                }
                return [2 /*return*/, signals];
        }
    });
}); };
exports.getTrend = function (emasShort, emasLong) {
    return emasShort[0] > emasLong[0] ? "UPTREND" : "DOWNTREND";
};
exports.getSmallSignal = function (keyname, duration, emaShort, emaLong) { return __awaiter(_this, void 0, void 0, function () {
    var pairname, candles, emasShort, emasLong, mostRecentIndex, signals, recentCandle, secondRecentCandle, trend;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pairname = constants_1.keyPairsMapping[keyname];
                return [4 /*yield*/, priceApi_1.fetchCandleData(pairname, duration)];
            case 1:
                candles = _a.sent();
                emasShort = calculateEMA(candles, emaShort);
                emasLong = calculateEMA(candles, emaLong);
                mostRecentIndex = 0;
                signals = [];
                if (emasShort[mostRecentIndex] > emasLong[mostRecentIndex] &&
                    emasShort[mostRecentIndex + 1] <= emasLong[mostRecentIndex + 1]) {
                    signals.push({
                        type: "EMA crossover " + emaShort + "/" + emaLong,
                        time: candles[mostRecentIndex].time,
                        price: candles[mostRecentIndex].close,
                        details: emaShort + " EMA crossed above " + emaLong + " EMA"
                    });
                }
                else if (emasShort[mostRecentIndex] < emasLong[mostRecentIndex] &&
                    emasShort[mostRecentIndex + 1] >= emasLong[mostRecentIndex + 1]) {
                    signals.push({
                        type: "EMA crossover " + emaShort + "/" + emaLong,
                        time: candles[mostRecentIndex].time,
                        price: candles[mostRecentIndex].close,
                        details: emaLong + " EMA crossed above " + emaShort + " EMA, sell/short signal"
                    });
                }
                recentCandle = candles[mostRecentIndex];
                secondRecentCandle = candles[mostRecentIndex + 1];
                trend = exports.getTrend(emasShort, emasLong);
                if (trend === "UPTREND") {
                    if (secondRecentCandle.close >= emasShort[mostRecentIndex + 1] &&
                        recentCandle.close < emasShort[mostRecentIndex]) {
                        // generate signal that trend may change, from downtrend to uptrend, take decision wisely
                        signals.push({
                            type: "Trend reversal condition  " + emaShort + "/" + emaLong,
                            time: candles[mostRecentIndex].time,
                            price: candles[mostRecentIndex].close,
                            details: "trend may change, from downtrend to uptrend, take decision wisely "
                        });
                    }
                }
                else {
                    if (secondRecentCandle.close <= emasShort[mostRecentIndex + 1] &&
                        recentCandle.close > emasShort[mostRecentIndex]) {
                        // generate signal that trend may change, from downtrend to uptrend, take decision wisely
                        signals.push({
                            type: "Trend reversal condition " + emaShort + "/" + emaLong,
                            time: candles[mostRecentIndex].time,
                            price: candles[mostRecentIndex].close,
                            details: "trend may change, from downtrend to uptrend, take decision wisely "
                        });
                    }
                }
                return [2 /*return*/, signals];
        }
    });
}); };
exports.getRSIOverbought = function (keyname, duration) { return __awaiter(_this, void 0, void 0, function () {
    var candles, rsi;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, priceApi_1.fetchCandleData(keyname, duration)];
            case 1:
                candles = _a.sent();
                console.log(candles);
                rsi = techincalIndicators_1.calculateRSI(candles.map(function (candle) { return candle.close; }), 14);
                console.log(rsi.slice(-1)[0]);
                return [2 /*return*/, rsi];
        }
    });
}); };
