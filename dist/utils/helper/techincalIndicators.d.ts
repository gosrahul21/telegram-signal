export declare function calculateEMA(prices: number[], period: number): any;
export declare function calculateRSI(prices: number[], period?: number): any;
export declare function calculateMACD(prices: number[]): any;
export declare const getIndicatorOnTimeFrame: (symbol: string, timeframe: string) => Promise<string>;
