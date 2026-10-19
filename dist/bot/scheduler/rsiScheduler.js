"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rsiScheduler = void 0;
const schedule = __importStar(require("node-schedule"));
const config_1 = __importDefault(require("../../config"));
const scheduler_1 = require("../../constants/scheduler");
const logger_1 = require("../../logger");
const processRSISignal_1 = __importDefault(require("../../services/processRSISignal"));
const Duration_1 = require("../../types/Duration");
const delay_1 = require("../utils/delay");
/**
 * Set up RSI analysis interval for a specific duration
 */
const setupRSIInterval = (bot, duration, intervalMinutes) => {
    const intervalMs = intervalMinutes * 60 * 1000;
    (0, logger_1.logger)(`${duration} RSI analysis started every ${intervalMinutes} minutes`, "green");
    setInterval(async () => {
        await (0, processRSISignal_1.default)(bot, config_1.default.BINANCE_KEY_PAIRS, duration);
    }, intervalMs);
};
/**
 * Main RSI scheduler function
 */
const rsiScheduler = async (bot) => {
    (0, logger_1.logger)("RSI Scheduler crypto started", "green");
    // Set up intervals for all crypto timeframes
    for (const [duration, interval] of Object.entries(scheduler_1.CRYPTO_SCHEDULER_INTERVALS)) {
        setupRSIInterval(bot, duration, interval);
        await (0, delay_1.delay)(7000);
    }
    (0, logger_1.logger)("RSI Scheduler stock started", "green");
    // Stock scheduler during market hours
    scheduler_1.STOCK_MARKET_CRON_EXPRESSIONS.forEach((cronExpression) => {
        schedule.scheduleJob(cronExpression, () => {
            (0, processRSISignal_1.default)(bot, config_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneHour);
        });
    });
    (0, logger_1.logger)("RSI daily Scheduler stock started", "green");
    // Daily reports for stocks
    scheduler_1.STOCK_DAILY_CRON_EXPRESSIONS.forEach((cronExpression) => {
        schedule.scheduleJob(cronExpression, () => {
            (0, processRSISignal_1.default)(bot, config_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneDay);
        });
    });
    (0, logger_1.logger)("All RSI analysis intervals configured", "green");
};
exports.rsiScheduler = rsiScheduler;
exports.default = exports.rsiScheduler;
