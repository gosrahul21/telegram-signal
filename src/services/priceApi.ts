import axios from "axios";  

// Function to fetch candlestick (OHLC) data from Binance API
export async function fetchCandleData(symbol: string, interval: string) {
  try {
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}`;
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
    const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching Binance ticker price:", error);
    return null;
  }
}
