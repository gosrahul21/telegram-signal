"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const symbols_1 = require("../constants/symbols");
const env = (0, dotenv_1.config)();
const RSI_OVERBOUGHT_THRESHOLD = 70;
const RSI_OVERSOLD_THRESHOLD = 30;
const RSI_EXTREME_OVERBOUGHT = 80;
const RSI_EXTREME_OVERSOLD = 20;
exports.default = {
    ...env.parsed,
    UPSTOX_API_BASE: "https://api.upstox.com/v3",
    BINANCE_KEY_PAIRS: ["BTCUSDT", "SOLUSDT", "SUIUSDT"],
    UPSTOX_KEY_PAIRS: Object.keys(symbols_1.instrumentMapping),
    DELAY_BETWEEN_PAIRS_MS: 1000,
    RSI_EXTREME_OVERBOUGHT,
    RSI_OVERBOUGHT_THRESHOLD,
    RSI_EXTREME_OVERSOLD,
    RSI_OVERSOLD_THRESHOLD,
};
//# sourceMappingURL=index.js.map