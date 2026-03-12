import { EventEmitter2 } from '@nestjs/event-emitter';
import { PositionService, PositionUpdateResult } from './position.service';
import { OrdersService } from './orders.service';
import { OrderSide } from '../orders.entity';
export interface OrderExecutionEvent {
    orderId: string;
    userId: string;
    symbol: string;
    side: OrderSide;
    quantity: number;
    executedPrice: number;
    executedAt: Date;
    exchangeId: string;
    fees?: number;
}
export declare class PositionManagementService {
    private readonly positionService;
    private readonly ordersService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(positionService: PositionService, ordersService: OrdersService, eventEmitter: EventEmitter2);
    handleOrderTriggered(event: any): Promise<void>;
    processOrderExecution(executionEvent: OrderExecutionEvent): Promise<PositionUpdateResult>;
    private updateOrderStatus;
    executeOrderManually(orderId: string, userId: string, symbol: string, side: OrderSide, quantity: number, executedPrice: number, exchangeId?: string): Promise<PositionUpdateResult>;
    getUserPositionSummary(userId: string): Promise<{
        totalPositions: number;
        totalValue: number;
        totalUnrealizedPnl: number;
        positions: Array<import("../position.entity").Position & {
            metrics: import("./position.service").PositionCalculation;
        }>;
    }>;
    closePosition(positionId: string, closePrice: number): Promise<PositionUpdateResult>;
    getUserActivePositions(userId: string): Promise<import("../position.entity").Position[]>;
    calculatePositionPnL(positionId: string, currentPrice: number): Promise<import("./position.service").PositionCalculation>;
    handleStopLossTrigger(orderId: string, userId: string, symbol: string, currentPrice: number): Promise<PositionUpdateResult>;
    handleTakeProfitTrigger(orderId: string, userId: string, symbol: string, currentPrice: number): Promise<PositionUpdateResult>;
    getPositionStatistics(userId?: string): Promise<{
        totalPositions: number;
        totalPnl: number;
        winRate: number;
        averageHoldingTime: number;
        bestTrade: any;
        worstTrade: any;
    }>;
}
