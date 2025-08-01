"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStatusByDuration = void 0;
const constants_1 = require("../../utils/constants");
const rsiScheduler_1 = require("../scheduler/rsiScheduler");
const renderRSISignal_1 = require("../utils/renderRSISignal");
const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "BNBUSDT", "ETHUSDT"];
const markets = ["BTCUSDT", "SOLUSDT", "BNBUSDT", "ETHUSDT"];
// Common function to handle status by duration
const handleStatusByDuration = async (ctx, duration, keyPairsMap = constants_1.keyPairsMapping) => {
    try {
        const keyName = ctx.match;
        const pairName = keyName;
        if (!pairName) {
            ctx.reply(`Please provide a valid pair name or you will get the status of the following pairs: ` +
                fallbackKeyPairs.join(", "));
            fallbackKeyPairs.forEach(async (fallbackPair) => {
                const signals = await (0, rsiScheduler_1.getRSIStatus)(fallbackPair, duration);
                (0, renderRSISignal_1.renderRSISignal)(fallbackPair, signals, ctx, duration);
            });
            return;
        }
        const signals = await (0, rsiScheduler_1.getRSIStatus)(keyName, duration);
        (0, renderRSISignal_1.renderRSISignal)(keyName, signals, ctx, duration);
    }
    catch (error) {
        ctx.reply(`Error getting status for ${ctx.match}:`, error);
    }
};
exports.handleStatusByDuration = handleStatusByDuration;
