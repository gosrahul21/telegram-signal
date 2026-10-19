"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEMAAnalysis = void 0;
const candleTracker_1 = __importDefault(require("../bot/utils/candleTracker"));
const delay_1 = require("../bot/utils/delay");
const emaSignal_1 = require("../bot/utils/emaSignal");
const renderEMASignal_1 = require("../bot/utils/renderEMASignal");
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../logger");
/**
 * Process EMA analysis across pairs for a given duration with candle deduplication
 */
const processEMAAnalysis = async (bot, duration) => {
    const pairs = config_1.default.BINANCE_KEY_PAIRS;
    for (const keyPair of pairs) {
        try {
            let signals = [];
            if (duration === "15m") {
                signals = await (0, emaSignal_1.getSmallEMASignal)(keyPair, duration, 20, 50);
            }
            else {
                signals = await (0, emaSignal_1.generateEMASignal)(keyPair, duration);
            }
            if (signals.length === 0)
                continue;
            // Candle deduplication: don't alert for the same candle twice across iterations
            const eligibleSignals = [];
            for (const signal of signals) {
                const trackerKey = candleTracker_1.default.getKey(keyPair, duration, signal.type);
                if (signal.candleId && candleTracker_1.default.isCandleAlerted(trackerKey, signal.candleId)) {
                    continue;
                }
                eligibleSignals.push(signal);
            }
            if (eligibleSignals.length > 0) {
                await (0, renderEMASignal_1.renderEMASignal)(keyPair, eligibleSignals, bot, duration);
                for (const signal of eligibleSignals) {
                    if (signal.candleId) {
                        const trackerKey = candleTracker_1.default.getKey(keyPair, duration, signal.type);
                        candleTracker_1.default.recordCandleAlert(trackerKey, signal.candleId);
                    }
                }
            }
        }
        catch (error) {
            (0, logger_1.logger)(`Error processing EMA analysis for ${keyPair} at ${duration}: ${error}`, "red");
        }
        finally {
            await (0, delay_1.delay)(config_1.default.DELAY_BETWEEN_PAIRS_MS);
        }
    }
};
exports.processEMAAnalysis = processEMAAnalysis;
exports.default = exports.processEMAAnalysis;
