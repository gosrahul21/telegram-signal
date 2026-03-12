import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersService } from './orders.service';
import { PositionManagementService } from './position-management.service';
import { OrderLifecycleService } from './order-lifecycle.service';
import { TradeEngineService } from '@/modules/trade-engine/services/trade-engine.service';
import { OrderStatus, OrderSide } from '../orders.entity';
export interface SynchronizationState {
    orderId: string;
    orderStatus: OrderStatus;
    positionStatus: 'NONE' | 'CREATED' | 'UPDATED' | 'CLOSED';
    tradeEngineStatus: 'MONITORING' | 'TRIGGERED' | 'CLEANED_UP';
    lastSync: Date;
    errors: string[];
}
export declare class OrderSynchronizationService {
    private readonly ordersService;
    private readonly positionManagementService;
    private readonly orderLifecycleService;
    private readonly tradeEngineService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly syncStates;
    private readonly syncQueue;
    private isProcessingQueue;
    constructor(ordersService: OrdersService, positionManagementService: PositionManagementService, orderLifecycleService: OrderLifecycleService, tradeEngineService: TradeEngineService, eventEmitter: EventEmitter2);
    initializeOrderSync(orderId: string, userId: string, symbol: string, side: OrderSide): Promise<void>;
    handleOrderStatusUpdate(event: any): Promise<void>;
    handlePositionUpdate(event: any): Promise<void>;
    handlePriceLimitTriggered(event: any): Promise<void>;
    private checkSynchronizationNeeded;
    private detectSyncIssues;
    private processSyncQueue;
    private synchronizeOrder;
    private syncFilledOrder;
    private syncCancelledOrder;
    private syncFailedOrder;
    private syncPendingOrder;
    getOrderSyncStatus(orderId: string): SynchronizationState | null;
    getAllSyncStates(): SynchronizationState[];
    forceSyncOrder(orderId: string): Promise<void>;
    cleanupCompletedOrders(): Promise<void>;
    getSyncHealth(): {
        totalOrders: number;
        ordersWithErrors: number;
        queueLength: number;
        isProcessingQueue: boolean;
        errorRate: number;
    };
}
