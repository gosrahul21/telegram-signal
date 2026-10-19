"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emaCrossScheduler = exports.renderSignal = exports.getSmallSignal = exports.generateSignal = exports.generateCrossSignals = void 0;
const scheduler_1 = require("../../constants/scheduler");
const logger_1 = require("../../logger");
const processEMASignal_1 = require("../../services/processEMASignal");
// Re-export functions for backwards-compatibility
var emaSignal_1 = require("../utils/emaSignal");
Object.defineProperty(exports, "generateCrossSignals", { enumerable: true, get: function () { return emaSignal_1.generateCrossSignals; } });
Object.defineProperty(exports, "generateSignal", { enumerable: true, get: function () { return emaSignal_1.generateEMASignal; } });
Object.defineProperty(exports, "getSmallSignal", { enumerable: true, get: function () { return emaSignal_1.getSmallEMASignal; } });
var renderEMASignal_1 = require("../utils/renderEMASignal");
Object.defineProperty(exports, "renderSignal", { enumerable: true, get: function () { return renderEMASignal_1.renderEMASignal; } });
/**
 * Set up EMA analysis interval for a specific duration
 */
const setupEMAInterval = (bot, duration, intervalMinutes) => {
    const intervalMs = intervalMinutes * 60 * 1000;
    (0, logger_1.logger)(`${duration} EMA analysis started every ${intervalMinutes} minutes`, "green");
    setInterval(async () => {
        await (0, processEMASignal_1.processEMAAnalysis)(bot, duration);
    }, intervalMs);
};
/**
 * Main EMA cross scheduler function
 */
const emaCrossScheduler = async (bot) => {
    (0, logger_1.logger)("EMA Cross Scheduler started", "green");
    // Set up intervals for all configured timeframes
    Object.entries(scheduler_1.EMA_SCHEDULER_INTERVALS).forEach(([duration, interval]) => {
        setupEMAInterval(bot, duration, interval);
    });
    (0, logger_1.logger)("All EMA analysis intervals configured", "green");
};
exports.emaCrossScheduler = emaCrossScheduler;
exports.default = exports.emaCrossScheduler;
