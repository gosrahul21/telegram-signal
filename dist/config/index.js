"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const symbols_1 = require("../constants/symbols");
const env = (0, dotenv_1.config)();
const RSI_OVERBOUGHT_THRESHOLD = 70;
const RSI_OVERSOLD_THRESHOLD = 30;
const RSI_EXTREME_OVERBOUGHT = 80;
const RSI_EXTREME_OVERSOLD = 20;
const BB_PERIOD = 20;
const BB_STD_DEV = 2;
const ENABLE_UPSTOX = process.env.ENABLE_UPSTOX === "true";
const appConfig = {
    ...env.parsed,
    ENABLE_UPSTOX,
    UPSTOX_API_BASE: "https://api.upstox.com/v3",
    BINANCE_KEY_PAIRS: [
        "BTCUSDT",
        "SOLUSDT",
        "SUIUSDT",
        "PAXGUSDT",
        "XAGUSDT",
        "XRPUSDT"
    ],
    UPSTOX_KEY_PAIRS: ENABLE_UPSTOX ? Object.keys(symbols_1.instrumentMapping) : [],
    DELAY_BETWEEN_PAIRS_MS: process.env.DELAY_BETWEEN_PAIRS_MS
        ? parseInt(process.env.DELAY_BETWEEN_PAIRS_MS, 10)
        : 5000,
    RSI_EXTREME_OVERBOUGHT,
    RSI_OVERBOUGHT_THRESHOLD,
    RSI_EXTREME_OVERSOLD,
    RSI_OVERSOLD_THRESHOLD,
    BB_PERIOD,
    BB_STD_DEV,
};
exports.default = appConfig;
