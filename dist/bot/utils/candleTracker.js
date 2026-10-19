"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.candleTracker = void 0;
/**
 * In-memory tracker to prevent duplicate Telegram alerts for the same candle across scheduler iterations.
 */
class CandleTracker {
    constructor() {
        // Map of cacheKey (`${pairName}:${duration}:${signalType}`) -> candleId (timestamp or ISO string)
        this.alertedCandles = new Map();
    }
    /**
     * Generates a cache key for tracking.
     */
    getKey(pairName, duration, signalType) {
        return `${pairName}:${duration}:${signalType}`;
    }
    /**
     * Extracts a unique candle ID (timestamp or string) from candle data.
     */
    getCandleId(candle) {
        if (!candle)
            return "";
        return candle.closeTime ?? candle.openTime ?? candle.time ?? "";
    }
    /**
     * Checks if an alert has already been sent for the given candle and signal.
     */
    isCandleAlerted(key, candleId) {
        if (!candleId)
            return false;
        const lastAlertedId = this.alertedCandles.get(key);
        return lastAlertedId !== undefined && String(lastAlertedId) === String(candleId);
    }
    /**
     * Records that an alert was sent for this candle.
     */
    recordCandleAlert(key, candleId) {
        if (candleId) {
            this.alertedCandles.set(key, candleId);
        }
    }
    /**
     * Clears the alert record for a key or all keys.
     */
    clear(key) {
        if (key) {
            this.alertedCandles.delete(key);
        }
        else {
            this.alertedCandles.clear();
        }
    }
}
exports.candleTracker = new CandleTracker();
exports.default = exports.candleTracker;
