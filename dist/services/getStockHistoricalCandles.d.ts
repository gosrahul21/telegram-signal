import { UpstoxInterval } from '@/utils/types/Duration';
import { CandleData } from '../utils/helper/models/candleData';
export declare class UpstoxPriceApiService {
    constructor();
    getStockHistoricalCandles(symbol: string, interval: UpstoxInterval): Promise<CandleData[]>;
}
export declare const upstoxPriceApiService: UpstoxPriceApiService;
