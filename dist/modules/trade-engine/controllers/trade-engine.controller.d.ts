import { TradeEngineService, PriceLimit } from '../services/trade-engine.service';
export declare class TradeEngineController {
    private readonly tradeEngineService;
    constructor(tradeEngineService: TradeEngineService);
    removePriceLimit(limitId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getCurrentPrice(symbol: string): Promise<{
        symbol: string;
        price: number;
        timestamp: Date;
    }>;
    getActivePriceLimits(): Promise<{
        limits: PriceLimit[];
        count: number;
    }>;
    getPriceLimitsForSymbol(symbol: string): Promise<{
        symbol: string;
        limits: PriceLimit[];
        count: number;
    }>;
    getConnectionStatus(): Promise<{
        timestamp: Date;
        isConnected: boolean;
        subscribedSymbols: string[];
        activeLimits: number;
    }>;
    subscribeToSymbol(symbol: string): Promise<{
        symbol: string;
        message: string;
    }>;
    unsubscribeFromSymbol(symbol: string): Promise<{
        symbol: string;
        message: string;
    }>;
    testPriceLimit(body: {
        symbol: string;
        limitPrice: number;
        condition: 'ABOVE' | 'BELOW' | 'EQUAL';
    }): Promise<{
        error: string;
        symbol: string;
        currentPrice?: undefined;
        limitPrice?: undefined;
        condition?: undefined;
        isTriggered?: undefined;
        difference?: undefined;
        percentageDifference?: undefined;
    } | {
        symbol: string;
        currentPrice: number;
        limitPrice: number;
        condition: "ABOVE" | "BELOW" | "EQUAL";
        isTriggered: boolean;
        difference: number;
        percentageDifference: number;
        error?: undefined;
    }>;
}
