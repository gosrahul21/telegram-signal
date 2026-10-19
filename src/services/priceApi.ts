import axios from "axios";

export interface CandleData {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface TickerPriceData {
  symbol: string;
  price: string;
}

// 5-second minimum difference between outgoing API calls
let lastCallTime = 0;
async function throttle(): Promise<void> {
  const elapsed = Date.now() - lastCallTime;
  if (lastCallTime > 0 && elapsed < 5000) {
    await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
  }
  lastCallTime = Date.now();
}

// CoinDCX Futures interval configurations
const COINDCX_INTERVAL_MAP: Record<
  string,
  { resolution: string; seconds: number }
> = {
  "1m": { resolution: "1", seconds: 60 },
  "5m": { resolution: "5", seconds: 300 },
  "15m": { resolution: "15", seconds: 900 },
  "30m": { resolution: "30", seconds: 1800 },
  "1h": { resolution: "60", seconds: 3600 },
  "4h": { resolution: "240", seconds: 14400 },
  "1d": { resolution: "1D", seconds: 86400 },
};

/**
 * Normalizes symbol to CoinDCX Futures format (e.g. BTCUSDT -> B-BTC_USDT)
 */
export function toCoinDCXFuturesPair(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  if (clean.startsWith("B-")) return clean;
  const base = clean.replace(/[-_]?USDT$/i, "");
  return `B-${base}_USDT`;
}

/**
 * Fetch CoinDCX Futures Candlestick Data
 */
export async function fetchCoinDCXCandles(
  symbol: string,
  interval: string
): Promise<CandleData[] | null> {
  const cfg = COINDCX_INTERVAL_MAP[interval] || {
    resolution: "15",
    seconds: 900,
  };
  const pair = toCoinDCXFuturesPair(symbol);
  const to = Math.floor(Date.now() / 1000);
  const from = to - 120 * cfg.seconds;

  try {
    await throttle();
    const response = await axios.get(
      "https://public.coindcx.com/market_data/candlesticks",
      {
        params: {
          pair,
          from,
          to,
          resolution: cfg.resolution,
          pcode: "f",
        },
        timeout: 8000,
      }
    );

    if (
      response.data?.s === "ok" &&
      Array.isArray(response.data.data) &&
      response.data.data.length > 0
    ) {
      const intervalMs = cfg.seconds * 1000;
      return response.data.data.map((c: any) => ({
        openTime: c.time,
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: Number(c.volume),
        closeTime: c.time + intervalMs - 1,
      }));
    }
  } catch (err: any) {
    console.warn(`[priceApi] CoinDCX Futures error for ${symbol}: ${err.message}`);
  }
  return null;
}

/**
 * Fetch Binance Futures Candlestick Data (fapi.binance.com)
 * Preserved for use when the IP ban is removed.
 */
export async function fetchBinanceCandles(
  symbol: string,
  interval: string
): Promise<CandleData[] | null> {
  try {
    await throttle();
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=120`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 8000,
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map((c: any) => ({
        openTime: c[0],
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        volume: parseFloat(c[5]),
        closeTime: c[6],
      }));
    }
  } catch (err: any) {
    console.warn(
      `[priceApi] Binance Futures error for ${symbol}: ${err.message}`
    );
  }
  return null;
}

/**
 * Main Candle Fetcher:
 * Uses CoinDCX Futures by default (or Binance Futures if USE_BINANCE=true)
 */
export async function fetchCandleData(
  symbol: string,
  interval: string
): Promise<CandleData[] | null> {
  const preferBinance = process.env.USE_BINANCE === "true";

  if (preferBinance) {
    const binanceCandles = await fetchBinanceCandles(symbol, interval);
    if (binanceCandles && binanceCandles.length > 0) return binanceCandles;
    return await fetchCoinDCXCandles(symbol, interval);
  }

  // Default: CoinDCX Futures with Binance Futures as fallback
  const coindcxCandles = await fetchCoinDCXCandles(symbol, interval);
  if (coindcxCandles && coindcxCandles.length > 0) return coindcxCandles;

  return await fetchBinanceCandles(symbol, interval);
}

/**
 * Main Ticker Price Fetcher (Futures only)
 */
export async function fetchTickerPrice(
  symbol: string
): Promise<TickerPriceData | null> {
  const cleanSymbol = symbol.toUpperCase();
  const preferBinance = process.env.USE_BINANCE === "true";

  // Binance Futures Ticker
  const getBinanceTicker = async (): Promise<TickerPriceData | null> => {
    try {
      await throttle();
      const res = await axios.get(
        `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${cleanSymbol}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 8000,
        }
      );
      if (res.data?.price) {
        return { symbol: cleanSymbol, price: String(res.data.price) };
      }
    } catch {}
    return null;
  };

  // CoinDCX Futures Ticker
  const getCoinDCXTicker = async (): Promise<TickerPriceData | null> => {
    try {
      await throttle();
      const pair = toCoinDCXFuturesPair(cleanSymbol);
      const res = await axios.get(
        `https://api.coindcx.com/exchange/v1/derivatives/futures/data/trades?pair=${pair}`,
        { timeout: 8000 }
      );
      const price = res.data?.[0]?.price;
      if (price !== undefined && price !== null) {
        return { symbol: cleanSymbol, price: String(price) };
      }
    } catch {}
    return null;
  };

  if (preferBinance) {
    const binance = await getBinanceTicker();
    if (binance) return binance;
    return await getCoinDCXTicker();
  }

  const coindcx = await getCoinDCXTicker();
  if (coindcx) return coindcx;
  return await getBinanceTicker();
}
