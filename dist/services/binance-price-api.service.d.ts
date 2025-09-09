export interface BinanceCandleData {
    openTime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: string;
}
export declare class BinancePriceApiService {
    constructor();
    fetchBinanceCandleData(symbol: string, interval: string): Promise<BinanceCandleData[]>;
    fetchBinanceTickerPrice(symbol: string): Promise<any>;
}
