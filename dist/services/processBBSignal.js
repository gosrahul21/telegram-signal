"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBBAnalysis = void 0;
const candleTracker_1 = __importDefault(require("../bot/utils/candleTracker"));
const delay_1 = require("../bot/utils/delay");
const bollingerBandsSignal_1 = require("../bot/utils/bollingerBandsSignal");
const renderBBSignal_1 = require("../bot/utils/renderBBSignal");
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../logger");
const getStockHistoricalCandles_1 = __importDefault(require("./getStockHistoricalCandles"));
const priceApi_1 = require("./priceApi");
/**
 * Process Bollinger Bands analysis for all pairs at a given duration.
 * Deduplicates alerts so that if a price hits BB band once in an iteration,
 * no telegram message is sent for the same candle on subsequent iterations.
 */
const processBBAnalysis = async (bot, pairs, duration) => {
    for (const keyPair of pairs) {
        try {
            const isUpstox = config_1.default.ENABLE_UPSTOX && config_1.default.UPSTOX_KEY_PAIRS.includes(keyPair);
            const candles = isUpstox
                ? await (0, getStockHistoricalCandles_1.default)(keyPair, duration)
                : await (0, priceApi_1.fetchCandleData)(keyPair, duration);
            if (!candles || candles.length === 0) {
                continue;
            }
            const signals = (0, bollingerBandsSignal_1.generateBBSignal)(keyPair, candles);
            // Filter signals using candleTracker to ensure:
            // "if price hit bb band once in an iteration, don't send telegram message for same candle on next iteration"
            const eligibleSignals = [];
            for (const signal of signals) {
                const trackerKey = candleTracker_1.default.getKey(keyPair, duration, signal.type);
                if (candleTracker_1.default.isCandleAlerted(trackerKey, signal.candleId)) {
                    (0, logger_1.logger)(`[BB Deduplication] Skipping ${signal.type} for ${keyPair} (${duration}) - Candle ${signal.candleId} already alerted.`, "yellow");
                    continue;
                }
                eligibleSignals.push(signal);
            }
            if (eligibleSignals.length > 0) {
                await (0, renderBBSignal_1.renderBBSignal)(keyPair, eligibleSignals, bot, duration);
                // Record candle as alerted so next iterations on the same candle will NOT alert again
                for (const signal of eligibleSignals) {
                    const trackerKey = candleTracker_1.default.getKey(keyPair, duration, signal.type);
                    candleTracker_1.default.recordCandleAlert(trackerKey, signal.candleId);
                }
            }
        }
        catch (error) {
            (0, logger_1.logger)(`Error processing Bollinger Bands analysis for ${keyPair} at ${duration}: ${error}`, "red");
        }
        finally {
            await (0, delay_1.delay)(config_1.default.DELAY_BETWEEN_PAIRS_MS);
        }
    }
};
exports.processBBAnalysis = processBBAnalysis;
exports.default = exports.processBBAnalysis;
