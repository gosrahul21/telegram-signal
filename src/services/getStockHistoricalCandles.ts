import { UpstoxInterval } from '@/utils/types/Duration';
import formatDate from '../utils/helper/formatDate';
import {
  aggregateToDayCandle,
  fetchCandleHistory,
  getIntradayCandles,
} from './upstoxApi';
import { CandleData } from '../utils/helper/models/candleData';
import { instrumentMapping } from '@/utils/constants';

export class UpstoxPriceApiService {
  constructor() {}

  async getStockHistoricalCandles(
    symbol: string,
    interval: UpstoxInterval,
  ): Promise<CandleData[]> {
    // Iterate through each instrument in the instrument mapping
    // Calculate the toDate as current date
    const toDate = new Date();

    // Format the dates to "yyyy:mm:dd" format
    const formattedToDate = formatDate(toDate); //current date
    const intrumentKey =
      instrumentMapping[symbol as keyof typeof instrumentMapping];
    let historicalCandles = await fetchCandleHistory(
      intrumentKey,
      interval,
      formattedToDate,
    );

    if (interval === UpstoxInterval.OneHour) {
      const intradayCandles = await getIntradayCandles(intrumentKey, interval);
      // const fiveMinutesCandles = await getIntradayCandles(
      //   symbol,
      //   UpstoxInterval.FiveMinutes
      // );
      historicalCandles = [
        // ...(fiveMinutesCandles.length > 0 ? [fiveMinutesCandles[0]] : []), // first 5 minutes candle
        ...intradayCandles,
        ...historicalCandles,
      ];
    } else if (interval === UpstoxInterval.OneDay) {
      const intradayCandles = await getIntradayCandles(
        intrumentKey,
        UpstoxInterval.OneHour,
      );
      historicalCandles = [
        aggregateToDayCandle(intradayCandles),
        ...historicalCandles,
      ];
    }
    return historicalCandles.reverse();
  }
}

export const upstoxPriceApiService = new UpstoxPriceApiService();
