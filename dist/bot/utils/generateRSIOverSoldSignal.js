"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const techincalIndicators_1 = require("../../utils/helper/techincalIndicators");
const rsiSIgnal_1 = __importDefault(require("./rsiSIgnal"));
/**
 * Check RSI oversold conditions
 */
const generateRSIOversoldSignal = async (keyName, candles) => {
    // const candles: any = await fetchCandleData(keyName, duration);
    const rsiValues = (0, techincalIndicators_1.calculateRSI)(candles.map((candle) => candle.close), 14);
    const currentRSI = rsiValues[rsiValues.length - 1];
    const mostRecentIndex = candles.length - 1;
    const signals = (0, rsiSIgnal_1.default)(currentRSI, keyName, candles[mostRecentIndex].close, candles[mostRecentIndex].closeTime);
    return signals;
};
exports.default = generateRSIOversoldSignal;
