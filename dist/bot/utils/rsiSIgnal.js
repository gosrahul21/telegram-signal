"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rsiSignal = void 0;
const config_1 = __importDefault(require("../../config"));
const rsiSignal = (currentRSI, keyName, price, time) => {
    const signals = [];
    if (currentRSI >= config_1.default.RSI_EXTREME_OVERBOUGHT) {
        signals.push({
            type: `${keyName} RSI Extreme Overbought`,
            time: time,
            price: price,
            rsi: currentRSI,
            details: `RSI is extremely overbought at ${currentRSI.toFixed(2)}, strong sell signal`,
        });
    }
    else if (currentRSI >= config_1.default.RSI_OVERBOUGHT_THRESHOLD) {
        signals.push({
            type: `${keyName} RSI Overbought`,
            time: time,
            price: price,
            rsi: currentRSI,
            details: `RSI is overbought at ${currentRSI.toFixed(2)}, potential sell signal`,
        });
    }
    if (currentRSI <= config_1.default.RSI_EXTREME_OVERSOLD) {
        signals.push({
            type: `${keyName} RSI Extreme Oversold`,
            time: time,
            price: price,
            rsi: currentRSI,
            details: `RSI is extremely oversold at ${currentRSI.toFixed(2)}, strong buy signal`,
        });
    }
    else if (currentRSI <= config_1.default.RSI_OVERSOLD_THRESHOLD) {
        signals.push({
            type: `${keyName} RSI Oversold`,
            time: time,
            price: price,
            rsi: currentRSI,
            details: `RSI is oversold at ${currentRSI.toFixed(2)}, potential buy signal`,
        });
    }
    return signals;
};
exports.rsiSignal = rsiSignal;
exports.default = exports.rsiSignal;
