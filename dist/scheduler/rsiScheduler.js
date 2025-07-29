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
var priceApi_1 = require("../services/priceApi");
var techincalIndicators_1 = require("../utils/helper/techincalIndicators");
var logger_1 = require("../logger");
var bot_1 = require("../services/bot");
var ema = require("exponential-moving-average");
// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
var fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "SUIUSDT"];
// RSI thresholds
var RSI_OVERBOUGHT_THRESHOLD = 70;
var RSI_OVERSOLD_THRESHOLD = 30;
var RSI_EXTREME_OVERBOUGHT = 80;
var RSI_EXTREME_OVERSOLD = 20;
// Scheduler intervals (in minutes)
var SCHEDULER_INTERVALS = {
    "15m": 5,
    "1h": 15,
    "4h": 60,
    "1d": 720
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
// RSI ANALYSIS FUNCTIONS
// ============================================================================
/**
 * Get RSI values for a given pair and duration
 */
exports.getRSIValues = function (keyname, duration) { return __awaiter(_this, void 0, Promise, function () {
    var candles;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, priceApi_1.fetchCandleData(keyname, duration)];
            case 1:
                candles = _a.sent();
                return [2 /*return*/, techincalIndicators_1.calculateRSI(candles.map(function (candle) { return candle.close; }), 14)];
        }
    });
}); };
/**
 * Get current RSI value for a given pair and duration
 */
exports.getCurrentRSI = function (keyname, duration) { return __awaiter(_this, void 0, Promise, function () {
    var rsiValues;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getRSIValues(keyname, duration)];
            case 1:
                rsiValues = _a.sent();
                return [2 /*return*/, rsiValues[rsiValues.length - 1]];
        }
    });
}); };
/**
 * Check RSI overbought conditions
 */
exports.checkRSIOverbought = function (keyName, pairName, duration) { return __awaiter(_this, void 0, Promise, function () {
    var candles, rsiValues, currentRSI, mostRecentIndex, signals;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, priceApi_1.fetchCandleData(keyName, duration)];
            case 1:
                candles = _a.sent();
                rsiValues = techincalIndicators_1.calculateRSI(candles.map(function (candle) { return candle.close; }), 14);
                currentRSI = rsiValues[rsiValues.length - 1];
                mostRecentIndex = 0;
                signals = [];
                if (currentRSI >= RSI_EXTREME_OVERBOUGHT) {
                    signals.push({
                        type: keyName + " RSI Extreme Overbought",
                        time: candles[mostRecentIndex].time,
                        price: candles[mostRecentIndex].close,
                        rsi: currentRSI,
                        details: "RSI is extremely overbought at " + currentRSI.toFixed(2) + ", strong sell signal"
                    });
                }
                else if (currentRSI >= RSI_OVERBOUGHT_THRESHOLD) {
                    signals.push({
                        type: keyName + " RSI Overbought",
                        time: candles[mostRecentIndex].time,
                        price: candles[mostRecentIndex].close,
                        rsi: currentRSI,
                        details: "RSI is overbought at " + currentRSI.toFixed(2) + ", potential sell signal"
                    });
                }
                return [2 /*return*/, signals];
        }
    });
}); };
/**
 * Check RSI oversold conditions
 */
