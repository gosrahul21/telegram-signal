"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRSIAnalysis = void 0;
const candleTracker_1 = __importDefault(require("../bot/utils/candleTracker"));
const delay_1 = require("../bot/utils/delay");
const generateRSIOverBoughtSignal_1 = __importDefault(require("../bot/utils/generateRSIOverBoughtSignal"));
const renderRSISignal_1 = require("../bot/utils/renderRSISignal");
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../logger");
const getStockHistoricalCandles_1 = __importDefault(require("./getStockHistoricalCandles"));
const priceApi_1 = require("./priceApi");
/**
 * Process RSI analysis for all pairs at a given duration with candle deduplication
 */
const processRSIAnalysis = async (bot, fallbackKeyPairs, duration, neutral = false) => {
    for (const keyPair of fallbackKeyPairs) {
        try {
            const candles = config_1.default.UPSTOX_KEY_PAIRS.includes(keyPair)
                ? await (0, getStockHistoricalCandles_1.default)(keyPair, duration)
                : await (0, priceApi_1.fetchCandleData)(keyPair, duration);
            if (!candles || candles.length === 0)
                continue;
            const signals = await (0, generateRSIOverBoughtSignal_1.default)(keyPair, candles, neutral);
            // Deduplicate: don't alert for the same candle twice across scheduler iterations
            const eligibleSignals = [];
            const currentCandle = candles[candles.length - 1];
            const candleId = candleTracker_1.default.getCandleId(currentCandle);
            for (const signal of signals) {
                // Skip neutral from spamming if already notified
                const trackerKey = candleTracker_1.default.getKey(keyPair, duration, signal.type);
                if (candleTracker_1.default.isCandleAlerted(trackerKey, candleId)) {
                    continue;
                }
                signal.candleId = candleId;
                eligibleSignals.push(signal);
            }
            if (eligibleSignals.length > 0) {
                await (0, renderRSISignal_1.renderRSISignal)(keyPair, eligibleSignals, bot, duration);
                for (const signal of eligibleSignals) {
                    const trackerKey = candleTracker_1.default.getKey(keyPair, duration, signal.type);
                    candleTracker_1.default.recordCandleAlert(trackerKey, candleId);
                }
            }
        }
        catch (error) {
            (0, logger_1.logger)(`Error processing RSI analysis for ${keyPair} at ${duration}: ${error}`, "red");
        }
        finally {
            await (0, delay_1.delay)(config_1.default.DELAY_BETWEEN_PAIRS_MS);
        }
    }
};
exports.processRSIAnalysis = processRSIAnalysis;
exports.default = exports.processRSIAnalysis;
