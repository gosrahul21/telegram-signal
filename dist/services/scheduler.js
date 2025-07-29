"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var symbols_1 = require("../constants/symbols");
var Duration_1 = require("../types/Duration");
var signals_1 = require("./signals");
var upstoxApi_1 = require("./upstoxApi");
var schedule = __importStar(require("node-schedule"));
require("dotenv/config");
var userService_1 = __importDefault(require("./userService"));
// Import additional dependencies
// For example: messaging service, database connection, EMA calculation functions, etc.
var PriceMapping = {};
var emaShortMapping = {};
var emaLongMapping = {};
// tested-ok
function iterateInstruments(interval, bot) {
    return __awaiter(this, void 0, void 0, function () {
        var toDate, fromDate, formattedToDate, formattedFromDate, _i, _a, _b, instrument, symbol, historicalCandles, intradayCandles, emaShort, emaLong, reversalDetected, dayReport;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    toDate = new Date();
                    fromDate = new Date(Date.now() - 360 * 24 * 60 * 60 * 1000);
                    if (interval === Duration_1.UpstoxInterval.OneDay) {
                        // For the daily interval, calculate fromDate as one year prior to the current date
                        fromDate.setFullYear(toDate.getFullYear() - 1);
                    }
                    else {
                        // For other intervals, calculate fromDate as 6 months prior to the current date
                        fromDate.setMonth(toDate.getMonth() - 6);
                    }
                    formattedToDate = formatDate(toDate);
                    formattedFromDate = formatDate(fromDate);
                    _i = 0, _a = Object.entries(symbols_1.instrumentMapping);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    _b = _a[_i], instrument = _b[0], symbol = _b[1];
                    console.log({
                        instrument: instrument,
                        symbol: symbol,
                        interval: interval
                    });
                    return [4 /*yield*/, upstoxApi_1.fetchCandleHistory(symbol, interval === Duration_1.UpstoxInterval.OneHour
                            ? Duration_1.UpstoxInterval.ThirtyMinutes
                            : interval, formattedToDate, formattedFromDate)];
                case 2:
                    historicalCandles = _c.sent();
                    return [4 /*yield*/, upstoxApi_1.getIntradayCandles(symbol)];
                case 3:
                    intradayCandles = _c.sent();
                    if (interval === Duration_1.UpstoxInterval.OneHour) {
                        historicalCandles = intradayCandles.concat(historicalCandles);
                    }
                    else if (interval === Duration_1.UpstoxInterval.OneDay) {
                        historicalCandles = [
                            upstoxApi_1.aggregateToDayCandle(intradayCandles)
                        ].concat(historicalCandles);
                    }
                    console.log(upstoxApi_1.aggregateToDayCandle(intradayCandles));
                    emaShort = signals_1.calculateEMA(historicalCandles, 9);
                    emaLong = signals_1.calculateEMA(historicalCandles, 21);
                    reversalDetected = detectReversal(historicalCandles, emaShort, emaLong);
                    if (interval === Duration_1.UpstoxInterval.OneDay) {
                        dayReport = __assign({ emaShort: emaShort[0], emaLong: emaLong[0] }, historicalCandles[0]);
                        if (reversalDetected) {
                            notifyUser(instrument, __assign({}, reversalDetected, dayReport), interval, bot);
                        }
                        else
                            notifyUser(instrument, __assign({}, dayReport), interval, bot);
                    }
                    else if (reversalDetected) {
                        notifyUser(instrument, reversalDetected, interval, bot);
                    }
                    return [4 /*yield*/, new Promise(function (resolve) {
                            return setTimeout(function () { return resolve("one sec delay"); }, 1000);
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Schedule tasks
function scheduleTasks(bot) {
    // Schedule task every hour from 9:15 AM to 3:30 PM, excluding weekends
    var cronExpressions = [
        "15 9 * * 1-5",
        "15 10 * * 1-5",
        "15 11 * * 1-5",
        "15 12 * * 1-5",
        "15 13 * * 1-5",
        "15 14 * * 1-5",
        "15 15 * * 1-5",
    ];
    // Schedule the task for each cron expression
    cronExpressions.forEach(function (cronExpression) {
        schedule.scheduleJob(cronExpression, function () {
            iterateInstruments(Duration_1.UpstoxInterval.OneHour, bot);
        });
    });
    // Schedule daily report at 3 PM
    schedule.scheduleJob("30 15 * * 1-5", function () {
        iterateInstruments(Duration_1.UpstoxInterval.OneDay, bot);
    });
}
exports.scheduleTasks = scheduleTasks;
// tested-ok
// Function to format date to "yyyy:mm:dd" format
var formatDate = function (date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
};
// Function to generate buy signals based on recent EMA values
function detectReversal(prices, emaShort, emaLong) {
    // Check for recent EMA crossovers
    var mostRecentIndex = 0; // Since the most recent values are first
    // Check for 9/21 EMA crossover
    if (emaShort[mostRecentIndex] > emaLong[mostRecentIndex] &&
        emaShort[mostRecentIndex + 1] <= emaLong[mostRecentIndex + 1]) {
        return {
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "9 EMA crossed above 21 EMA, buy/long signal"
        };
    }
    else if (emaShort[mostRecentIndex] < emaLong[mostRecentIndex] &&
        emaShort[mostRecentIndex + 1] >= emaLong[mostRecentIndex + 1]) {
        return {
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "21 EMA crossed above 9 EMA, sell/short signal"
        };
    }
}
exports.detectReversal = detectReversal;
// Function to notify users of a given signal
function notifyUser(symbol, signal, duration, bot) {
    return __awaiter(this, void 0, void 0, function () {
        var subscribedUsers, formattedSignal, _i, subscribedUsers_1, chatId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscribedUsers = userService_1["default"].getSubscribedUsers();
                    formattedSignal = formatSignal(signal);
                    _i = 0, subscribedUsers_1 = subscribedUsers;
                    _a.label = 1;
                case 1:
                    if (!(_i < subscribedUsers_1.length)) return [3 /*break*/, 4];
                    chatId = subscribedUsers_1[_i].chatId;
                    if (!signal) return [3 /*break*/, 3];
                    return [4 /*yield*/, bot.api.sendMessage(chatId, "<b>Signal for " + symbol + " - " + duration + "</b>\n" + formattedSignal, { parse_mode: "HTML" })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.notifyUser = notifyUser;
function formatSignal(signal) {
    // Initialize an array to hold formatted signal lines
    var formattedSignalLines = [];
    // Loop through each key-value pair in the signal object
    for (var _i = 0, _a = Object.entries(signal); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        // Format the key and value as a line of text
        var line = "<b>" + key + ":</b> " + value;
        // Add the formatted line to the array
        formattedSignalLines.push(line);
    }
    // Join the formatted lines with newlines and return the resulting string
    return formattedSignalLines.join("\n");
}
// iterateInstruments(UpstoxInterval.OneHour)
// with the data provided, detect the reversal
