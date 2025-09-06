import { Duration } from '@/utils/types/Duration';
export declare function calculateEMA(candlePrices: {
    close: number;
}[], duration: number): any;
export declare function generateCrossSignals(prices: any, ema9: Array<number>, ema21: Array<number>, ema20: Array<number>, ema50: Array<number>, getTrend?: boolean): any[];
export declare const checkIfPriceNearEma: (prices: any, ema: any) => any[];
export declare const getTrendStatus: (pairName: string, duration: Duration) => Promise<any[]>;
export declare const getTrend: (emasShort: number[], emasLong: number[]) => "UPTREND" | "DOWNTREND";
