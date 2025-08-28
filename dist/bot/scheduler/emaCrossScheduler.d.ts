import { Bot } from 'grammy';
import { Duration } from '@/utils/types/Duration';
interface EMASignal {
    type: string;
    time: number;
    price: number;
    details: string;
}
export declare function calculateEMA(candlePrices: {
    close: number;
}[], duration: number): number[];
export declare function generateCrossSignals(prices: any, ema9: Array<number>, ema21: Array<number>, ema20: Array<number>, ema50: Array<number>, getTrend?: boolean): EMASignal[];
export declare const generateSignal: (keyname: string, duration: Duration) => Promise<EMASignal[]>;
export declare const getSmallSignal: (keyname: string, duration: Duration, emaShort: number, emaLong: number) => Promise<EMASignal[]>;
export declare const renderSignal: (pairName: string, signals: EMASignal | EMASignal[], bot: Bot, duration: string) => Promise<void>;
export declare const emaCrossScheduler: (bot: Bot) => Promise<void>;
export {};
