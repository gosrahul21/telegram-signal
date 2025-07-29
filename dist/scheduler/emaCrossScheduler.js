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
var priceApi_1 = require("../services/priceApi");
var logger_1 = require("../logger");
var bot_1 = require("../services/bot");
var ema = require("exponential-moving-average");
// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
var fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "SUIUSDT"];
// Scheduler intervals (in minutes)
var SCHEDULER_INTERVALS = {
    "15m": 15,
    "1h": 60,
    "4h": 240,
    "1d": 1440
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function calculateEMA(candlePrices, duration) {
    var arr = candlePrices.map(function (candle) { return candle.close; });
    arr.reverse();
    return ema(arr, duration).reverse();
}
exports.calculateEMA = calculateEMA;
// ============================================================================
// EMA ANALYSIS FUNCTIONS
// ============================================================================
/**
 * Generate EMA crossover signals
 */
function generateCrossSignals(prices, ema9, ema21, ema20, ema50, getTrend) {
    if (getTrend === void 0) { getTrend = false; }
    var signals = [];
    var mostRecentIndex = 0;
    // Check for 9/21 EMA crossover
    if (ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]) {
        signals.push({
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "9 EMA crossed above 21 EMA, buy/long signal"
        });
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
            details: "50 EMA crossed above 20 EMA, sell/short signal"
        });
    }
    else if (getTrend) {
        signals.push({
            type: "EMA crossover 20/50",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "" + (ema20[mostRecentIndex] < ema50[mostRecentIndex]
                ? "downtrend"
                : "uptrend")
        });
    }
    return signals;
}
exports.generateCrossSignals = generateCrossSignals;
/**
 * Generate EMA signals for a given pair and duration
 */
exports.generateSignal = function (keyname, duration) { return __awaiter(_this, void 0, Promise, function () {
    var candles, ema9, ema21, ema20, ema50;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, priceApi_1.fetchCandleData(keyname, duration)];
            case 1:
                candles = _a.sent();
                ema9 = calculateEMA(candles, 9);
                ema21 = calculateEMA(candles, 21);
                ema20 = calculateEMA(candles, 20);
                ema50 = calculateEMA(candles, 50);
                return [2 /*return*/, generateCrossSignals(candles, ema9, ema21, ema20, ema50)];
        }
    });
}); };
/**
 * Generate custom EMA crossover signals with specified periods
 */
exports.getSmallSignal = function (keyname, duration, emaShort, emaLong) { return __awaiter(_this, void 0, Promise, function () {
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
                // Check for EMA crossover
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
                trend = emasShort[0] > emasLong[0] ? "UPTREND" : "DOWNTREND";
                if (trend === "UPTREND") {
                    if (secondRecentCandle.close >= emasShort[mostRecentIndex + 1] &&
                        recentCandle.close < emasShort[mostRecentIndex]) {
                        signals.push({
                            type: "Trend reversal condition " + emaShort + "/" + emaLong,
                            time: candles[mostRecentIndex].time,
                            price: candles[mostRecentIndex].close,
                            details: "trend may change, from downtrend to uptrend, take decision wisely"
                        });
                    }
                }
                else {
                    if (secondRecentCandle.close <= emasShort[mostRecentIndex + 1] &&
                        recentCandle.close > emasShort[mostRecentIndex]) {
                        signals.push({
                            type: "Trend reversal condition " + emaShort + "/" + emaLong,
                            time: candles[mostRecentIndex].time,
                            price: candles[mostRecentIndex].close,
                            details: "trend may change, from uptrend to downtrend, take decision wisely"
                        });
                    }
                }
                return [2 /*return*/, signals];
        }
    });
}); };
// ============================================================================
// SIGNAL RENDERING
// ============================================================================
/**
 * Render EMA signals to Telegram
 */
