"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRSIAnalysis = void 0;
const delay_1 = require("../bot/utils/delay");
const generateRSIOverBoughtSignal_1 = require("../bot/utils/generateRSIOverBoughtSignal");
const renderRSISignal_1 = require("../bot/utils/renderRSISignal");
const config_1 = require("../config");
const logger_1 = require("../logger");
const getStockHistoricalCandles_1 = require("./getStockHistoricalCandles");
const priceApi_1 = require("./priceApi");
const processRSIAnalysis = async (bot, fallbackKeyPairs, duration, neutral = false) => {
    for (const keyPair of fallbackKeyPairs) {
        try {
            const candles = config_1.default.UPSTOX_KEY_PAIRS.includes(keyPair)
                ? await (0, getStockHistoricalCandles_1.default)(keyPair, duration)
                : await (0, priceApi_1.fetchCandleData)(keyPair, duration);
            const signals = await (0, generateRSIOverBoughtSignal_1.default)(keyPair, candles, neutral);
            await (0, renderRSISignal_1.renderRSISignal)(keyPair, signals, bot, duration);
        }
        catch (error) {
            (0, logger_1.logger)(`Error processing RSI analysis for ${keyPair} at ${duration}: ${error}`, 'red');
        }
        finally {
            await (0, delay_1.delay)(config_1.default.DELAY_BETWEEN_PAIRS_MS);
        }
    }
};
exports.processRSIAnalysis = processRSIAnalysis;
exports.default = exports.processRSIAnalysis;
//# sourceMappingURL=processRSISignal.js.map