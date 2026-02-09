import { config } from "dotenv";
import { instrumentMapping } from "../constants/symbols";

const env = config();
const RSI_OVERBOUGHT_THRESHOLD = 70;
const RSI_OVERSOLD_THRESHOLD = 30;
const RSI_EXTREME_OVERBOUGHT = 80;
const RSI_EXTREME_OVERSOLD = 20;

export default {
  ...env.parsed,
  UPSTOX_API_BASE: "https://api.upstox.com/v3",
  BINANCE_KEY_PAIRS: ["BTCUSDT", "SOLUSDT", "SUIUSDT", "PAXGUSDT","XAGUSDT", "XRPUSDT"],
  UPSTOX_KEY_PAIRS: Object.keys(instrumentMapping),
  DELAY_BETWEEN_PAIRS_MS: 1000,
  RSI_EXTREME_OVERBOUGHT,
  RSI_OVERBOUGHT_THRESHOLD,
  RSI_EXTREME_OVERSOLD,
  RSI_OVERSOLD_THRESHOLD,
};
