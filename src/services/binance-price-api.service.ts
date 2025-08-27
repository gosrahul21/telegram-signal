import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BinancePriceApiService {
  constructor() {}

  async fetchBinanceCandleData(symbol: string, interval: string) {
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
      console.error('Error fetching Binance candle data:', error);
      return null;
    }
  }

  async fetchBinanceTickerPrice(symbol: string) {
    try {
      const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching Binance ticker price:', error);
      return null;
    }
  }
}