exports.renderSignal = function (pairName, signals, bot, duration) { return __awaiter(_this, void 0, Promise, function () {
    var signalArray, _i, signalArray_1, signal, _a, subscriberId_1, chatId, error_1, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                signalArray = Array.isArray(signals) ? signals : [signals];
                _i = 0, signalArray_1 = signalArray;
                _b.label = 1;
            case 1:
                if (!(_i < signalArray_1.length)) return [3 /*break*/, 12];
                signal = signalArray_1[_i];
                _a = 0, subscriberId_1 = bot_1.subscriberId;
                _b.label = 2;
            case 2:
                if (!(_a < subscriberId_1.length)) return [3 /*break*/, 7];
                chatId = subscriberId_1[_a];
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                return [4 /*yield*/, bot.api.sendMessage(chatId, "<b>EMA Signal for " + pairName + " - " + duration + "</b>\nType: " + signal.type + "\nTime: " + signal.time + "\nPrice: " + signal.price + "\nDetails: " + signal.details, { parse_mode: "HTML" })];
            case 4:
                _b.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error("Failed to send EMA signal to " + chatId + ":", error_1);
                return [3 /*break*/, 6];
            case 6:
                _a++;
                return [3 /*break*/, 2];
            case 7:
                if (!(bot_1.subscriberId.length === 0)) return [3 /*break*/, 11];
                _b.label = 8;
            case 8:
                _b.trys.push([8, 10, , 11]);
                return [4 /*yield*/, bot.api.sendMessage(process.env.CHAT_ID || "", "<b>EMA Signal for " + pairName + " - " + duration + "</b>\nType: " + signal.type + "\nTime: " + signal.time + "\nPrice: " + signal.price + "\nDetails: " + signal.details, { parse_mode: "HTML" })];
            case 9:
                _b.sent();
                return [3 /*break*/, 11];
            case 10:
                error_2 = _b.sent();
                console.error("Failed to send EMA signal to default chat:", error_2);
                return [3 /*break*/, 11];
            case 11:
                _i++;
                return [3 /*break*/, 1];
            case 12: return [2 /*return*/];
        }
    });
}); };
// ============================================================================
// SCHEDULER FUNCTIONS
// ============================================================================
/**
 * Process EMA analysis for all pairs at a given duration
 */
var processEMAAnalysis = function (bot, duration) { return __awaiter(_this, void 0, Promise, function () {
    var _i, fallbackKeyPairs_1, keyPair, signals, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, fallbackKeyPairs_1 = fallbackKeyPairs;
                _a.label = 1;
            case 1:
                if (!(_i < fallbackKeyPairs_1.length)) return [3 /*break*/, 11];
                keyPair = fallbackKeyPairs_1[_i];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 9, , 10]);
                signals = [];
                if (!(duration === "15m")) return [3 /*break*/, 4];
                return [4 /*yield*/, exports.getSmallSignal(keyPair, duration, 20, 50)];
            case 3:
                signals = _a.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, exports.generateSignal(keyPair, duration)];
            case 5:
                signals = _a.sent();
                _a.label = 6;
            case 6:
                if (!(signals.length > 0)) return [3 /*break*/, 8];
                return [4 /*yield*/, exports.renderSignal(keyPair, signals, bot, duration)];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                error_3 = _a.sent();
                logger_1.logger("Error processing EMA analysis for " + keyPair + " at " + duration + ": " + error_3, "red");
                return [3 /*break*/, 10];
            case 10:
                _i++;
                return [3 /*break*/, 1];
            case 11: return [2 /*return*/];
        }
    });
}); };
/**
 * Set up EMA analysis interval for a specific duration
 */
var setupEMAInterval = function (bot, duration, intervalMinutes) {
    var intervalMs = intervalMinutes * 60 * 1000;
    logger_1.logger(duration + " EMA analysis started every " + intervalMinutes + " minutes", "green");
    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, processEMAAnalysis(bot, duration)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, intervalMs);
};
/**
 * Main EMA cross scheduler function
 */
exports.emaCrossScheduler = function (bot) { return __awaiter(_this, void 0, Promise, function () {
    return __generator(this, function (_a) {
        logger_1.logger("EMA Cross Scheduler started", "green");
        // Set up intervals for all timeframes
        Object.entries(SCHEDULER_INTERVALS).forEach(function (_a) {
            var duration = _a[0], interval = _a[1];
            console.log(duration, interval);
            setupEMAInterval(bot, duration, interval);
        });
        logger_1.logger("All EMA analysis intervals configured", "green");
        return [2 /*return*/];
    });
}); };
