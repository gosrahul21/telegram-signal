import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderSide } from '../orders.entity';
export interface Position {
    id: string;
    userId: string;
    symbol: string;
    side: OrderSide;
    quantity: number;
    averagePrice: number;
    currentPrice?: number;
    unrealizedPnl?: number;
    realizedPnl?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PositionService {
    private readonly eventEmitter;
    private readonly logger;
    private positions;
    constructor(eventEmitter: EventEmitter2);
    handleOrderExecuted(event: any): Promise<void>;
    private calculatePnL;
    getPosition(userId: string, symbol: string): Position | null;
    getUserPositions(userId: string): Position[];
    getAllPositions(): Position[];
    updatePositionPrice(userId: string, symbol: string, currentPrice: number): Position | null;
    closePosition(userId: string, symbol: string, closePrice: number): Position | null;
    getUserPositionStats(userId: string): {
        totalPositions: number;
        totalValue: number;
        totalUnrealizedPnl: number;
        totalRealizedPnl: number;
        totalPnL: number;
        positions: {
            symbol: string;
            side: OrderSide;
            quantity: number;
            averagePrice: number;
            currentPrice: number;
            unrealizedPnl: number;
            realizedPnl: number;
        }[];
    };
}
