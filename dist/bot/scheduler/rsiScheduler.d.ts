import { Bot } from 'grammy';
import { Duration } from '@/utils/types/Duration';
import { RSISignal } from '../utils/renderRSISignal';
export interface CandleData {
    open: number;
    high: number;
    low: number;
    volume: number;
    close: number;
    time: number;
}
export declare function calculateEMA(candlePrices: {
    close: number;
}[], duration: number): any;
export declare const priceAwayFromAverage: (keyName: string, pairName: string, duration: Duration) => Promise<RSISignal[]>;
export declare const rsiScheduler: (bot: Bot) => Promise<void>;