exports.checkRSIOversold = function (keyName, pairName, duration) { return __awaiter(_this, void 0, Promise, function () {
    var candles, rsiValues, currentRSI, mostRecentIndex, signals;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, priceApi_1.fetchCandleData(keyName, duration)];
            case 1:
                candles = _a.sent();
                rsiValues = techincalIndicators_1.calculateRSI(candles.map(function (candle) { return candle.close; }), 14);
                currentRSI = rsiValues[rsiValues.length - 1];
                mostRecentIndex = 0;
                signals = [];
                if (currentRSI <= RSI_EXTREME_OVERSOLD) {
                    signals.push({
                        type: keyName + " RSI Extreme Oversold",
                        time: candles[mostRecentIndex].time,
                        price: candles[mostRecentIndex].close,
                        rsi: currentRSI,
                        details: "RSI is extremely oversold at " + currentRSI.toFixed(2) + ", strong buy signal"
                    });
                }
                else if (currentRSI <= RSI_OVERSOLD_THRESHOLD) {
                    signals.push({
                        type: keyName + " RSI Oversold",
                        time: candles[mostRecentIndex].time,
                        price: candles[mostRecentIndex].close,
                        rsi: currentRSI,
                        details: "RSI is oversold at " + currentRSI.toFixed(2) + ", potential buy signal"
                    });
                }
                return [2 /*return*/, signals];
        }
    });
}); };
/**
 * Get RSI status for a specific pair and duration
 */
exports.getRSIStatus = function (keyName, duration) { return __awaiter(_this, void 0, Promise, function () {
    var currentRSI;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getCurrentRSI(keyName, duration)];
            case 1:
                currentRSI = _a.sent();
                if (currentRSI >= RSI_EXTREME_OVERBOUGHT) {
                    return [2 /*return*/, {
                            status: "Extreme Overbought",
                            rsi: currentRSI,
                            signal: "Strong Sell",
                            details: "RSI is extremely overbought at " + currentRSI.toFixed(2)
                        }];
                }
                else if (currentRSI >= RSI_OVERBOUGHT_THRESHOLD) {
                    return [2 /*return*/, {
                            status: "Overbought",
                            rsi: currentRSI,
                            signal: "Sell",
                            details: "RSI is overbought at " + currentRSI.toFixed(2)
                        }];
                }
                else if (currentRSI <= RSI_EXTREME_OVERSOLD) {
                    return [2 /*return*/, {
                            status: "Extreme Oversold",
                            rsi: currentRSI,
                            signal: "Strong Buy",
                            details: "RSI is extremely oversold at " + currentRSI.toFixed(2)
                        }];
                }
                else if (currentRSI <= RSI_OVERSOLD_THRESHOLD) {
                    return [2 /*return*/, {
                            status: "Oversold",
                            rsi: currentRSI,
                            signal: "Buy",
                            details: "RSI is oversold at " + currentRSI.toFixed(2)
                        }];
                }
                else {
                    return [2 /*return*/, {
                            status: "Neutral",
                            rsi: currentRSI,
                            signal: "Hold",
                            details: "RSI is neutral at " + currentRSI.toFixed(2)
                        }];
                }
                return [2 /*return*/];
        }
    });
}); };
// ============================================================================
// PRICE ANALYSIS FUNCTIONS
// ============================================================================
/**
 * Check if price is away from EMA (overbought zone)
 */
exports.priceAwayFromAverage = function (keyName, pairName, duration) { return __awaiter(_this, void 0, Promise, function () {
    var prices, price, signals;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, priceApi_1.fetchTickerPrice(keyName)];
            case 1:
                prices = _a.sent();
                price = prices.find(function (price) { return price.market === keyName; });
                signals = [];
                // Note: This function needs EMA data to work properly
                // For now, we'll return empty array as EMA mapping is not implemented
                // TODO: Implement proper EMA mapping and calculation
                return [2 /*return*/, signals];
        }
    });
}); };
// ============================================================================
// SIGNAL RENDERING
// ============================================================================
/**
 * Render RSI signals to Telegram
 */
