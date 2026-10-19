import axios, { AxiosRequestConfig } from "axios";

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

// Realistic browser headers to prevent WAF / rate-limit blocks on cloud IPs
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 20_000; // 20 seconds cache across schedulers
const TICKER_CACHE_TTL_MS = 10_000; // 10 seconds for ticker prices

// CoinDCX Futures resolution mapping
const COINDCX_RESOLUTION_MAP: Record<
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

// Bybit interval parameter mapping
const BYBIT_INTERVAL_MAP: Record<string, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "30m": "30",
  "1h": "60",
  "2h": "120",
  "4h": "240",
  "8h": "720",
  "1d": "D",
  "1w": "W",
};

const DURATION_MS_MAP: Record<string, number> = {
  "1m": 60 * 1000,
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "2h": 2 * 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "8h": 8 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
};

// Symbols known to be futures-only contracts (not listed on Binance Spot)
const KNOWN_FUTURES_ONLY = new Set(["XAGUSDT", "XAUUSDT"]);

// In-memory caches to reduce duplicate calls across RSI, BB, and EMA schedulers
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const candleCache = new Map<string, CacheEntry<CandleData[]>>();
const inFlightCandles = new Map<string, Promise<CandleData[] | null>>();

const tickerCache = new Map<string, CacheEntry<TickerPriceData>>();
const inFlightTickers = new Map<string, Promise<TickerPriceData | null>>();

// Dynamic cooldown if Binance Futures (fapi) sends 418 or 429
let fapiCooldownUntil = 0;
const FAPI_COOLDOWN_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// Rate limiter: maintain at least 5 seconds between consecutive API calls
const MIN_CALL_INTERVAL_MS = 5000;
let lastCallTime = 0;
let requestQueue: Promise<void> = Promise.resolve();

/**
 * Enforces a minimum of 5 seconds between outgoing exchange API calls
 * across all schedulers, symbols, and commands.
 */
