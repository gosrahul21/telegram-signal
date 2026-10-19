"use strict";
/**
 * Shared intervals and cron schedules for crypto and stock schedulers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STOCK_DAILY_CRON_EXPRESSIONS = exports.STOCK_MARKET_CRON_EXPRESSIONS = exports.EMA_SCHEDULER_INTERVALS = exports.CRYPTO_SCHEDULER_INTERVALS = void 0;
// Crypto analysis intervals (in minutes)
exports.CRYPTO_SCHEDULER_INTERVALS = {
    "15m": 5, // 15-minute analysis run every 5 minutes
    "1h": 15, // 1-hour analysis run every 15 minutes
    "4h": 60, // 4-hour analysis run every 60 minutes
    "1d": 720, // Daily analysis run every 12 hours
};
// EMA-specific intervals (in minutes)
exports.EMA_SCHEDULER_INTERVALS = {
    "15m": 15,
    "1h": 60,
    "4h": 240,
    "1d": 1440,
};
// Stock market 15-minute interval cron expressions (9:30 AM to 3:30 PM, Monday-Friday)
exports.STOCK_MARKET_CRON_EXPRESSIONS = [
    "30 9 * * 1-5", // 9:30 AM
    "45 9 * * 1-5", // 9:45 AM
    "0 10 * * 1-5", // 10:00 AM
    "15 10 * * 1-5", // 10:15 AM
    "30 10 * * 1-5", // 10:30 AM
    "45 10 * * 1-5", // 10:45 AM
    "0 11 * * 1-5", // 11:00 AM
    "15 11 * * 1-5", // 11:15 AM
    "30 11 * * 1-5", // 11:30 AM
    "45 11 * * 1-5", // 11:45 AM
    "0 12 * * 1-5", // 12:00 PM
    "15 12 * * 1-5", // 12:15 PM
    "30 12 * * 1-5", // 12:30 PM
    "45 12 * * 1-5", // 12:45 PM
    "0 13 * * 1-5", // 1:00 PM
    "15 13 * * 1-5", // 1:15 PM
    "30 13 * * 1-5", // 1:30 PM
    "45 13 * * 1-5", // 1:45 PM
    "0 14 * * 1-5", // 2:00 PM
    "15 14 * * 1-5", // 2:15 PM
    "30 14 * * 1-5", // 2:30 PM
    "45 14 * * 1-5", // 2:45 PM
    "0 15 * * 1-5", // 3:00 PM
    "15 15 * * 1-5", // 3:15 PM
    "30 15 * * 1-5", // 3:30 PM
];
// Daily stock report schedules (12 PM and 3 PM)
exports.STOCK_DAILY_CRON_EXPRESSIONS = [
    "0 12 * * 1-5",
    "0 15 * * 1-5",
];