exports.renderRSISignal = function (pairName, signals, bot, duration) { return __awaiter(_this, void 0, Promise, function () {
    var signalArray, _i, signalArray_1, signal, rsiInfo, _a, subscriberId_1, chatId, error_1, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                signalArray = Array.isArray(signals) ? signals : [signals];
                _i = 0, signalArray_1 = signalArray;
                _b.label = 1;
            case 1:
                if (!(_i < signalArray_1.length)) return [3 /*break*/, 12];
                signal = signalArray_1[_i];
                rsiInfo = signal.rsi ? "\nRSI: " + signal.rsi.toFixed(2) : "";
                _a = 0, subscriberId_1 = bot_1.subscriberId;
                _b.label = 2;
            case 2:
                if (!(_a < subscriberId_1.length)) return [3 /*break*/, 7];
                chatId = subscriberId_1[_a];
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                return [4 /*yield*/, bot.api.sendMessage(chatId, "<b>RSI Signal for " + pairName + " - " + duration + "</b>\nType: " + signal.type + "\nTime: " + signal.time + "\nPrice: " + signal.price + rsiInfo + "\nDetails: " + signal.details, { parse_mode: "HTML" })];
            case 4:
                _b.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error("Failed to send RSI signal to " + chatId + ":", error_1);
                return [3 /*break*/, 6];
            case 6:
                _a++;
                return [3 /*break*/, 2];
            case 7:
                if (!(bot_1.subscriberId.length === 0)) return [3 /*break*/, 11];
                _b.label = 8;
            case 8:
                _b.trys.push([8, 10, , 11]);
                return [4 /*yield*/, bot.api.sendMessage(process.env.CHAT_ID || "", "<b>RSI Signal for " + pairName + " - " + duration + "</b>\nType: " + signal.type + "\nTime: " + signal.time + "\nPrice: " + signal.price + rsiInfo + "\nDetails: " + signal.details, { parse_mode: "HTML" })];
            case 9:
                _b.sent();
                return [3 /*break*/, 11];
            case 10:
                error_2 = _b.sent();
                console.error("Failed to send RSI signal to default chat:", error_2);
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
 * Process RSI analysis for all pairs at a given duration
 */
var processRSIAnalysis = function (bot, duration) { return __awaiter(_this, void 0, Promise, function () {
    var _i, fallbackKeyPairs_1, keyPair, overboughtSignals, oversoldSignals, error_3;
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
                return [4 /*yield*/, exports.checkRSIOverbought(keyPair, keyPair, duration)];
            case 3:
                overboughtSignals = _a.sent();
                if (!(overboughtSignals.length > 0)) return [3 /*break*/, 5];
                return [4 /*yield*/, exports.renderRSISignal(keyPair, overboughtSignals, bot, duration)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [4 /*yield*/, exports.checkRSIOversold(keyPair, keyPair, duration)];
            case 6:
                oversoldSignals = _a.sent();
                if (!(oversoldSignals.length > 0)) return [3 /*break*/, 8];
                return [4 /*yield*/, exports.renderRSISignal(keyPair, oversoldSignals, bot, duration)];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                error_3 = _a.sent();
                logger_1.logger("Error processing RSI analysis for " + keyPair + " at " + duration + ": " + error_3, "red");
                return [3 /*break*/, 10];
            case 10:
                _i++;
                return [3 /*break*/, 1];
            case 11: return [2 /*return*/];
        }
    });
}); };
/**
 * Set up RSI analysis interval for a specific duration
 */
var setupRSIInterval = function (bot, duration, intervalMinutes) {
    var intervalMs = intervalMinutes * 60 * 1000;
    logger_1.logger(duration + " RSI analysis started every " + intervalMinutes + " minutes", "green");
    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, processRSIAnalysis(bot, duration)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, intervalMs);
};
/**
 * Main RSI scheduler function
 */
exports.rsiScheduler = function (bot) { return __awaiter(_this, void 0, Promise, function () {
    return __generator(this, function (_a) {
        logger_1.logger("RSI Scheduler started", "green");
        // Set up intervals for all timeframes
        Object.entries(SCHEDULER_INTERVALS).forEach(function (_a) {
            var duration = _a[0], interval = _a[1];
            setupRSIInterval(bot, duration, interval);
        });
        logger_1.logger("All RSI analysis intervals configured", "green");
        return [2 /*return*/];
    });
}); };
