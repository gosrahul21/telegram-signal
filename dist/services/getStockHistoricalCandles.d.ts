import { UpstoxInterval } from '@/types/Duration';
import { CandleData } from '../models/candleData';
declare function getStockHistoricalCandles(symbol: string, interval: UpstoxInterval): Promise<CandleData[]>;
export default getStockHistoricalCandles;
