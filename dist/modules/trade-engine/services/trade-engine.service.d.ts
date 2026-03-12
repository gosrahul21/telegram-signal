import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '@/modules/orders';
export interface PriceLimit {
    id: string;
    symbol: string;
    limitPrice: number;
    condition: 'ABOVE' | 'BELOW' | 'EQUAL';
    orderId?: string;
    amount: number;
    userId?: string;
    metadata?: any;
    createdAt: Date;
    triggered?: boolean;
    triggeredAt?: Date;
}
export interface PriceUpdate {
    symbol: string;
    price: number;
    timestamp: Date;
    volume?: number;
}
export declare class TradeEngineService implements OnModuleInit, OnModuleDestroy {
    private readonly eventEmitter;
    private readonly logger;
    private ws;
    private priceLimits;
    private subscribedSymbols;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectInterval;
    private isConnected;
    private DEFAULT_SYMBOLS;
    constructor(eventEmitter: EventEmitter2);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connectToBinance;
    private handleReconnection;
    private buildStreamUrls;
    private processPriceUpdates;
    private checkPriceLimits;
    private triggerPriceLimit;
    private emitPriceUpdate;
    addPriceLimit(limit: Omit<PriceLimit, 'id' | 'createdAt' | 'triggered'>): string;
    removePriceLimit(limitId: string): boolean;
    getCurrentPrice(symbol: string): Promise<number | null>;
    getActivePriceLimits(): PriceLimit[];
    getPriceLimitsForSymbol(symbol: string): PriceLimit[];
    getConnectionStatus(): {
        isConnected: boolean;
        subscribedSymbols: string[];
        activeLimits: number;
    };
    private disconnect;
    handleTradeEngineEvent(event: Order): void;
    subscribeToSymbol(symbol: string): void;
    unsubscribeFromSymbol(symbol: string): void;
}