async function throttleCall(): Promise<void> {
  const waitPromise = requestQueue.then(async () => {
    const now = Date.now();
    const elapsed = now - lastCallTime;
    if (lastCallTime > 0 && elapsed < MIN_CALL_INTERVAL_MS) {
      const waitTime = MIN_CALL_INTERVAL_MS - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    lastCallTime = Date.now();
  });

  requestQueue = waitPromise.catch(() => {});
  return waitPromise;
}

function isFapiInCooldown(): boolean {
  return Date.now() < fapiCooldownUntil;
}

function triggerFapiCooldown(status: number, reason: string) {
  fapiCooldownUntil = Date.now() + FAPI_COOLDOWN_DURATION_MS;
  console.warn(
    `[priceApi] Binance fapi responded with HTTP ${status} (${reason}). Cooldown activated for 10 minutes; automatically using CoinDCX and Bybit fallbacks.`
  );
}

const axiosConfig: AxiosRequestConfig = {
  headers: BROWSER_HEADERS,
  timeout: REQUEST_TIMEOUT_MS,
};

/**
 * Converts standard crypto symbol to CoinDCX Futures format (e.g. BTCUSDT -> B-BTC_USDT)
 */
export function toCoinDCXFuturesPair(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  if (clean.startsWith("B-")) return clean;
  const base = clean.replace(/[-_]?USDT$/i, "");
  return `B-${base}_USDT`;
}

/**
 * Fetch futures candlestick data from CoinDCX API
 */
export async function fetchFromCoinDCXFutures(
  symbol: string,
  interval: string
): Promise<CandleData[] | null> {
  const cfg = COINDCX_RESOLUTION_MAP[interval];
  if (!cfg) return null;

  const pair = toCoinDCXFuturesPair(symbol);
  const to = Math.floor(Date.now() / 1000);
  // Fetch ~120 candles so all indicators (50 EMA, 20 BB, 14 RSI) have ample data
  const from = to - 120 * cfg.seconds;

  try {
    await throttleCall();
    const url = "https://public.coindcx.com/market_data/candlesticks";
    const response = await axios.get(url, {
      ...axiosConfig,
      params: {
        pair,
        from,
        to,
        resolution: cfg.resolution,
        pcode: "f",
      },
    });

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
    console.warn(`[priceApi] CoinDCX futures error for ${symbol}: ${err.message}`);
  }

  return null;
}

/**
 * Fetch candle data from Bybit Linear Market as universal fallback
 */
export async function fetchFromBybit(
  symbol: string,
  interval: string
): Promise<CandleData[] | null> {
  try {
    const bybitInterval = BYBIT_INTERVAL_MAP[interval] || "15";
    const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${bybitInterval}&limit=200`;
    const response = await axios.get(url, axiosConfig);
    const list = response.data?.result?.list;

    if (Array.isArray(list) && list.length > 0) {
      const intervalMs = DURATION_MS_MAP[interval] || 15 * 60 * 1000;
      // Bybit returns candles newest-first; reverse to oldest-first to match standard format
      return list.slice().reverse().map((c: any) => {
        const openTime = parseInt(c[0], 10);
        return {
          openTime,
          open: parseFloat(c[1]),
          high: parseFloat(c[2]),
          low: parseFloat(c[3]),
          close: parseFloat(c[4]),
          volume: parseFloat(c[5]),
          closeTime: openTime + intervalMs - 1,
        };
      });
    }
  } catch (err: any) {
    console.warn(`[priceApi] Bybit fallback error for ${symbol}: ${err.message}`);
  }

  return null;
}

/**
 * Fetch candle data from Binance Spot endpoints (Vision API cluster & mirrors)
 */
export async function fetchFromBinanceSpot(
  symbol: string,
  interval: string
): Promise<CandleData[] | null> {
  const spotEndpoints = [
    "https://data-api.binance.vision/api/v3/klines",
    "https://api.binance.com/api/v3/klines",
    "https://api1.binance.com/api/v3/klines",
    "https://api3.binance.com/api/v3/klines",
  ];

  for (const baseUrl of spotEndpoints) {
    try {
      await throttleCall();
      const url = `${baseUrl}?symbol=${symbol}&interval=${interval}&limit=500`;
      const response = await axios.get(url, axiosConfig);
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
      if (err.response?.status === 400) {
        return null;
      }
    }
  }

  return null;
}

/**
 * Fetch candle data from Binance Futures (fapi.binance.com)
 */
export async function fetchFromBinanceFutures(
  symbol: string,
  interval: string
): Promise<CandleData[] | null> {
  if (isFapiInCooldown()) {
    return null;
  }

  try {
    await throttleCall();
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=500`;
    const response = await axios.get(url, axiosConfig);
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
    const status = err.response?.status;
    if (status === 418 || status === 429) {
      triggerFapiCooldown(status, status === 418 ? "WAF / Rate-limit block" : "Rate limit exceeded");
    } else {
      console.warn(`[priceApi] Binance Futures error for ${symbol}: ${err.message}`);
    }
  }

  return null;
}

/**
 * Robust candle fetcher with short-term cache, in-flight promise sharing,
 * and multi-provider fallback.
 * Prioritizes CoinDCX Futures (or Binance if USE_BINANCE=true) with automatic fallbacks.
 */
export async function fetchCandleData(
  symbol: string,
  interval: string
): Promise<CandleData[] | null> {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `${normalizedSymbol}:${interval}`;

  // 1. Check in-memory cache
  const cached = candleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Check if identical request is already in-flight (deduplicate simultaneous scheduler calls)
  const pending = inFlightCandles.get(cacheKey);
  if (pending) {
    return pending;
  }

  // 3. Initiate fetch with fallbacks
  const fetchPromise = (async (): Promise<CandleData[] | null> => {
    try {
      const isFuturesOnly = KNOWN_FUTURES_ONLY.has(normalizedSymbol);
      const preferBinance =
        process.env.USE_BINANCE === "true" ||
        process.env.CANDLE_PROVIDER?.toLowerCase() === "binance";

      if (preferBinance) {
        // BINANCE PREFERRED MODE
        if (!isFuturesOnly) {
          const spotCandles = await fetchFromBinanceSpot(normalizedSymbol, interval);
          if (spotCandles && spotCandles.length > 0) {
            candleCache.set(cacheKey, { data: spotCandles, timestamp: Date.now() });
            return spotCandles;
          }
        }
        const futuresCandles = await fetchFromBinanceFutures(normalizedSymbol, interval);
        if (futuresCandles && futuresCandles.length > 0) {
          candleCache.set(cacheKey, { data: futuresCandles, timestamp: Date.now() });
          return futuresCandles;
        }

        // Fallbacks to CoinDCX and Bybit
        const coindcxCandles = await fetchFromCoinDCXFutures(normalizedSymbol, interval);
        if (coindcxCandles && coindcxCandles.length > 0) {
          candleCache.set(cacheKey, { data: coindcxCandles, timestamp: Date.now() });
          return coindcxCandles;
        }
        const bybitCandles = await fetchFromBybit(normalizedSymbol, interval);
        if (bybitCandles && bybitCandles.length > 0) {
          candleCache.set(cacheKey, { data: bybitCandles, timestamp: Date.now() });
          return bybitCandles;
        }
      } else {
        // COINDCX PREFERRED MODE (Default during Binance ban)
        // 1. PRIMARY: Fetch from CoinDCX Futures
        const coindcxCandles = await fetchFromCoinDCXFutures(normalizedSymbol, interval);
        if (coindcxCandles && coindcxCandles.length > 0) {
          candleCache.set(cacheKey, { data: coindcxCandles, timestamp: Date.now() });
          return coindcxCandles;
        }

        // 2. SECONDARY: Bybit Linear
        const bybitCandles = await fetchFromBybit(normalizedSymbol, interval);
        if (bybitCandles && bybitCandles.length > 0) {
          candleCache.set(cacheKey, { data: bybitCandles, timestamp: Date.now() });
          return bybitCandles;
        }

        // 3. TERTIARY: Binance Spot / Vision (if not futures-only)
        if (!isFuturesOnly) {
          const spotCandles = await fetchFromBinanceSpot(normalizedSymbol, interval);
          if (spotCandles && spotCandles.length > 0) {
            candleCache.set(cacheKey, { data: spotCandles, timestamp: Date.now() });
            return spotCandles;
          }
        }

        // 4. Binance Futures (if not in cooldown)
        const futuresCandles = await fetchFromBinanceFutures(normalizedSymbol, interval);
        if (futuresCandles && futuresCandles.length > 0) {
          candleCache.set(cacheKey, { data: futuresCandles, timestamp: Date.now() });
          return futuresCandles;
        }
      }

      console.error(`[priceApi] All candle providers failed for ${normalizedSymbol} (${interval})`);
      return null;
    } finally {
      inFlightCandles.delete(cacheKey);
    }
  })();

  inFlightCandles.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Fetch latest ticker price with multi-provider fallback and caching.
 * Prioritizes CoinDCX Futures trades -> Bybit Linear -> Binance (or Binance first if USE_BINANCE=true).
 */
export async function fetchTickerPrice(
  symbol: string
): Promise<TickerPriceData | null> {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = normalizedSymbol;

  const cached = tickerCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < TICKER_CACHE_TTL_MS) {
    return cached.data;
  }

  const pending = inFlightTickers.get(cacheKey);
  if (pending) {
    return pending;
  }

  const fetchPromise = (async (): Promise<TickerPriceData | null> => {
    try {
      const pair = toCoinDCXFuturesPair(normalizedSymbol);
      const isFuturesOnly = KNOWN_FUTURES_ONLY.has(normalizedSymbol);
      const preferBinance =
        process.env.USE_BINANCE === "true" ||
        process.env.CANDLE_PROVIDER?.toLowerCase() === "binance";

      if (preferBinance) {
        // BINANCE PREFERRED MODE
        if (!isFuturesOnly) {
          try {
            await throttleCall();
            const res = await axios.get(
              `https://data-api.binance.vision/api/v3/ticker/price?symbol=${normalizedSymbol}`,
              axiosConfig
            );
            if (res.data?.price) {
              const result: TickerPriceData = {
                symbol: normalizedSymbol,
                price: res.data.price,
              };
              tickerCache.set(cacheKey, { data: result, timestamp: Date.now() });
              return result;
            }
          } catch {}
        }

        if (!isFapiInCooldown()) {
          try {
            await throttleCall();
            const res = await axios.get(
              `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${normalizedSymbol}`,
              axiosConfig
            );
            if (res.data?.price) {
              const result: TickerPriceData = {
                symbol: normalizedSymbol,
                price: res.data.price,
              };
              tickerCache.set(cacheKey, { data: result, timestamp: Date.now() });
              return result;
            }
          } catch (err: any) {
            const status = err.response?.status;
            if (status === 418 || status === 429) {
              triggerFapiCooldown(status, "Ticker price limit");
            }
          }
        }
      }

      // PRIMARY (or fallback): CoinDCX Futures latest trades
      try {
        await throttleCall();
        const res = await axios.get(
          `https://api.coindcx.com/exchange/v1/derivatives/futures/data/trades?pair=${pair}`,
          axiosConfig
        );
        const ltp = res.data?.[0]?.price;
        if (ltp !== undefined && ltp !== null) {
          const result: TickerPriceData = {
            symbol: normalizedSymbol,
            price: String(ltp),
          };
          tickerCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      } catch {
        // Fall through
      }

      // SECONDARY: Bybit
      try {
        const res = await axios.get(
          `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${normalizedSymbol}`,
          axiosConfig
        );
        const lastPrice = res.data?.result?.list?.[0]?.lastPrice;
        if (lastPrice) {
          const result: TickerPriceData = {
            symbol: normalizedSymbol,
            price: lastPrice,
          };
          tickerCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      } catch (err: any) {
        console.warn(`[priceApi] Bybit ticker error for ${normalizedSymbol}: ${err.message}`);
      }

      // TERTIARY: Binance Spot / Vision
      try {
        const res = await axios.get(
          `https://data-api.binance.vision/api/v3/ticker/price?symbol=${normalizedSymbol}`,
          axiosConfig
        );
        if (res.data?.price) {
          const result: TickerPriceData = {
            symbol: normalizedSymbol,
            price: res.data.price,
          };
          tickerCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      } catch {
        // Fall through
      }

      console.error(`[priceApi] All ticker providers failed for ${normalizedSymbol}`);
      return null;
    } finally {
      inFlightTickers.delete(cacheKey);
    }
  })();

  inFlightTickers.set(cacheKey, fetchPromise);
  return fetchPromise;
}


