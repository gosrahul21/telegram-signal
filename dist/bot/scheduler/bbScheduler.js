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
exports.bbScheduler = void 0;
const schedule = __importStar(require("node-schedule"));
const config_1 = __importDefault(require("../../config"));
const scheduler_1 = require("../../constants/scheduler");
const logger_1 = require("../../logger");
const processBBSignal_1 = require("../../services/processBBSignal");
const Duration_1 = require("../../types/Duration");
const delay_1 = require("../utils/delay");
/**
 * Set up Bollinger Bands analysis interval for a specific duration
 */
const setupBBInterval = (bot, duration, intervalMinutes) => {
    const intervalMs = intervalMinutes * 60 * 1000;
    (0, logger_1.logger)(`${duration} Bollinger Bands analysis started every ${intervalMinutes} minutes`, "green");
    setInterval(async () => {
        await (0, processBBSignal_1.processBBAnalysis)(bot, config_1.default.BINANCE_KEY_PAIRS, duration);
    }, intervalMs);
};
/**
 * Main Bollinger Bands scheduler function
 */
const bbScheduler = async (bot) => {
    (0, logger_1.logger)("Bollinger Bands Scheduler crypto started", "green");
    // Set up intervals for all crypto timeframes
    for (const [duration, interval] of Object.entries(scheduler_1.CRYPTO_SCHEDULER_INTERVALS)) {
        setupBBInterval(bot, duration, interval);
        await (0, delay_1.delay)(7000);
    }
    if (config_1.default.ENABLE_UPSTOX) {
        (0, logger_1.logger)("Bollinger Bands Scheduler stock started", "green");
        // Stock scheduler during market hours
        scheduler_1.STOCK_MARKET_CRON_EXPRESSIONS.forEach((cronExpression) => {
            schedule.scheduleJob(cronExpression, () => {
                (0, processBBSignal_1.processBBAnalysis)(bot, config_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneHour);
            });
        });
        (0, logger_1.logger)("Bollinger Bands daily Scheduler stock started", "green");
        // Daily reports for stocks
        scheduler_1.STOCK_DAILY_CRON_EXPRESSIONS.forEach((cronExpression) => {
            schedule.scheduleJob(cronExpression, () => {
                (0, processBBSignal_1.processBBAnalysis)(bot, config_1.default.UPSTOX_KEY_PAIRS, Duration_1.UpstoxInterval.OneDay);
            });
        });
    }
    else {
        (0, logger_1.logger)("Upstox stock Bollinger Bands scheduler is disabled", "yellow");
    }
    (0, logger_1.logger)("All Bollinger Bands analysis intervals configured", "green");
};
exports.bbScheduler = bbScheduler;
exports.default = exports.bbScheduler;
