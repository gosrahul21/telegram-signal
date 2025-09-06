export declare class BinancePriceApiService {
    constructor();
    fetchBinanceCandleData(symbol: string, interval: string): Promise<any>;
    fetchBinanceTickerPrice(symbol: string): Promise<any>;
}
