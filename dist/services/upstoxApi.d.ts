import { CandleData } from '../utils/helper/models/candleData';
import { UpstoxInterval } from '@/utils/types/Duration';
import 'dotenv/config';
export declare const aggregateToHourlyCandles: (data: CandleData[]) => CandleData[];
export declare const fetchCandleHistory: (instrumentKey: string, interval: UpstoxInterval, toDate: string) => Promise<CandleData[]>;
export declare const getIntradayCandles: (instrumentKey: string, interval: UpstoxInterval) => Promise<CandleData[]>;
export declare const aggregateToDayCandle: (intradayCandles: CandleData[]) => CandleData;
