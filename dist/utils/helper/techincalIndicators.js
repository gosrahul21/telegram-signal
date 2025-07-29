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
var priceApi_1 = require("../../services/priceApi");
var ti = require("technicalindicators");
// Calculate EMA
function calculateEMA(prices, period) {
    return ti.EMA.calculate({ period: period, values: prices });
}
exports.calculateEMA = calculateEMA;
// Calculate RSI (Relative Strength Index)
function calculateRSI(prices, period) {
    if (period === void 0) { period = 14; }
    return ti.RSI.calculate({ period: period, values: prices });
}
exports.calculateRSI = calculateRSI;
// Calculate MACD (12, 26, 9)
function calculateMACD(prices) {
    return ti.MACD.calculate({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    });
}
exports.calculateMACD = calculateMACD;
exports.getIndicatorOnTimeFrame = function (symbol, timeframe) { return __awaiter(_this, void 0, void 0, function () {
    var candleData, prices, macdResult, ema9Series, ema20Series, rsiSeries, indicatorDetails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, priceApi_1.fetchCandleData(symbol, timeframe)];
            case 1:
                candleData = _a.sent();
                prices = candleData.map(function (_a) {
                    var close = _a.close;
                    return close;
                });
                macdResult = calculateMACD(prices).slice(-7);
                ema9Series = calculateEMA(prices, 9).slice(-7);
                ema20Series = calculateEMA(prices, 20).slice(-7);
                rsiSeries = calculateRSI(prices, 14).slice(-7);
                indicatorDetails = [
                    "Technical indicators for " + timeframe + " " + symbol,
                    "Current Price: " + candleData[candleData.length - 1].close,
                    "MACD (12,26,9): " + JSON.stringify(macdResult),
                    "EMA (9-day): " + JSON.stringify(ema9Series),
                    "EMA (20-day): " + JSON.stringify(ema20Series),
                    "RSI (14-day): " + JSON.stringify(rsiSeries),
                ].join("\n");
                return [2 /*return*/, indicatorDetails];
        }
    });
}); };
