"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rsiScheduler = exports.priceAwayFromAverage = void 0;
exports.calculateEMA = calculateEMA;
const priceApi_1 = require("../../services/priceApi");
const Duration_1 = require("../../types/Duration");
const index_1 = require("../../config/index");
const schedule = require("node-schedule");
const logger_1 = require("../../logger");
const delay_1 = require("../utils/delay");
const processRSISignal_1 = require("../../services/processRSISignal");
const ema = require('exponential-moving-average');
const fallbackKeyPairs = ['BTCUSDT', 'SOLUSDT', 'SUIUSDT'];
const SCHEDULER_INTERVALS = {
    '15m': 5,
    '1h': 15,
    '4h': 60,
    '1d': 720,
};
function calculateEMA(candlePrices, duration) {
    const arr = candlePrices.map((candle) => candle.close);
    arr.reverse();
    return ema(arr, duration).reverse();
}
const priceAwayFromAverage = async (keyName, pairName, duration) => {
    const prices = await (0, priceApi_1.fetchTickerPrice)(keyName);
    const price = prices.find((price) => price.market === keyName);
    const signals = [];
    return signals;
};
exports.priceAwayFromAverage = priceAwayFromAverage;
const setupRSIInterval = (bot, duration, intervalMinutes) => {
    const intervalMs = intervalMinutes * 60 * 1000;
    (0, logger_1.logger)(`${duration} RSI analysis started every ${intervalMinutes} minutes`, 'green');
    setInterval(async () => {
        await (0, processRSISignal_1.default)(bot, index_1.default.BINANCE_KEY_PAIRS, duration);
    }, intervalMs);
};
const rsiScheduler = async (bot) => {
    (0, logger_1.logger)('RSI Scheduler crypto started', 'green');
    for (let [duration, interval] of Object.entries(SCHEDULER_INTERVALS)) {
        setupRSIInterval(bot, duration, interval);
        await (0, delay_1.delay)(7000);
        console.log('setup of listner');
    }
    (0, logger_1.logger)('RSI Scheduler stock started', 'green');
    const cronExpressions = [
        '30 9 * * 1-5',
        '45 9 * * 1-5',
        '0 10 * * 1-5',
        '15 10 * * 1-5',
        '30 10 * * 1-5',
        '45 10 * * 1-5',
        '0 11 * * 1-5',
        '15 11 * * 1-5',
        '30 11 * * 1-5',
        '45 11 * * 1-5',
        '0 12 * * 1-5',
        '15 12 * * 1-5',
        '30 12 * * 1-5',
        '45 12 * * 1-5',
        '0 13 * * 1-5',
        '15 13 * * 1-5',
        '30 13 * * 1-5',
        '45 13 * * 1-5',
        '0 14 * * 1-5',
        '15 14 * * 1-5',
        '30 14 * * 1-5',
        '45 14 * * 1-5',
        '0 15 * * 1-5',
        '15 15 * * 1-5',
        '30 15 * * 1-5',
    ];
    cronExpressions.forEach((cronExpression) => {
        schedule.scheduleJob(cronExpression, () => {
            (0, processRSISignal_1.default)(bot, index_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneHour);
        });
    });
    (0, logger_1.logger)('RSI daily Scheduler stock started', 'green');
    schedule.scheduleJob('0 12 * * 1-5', () => {
        return (0, processRSISignal_1.default)(bot, index_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneDay);
    });
    schedule.scheduleJob('0 15 * * 1-5', () => {
        return (0, processRSISignal_1.default)(bot, index_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneDay);
    });
    (0, logger_1.logger)('All RSI analysis intervals configured', 'green');
};
exports.rsiScheduler = rsiScheduler;
//# sourceMappingURL=rsiScheduler.js.map