import { fetchCandleData } from "./priceApi";

const ti = require("technicalindicators");

// Calculate EMA
function calculateEMA(prices: number[], period: number) {
  return ti.EMA.calculate({ period, values: prices });
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices: number[], period = 14) {
  return ti.RSI.calculate({ period, values: prices });
}

// Calculate MACD (12, 26, 9)
function calculateMACD(prices: number[]) {
  return ti.MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
}

export const getIndicatorOnTimeFrame = async (
  symbol: string,
  timeframe: string
) => {
  const candleData: {
    close: number;
    open: number;
    high: number;
    volume: number;
  }[] = await fetchCandleData(symbol, timeframe);

  const prices = candleData.map(({ close }) => close);

  // Get last 7 values from each indicator
  const macdResult = calculateMACD(prices).slice(-7);
  const ema9Series = calculateEMA(prices, 9).slice(-7);
  const ema20Series = calculateEMA(prices, 20).slice(-7);
  const rsiSeries = calculateRSI(prices, 14).slice(-7);

  let indicatorDetails = [
    `Technical indicators for ${timeframe} ${symbol}`,
    `Current Price: ${candleData[candleData.length - 1].close}`,
    "MACD (12,26,9): " + JSON.stringify(macdResult),
    "EMA (9-day): " + JSON.stringify(ema9Series),
    "EMA (20-day): " + JSON.stringify(ema20Series),
    "RSI (14-day): " + JSON.stringify(rsiSeries),
  ].join("\n");

  return indicatorDetails;
};


