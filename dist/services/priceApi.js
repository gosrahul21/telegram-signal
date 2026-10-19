"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCandleData = fetchCandleData;
exports.fetchTickerPrice = fetchTickerPrice;
const axios_1 = __importDefault(require("axios"));
// Realistic browser headers to prevent Cloudflare / WAF 418 "I'm a teapot" blocks on cloud IPs
const BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
};
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 20000; // 20 seconds cache across schedulers
const TICKER_CACHE_TTL_MS = 10000; // 10 seconds for ticker prices
// Bybit interval parameter mapping
const BYBIT_INTERVAL_MAP = {
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
const DURATION_MS_MAP = {
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
const candleCache = new Map();
const inFlightCandles = new Map();
const tickerCache = new Map();
const inFlightTickers = new Map();
// Dynamic cooldown if Binance Futures (fapi) sends 418 or 429
let fapiCooldownUntil = 0;
const FAPI_COOLDOWN_DURATION_MS = 10 * 60 * 1000; // 10 minutes
// Rate limiter: strictly maintain at least 5 seconds between consecutive Binance API calls
const MIN_BINANCE_CALL_INTERVAL_MS = 5000;
let lastBinanceCallTime = 0;
let binanceRequestQueue = Promise.resolve();
/**
 * Enforces a strict minimum of 5 seconds between outgoing Binance API calls
 * across all schedulers, symbols, and commands.
 */
async function throttleBinanceCall() {
    const waitPromise = binanceRequestQueue.then(async () => {
        const now = Date.now();
        const elapsed = now - lastBinanceCallTime;
        if (lastBinanceCallTime > 0 && elapsed < MIN_BINANCE_CALL_INTERVAL_MS) {
            const waitTime = MIN_BINANCE_CALL_INTERVAL_MS - elapsed;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
        lastBinanceCallTime = Date.now();
    });
    binanceRequestQueue = waitPromise.catch(() => { });
    return waitPromise;
}
function isFapiInCooldown() {
    return Date.now() < fapiCooldownUntil;
}
function triggerFapiCooldown(status, reason) {
    fapiCooldownUntil = Date.now() + FAPI_COOLDOWN_DURATION_MS;
    console.warn(`[priceApi] Binance fapi responded with HTTP ${status} (${reason}). Cooldown activated for 10 minutes; automatically using Binance Vision and Bybit fallbacks.`);
}
const axiosConfig = {
    headers: BROWSER_HEADERS,
    timeout: REQUEST_TIMEOUT_MS,
};
/**
 * Fetch candle data from Binance Spot endpoints (Vision API cluster & mirrors)
 */
async function fetchFromBinanceSpot(symbol, interval) {
    // data-api.binance.vision is Binance's official public cluster for server scripts and bots
    const spotEndpoints = [
        "https://data-api.binance.vision/api/v3/klines",
        "https://api.binance.com/api/v3/klines",
        "https://api1.binance.com/api/v3/klines",
        "https://api3.binance.com/api/v3/klines",
    ];
    for (const baseUrl of spotEndpoints) {
        try {
            await throttleBinanceCall();
            const url = `${baseUrl}?symbol=${symbol}&interval=${interval}&limit=500`;
            const response = await axios_1.default.get(url, axiosConfig);
            if (Array.isArray(response.data) && response.data.length > 0) {
                return response.data.map((c) => ({
                    openTime: c[0],
                    open: parseFloat(c[1]),
                    high: parseFloat(c[2]),
                    low: parseFloat(c[3]),
                    close: parseFloat(c[4]),
                    volume: parseFloat(c[5]),
                    closeTime: c[6],
                }));
            }
        }
        catch (err) {
            if (err.response?.status === 400) {
                // Not a spot symbol (e.g. futures-only commodity contract)
                return null;
            }
            // If error (418/429/timeout), continue to next spot mirror
        }
    }
    return null;
}
/**
 * Fetch candle data from Binance Futures (fapi.binance.com)
 */
async function fetchFromBinanceFutures(symbol, interval) {
    if (isFapiInCooldown()) {
        return null;
    }
    try {
        await throttleBinanceCall();
        const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=500`;
        const response = await axios_1.default.get(url, axiosConfig);
        if (Array.isArray(response.data) && response.data.length > 0) {
            return response.data.map((c) => ({
                openTime: c[0],
                open: parseFloat(c[1]),
                high: parseFloat(c[2]),
                low: parseFloat(c[3]),
                close: parseFloat(c[4]),
                volume: parseFloat(c[5]),
                closeTime: c[6],
            }));
        }
    }
    catch (err) {
        const status = err.response?.status;
        if (status === 418 || status === 429) {
            triggerFapiCooldown(status, status === 418 ? "WAF / Rate-limit block" : "Rate limit exceeded");
        }
        else {
            console.warn(`[priceApi] Binance Futures error for ${symbol}: ${err.message}`);
        }
    }
    return null;
}
/**
 * Fetch candle data from Bybit Linear Market as universal fallback
 */
async function fetchFromBybit(symbol, interval) {
    try {
        const bybitInterval = BYBIT_INTERVAL_MAP[interval] || "15";
        const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${bybitInterval}&limit=200`;
        const response = await axios_1.default.get(url, axiosConfig);
        const list = response.data?.result?.list;
        if (Array.isArray(list) && list.length > 0) {
            const intervalMs = DURATION_MS_MAP[interval] || 15 * 60 * 1000;
            // Bybit returns candles newest-first; reverse to oldest-first to match Binance format
            return list.slice().reverse().map((c) => {
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
    }
    catch (err) {
        console.warn(`[priceApi] Bybit fallback error for ${symbol}: ${err.message}`);
    }
    return null;
}
/**
 * Robust candle fetcher with short-term cache, in-flight promise sharing,
 * and resilient multi-provider fallback (Binance Vision -> Binance Futures -> Bybit)
 */
async function fetchCandleData(symbol, interval) {
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
    const fetchPromise = (async () => {
        try {
            const isFuturesOnly = KNOWN_FUTURES_ONLY.has(normalizedSymbol);
            // For standard crypto pairs: Try Binance Vision / Spot first (immune to cloud IP blocks)
            if (!isFuturesOnly) {
                const spotCandles = await fetchFromBinanceSpot(normalizedSymbol, interval);
                if (spotCandles && spotCandles.length > 0) {
                    candleCache.set(cacheKey, { data: spotCandles, timestamp: Date.now() });
                    return spotCandles;
                }
            }
            // Try Binance Futures
            const futuresCandles = await fetchFromBinanceFutures(normalizedSymbol, interval);
            if (futuresCandles && futuresCandles.length > 0) {
                candleCache.set(cacheKey, { data: futuresCandles, timestamp: Date.now() });
                return futuresCandles;
            }
            // Fallback to Bybit Linear
            const bybitCandles = await fetchFromBybit(normalizedSymbol, interval);
            if (bybitCandles && bybitCandles.length > 0) {
                candleCache.set(cacheKey, { data: bybitCandles, timestamp: Date.now() });
                return bybitCandles;
            }
            console.error(`[priceApi] All candle providers failed for ${normalizedSymbol} (${interval})`);
            return null;
        }
        finally {
            inFlightCandles.delete(cacheKey);
        }
    })();
    inFlightCandles.set(cacheKey, fetchPromise);
    return fetchPromise;
}
/**
 * Fetch latest ticker price with multi-provider fallback and caching
 */
async function fetchTickerPrice(symbol) {
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
    const fetchPromise = (async () => {
        try {
            const isFuturesOnly = KNOWN_FUTURES_ONLY.has(normalizedSymbol);
            // Try Binance Vision / Spot
            if (!isFuturesOnly) {
                try {
                    await throttleBinanceCall();
                    const res = await axios_1.default.get(`https://data-api.binance.vision/api/v3/ticker/price?symbol=${normalizedSymbol}`, axiosConfig);
                    if (res.data?.price) {
                        const result = {
                            symbol: normalizedSymbol,
                            price: res.data.price,
                        };
                        tickerCache.set(cacheKey, { data: result, timestamp: Date.now() });
                        return result;
                    }
                }
                catch {
                    // Fall through
                }
            }
            // Try Binance Futures (if not in cooldown)
            if (!isFapiInCooldown()) {
                try {
                    await throttleBinanceCall();
                    const res = await axios_1.default.get(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${normalizedSymbol}`, axiosConfig);
                    if (res.data?.price) {
                        const result = {
                            symbol: normalizedSymbol,
                            price: res.data.price,
                        };
                        tickerCache.set(cacheKey, { data: result, timestamp: Date.now() });
                        return result;
                    }
                }
                catch (err) {
                    const status = err.response?.status;
                    if (status === 418 || status === 429) {
                        triggerFapiCooldown(status, "Ticker price limit");
                    }
                }
            }
            // Fallback to Bybit
            try {
                const res = await axios_1.default.get(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${normalizedSymbol}`, axiosConfig);
                const lastPrice = res.data?.result?.list?.[0]?.lastPrice;
                if (lastPrice) {
                    const result = {
                        symbol: normalizedSymbol,
                        price: lastPrice,
                    };
                    tickerCache.set(cacheKey, { data: result, timestamp: Date.now() });
                    return result;
                }
            }
            catch (err) {
                console.warn(`[priceApi] Bybit ticker error for ${normalizedSymbol}: ${err.message}`);
            }
            console.error(`[priceApi] All ticker providers failed for ${normalizedSymbol}`);
            return null;
        }
        finally {
            inFlightTickers.delete(cacheKey);
        }
    })();
    inFlightTickers.set(cacheKey, fetchPromise);
    return fetchPromise;
}
