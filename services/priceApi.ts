import { Duration } from "../types/Duration";
import axios from "axios";

// // Function to fetch candle data from the Coindcx API
// export async function fetchCandleData(pair: string, interval: Duration) {
//     try {
//         const url = `https://public.coindcx.com/market_data/candles/?pair=${pair}&interval=${interval}`;
//         const response: any = await axios.get(url);
//         const data = await response.data;
//         return data;
//     } catch (error) {
//         console.log(error);
//     }
// }

// export async function fetchTickerPrice() {
//     const url = `https://api.coindcx.com/exchange/ticker/`;
//     const response: any = await axios.get(url);
//     const data = await response.data;
//     return data;
// }

// Function to fetch candlestick (OHLC) data from Binance API
export async function fetchCandleData(symbol: string, interval: string) {
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`;
    const response = await axios.get(url);
    return response.data.map((candle: any) => ({
      openTime: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
      closeTime: candle[6],
    }));
  } catch (error) {
    console.error("Error fetching Binance candle data:", error);
    return null;
  }
}

// Function to fetch the latest ticker price from Binance API
export async function fetchTickerPrice(symbol: string) {
  try {
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching Binance ticker price:", error);
    return null;
  }
}
