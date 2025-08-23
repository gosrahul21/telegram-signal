"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRSISignal = void 0;
const techincalIndicators_1 = require("../../utils/helper/techincalIndicators");
const rsiSIgnal_1 = require("./rsiSIgnal");
const generateRSISignal = async (keyName, candles, neutral = false) => {
    const rsiValues = (0, techincalIndicators_1.calculateRSI)(candles.map((candle) => candle.close), 14);
    const currentRSI = rsiValues[rsiValues.length - 1];
    const mostRecentIndex = candles.length - 1;
    const signals = (0, rsiSIgnal_1.default)(currentRSI, keyName, candles[mostRecentIndex].close, candles[mostRecentIndex].closeTime, neutral);
    return signals;
};
exports.generateRSISignal = generateRSISignal;
exports.default = exports.generateRSISignal;
//# sourceMappingURL=generateRSIOverBoughtSignal.js.map