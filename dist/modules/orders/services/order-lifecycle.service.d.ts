import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersService } from './orders.service';
import { PositionManagementService } from './position-management.service';
import { OrderStatus, OrderSide } from '../orders.entity';
import { TradeEngineService } from '@/modules/trade-engine/services/trade-engine.service';
export interface OrderLifecycleEvent {
    orderId: string;
    userId: string;
    symbol: string;
    side: OrderSide;
    quantity: number;
    price?: number;
    status: OrderStatus;
    timestamp: Date;
    metadata?: any;
}
export interface OrderExecutionResult {
    success: boolean;
    orderId: string;
    status: OrderStatus;
    executedPrice?: number;
    executedAt?: Date;
    positionResult?: any;
    error?: string;
    retryCount?: number;
}
export declare class OrderLifecycleService {
    private readonly ordersService;
    private readonly positionManagementService;
    private readonly tradeEngineService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly maxRetries;
    private readonly retryDelay;
    private executionQueue;
    private retryCounters;
    constructor(ordersService: OrdersService, positionManagementService: PositionManagementService, tradeEngineService: TradeEngineService, eventEmitter: EventEmitter2);
    handleOrderCreated(event: OrderLifecycleEvent): Promise<void>;
    handleOrderTriggered(event: any): Promise<void>;
    private processOrderExecution;
    private setupPriceMonitoring;
    private executeMarketOrder;
    private updateOrderStatus;
    private handleOrderError;
    cancelOrder(orderId: string, userId: string): Promise<void>;
    getOrderExecutionStatus(orderId: string): Promise<{
        orderId: string;
        isExecuting: boolean;
        retryCount: number;
        maxRetries: number;
    }>;
    cleanupCompletedOrders(): Promise<void>;
    getSystemHealth(): {
        activeExecutions: number;
        pendingRetries: number;
        maxRetries: number;
        retryDelay: number;
    };
}
