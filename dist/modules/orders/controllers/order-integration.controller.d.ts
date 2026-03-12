import { OrderLifecycleService } from '../services/order-lifecycle.service';
import { OrderSynchronizationService } from '../services/order-synchronization.service';
import { OrderPerformanceService } from '../services/order-performance.service';
import { PositionManagementService } from '../services/position-management.service';
import { TradeEngineService } from '@/modules/trade-engine/services/trade-engine.service';
export declare class OrderIntegrationController {
    private readonly orderLifecycleService;
    private readonly orderSynchronizationService;
    private readonly orderPerformanceService;
    private readonly positionManagementService;
    private readonly tradeEngineService;
    constructor(orderLifecycleService: OrderLifecycleService, orderSynchronizationService: OrderSynchronizationService, orderPerformanceService: OrderPerformanceService, positionManagementService: PositionManagementService, tradeEngineService: TradeEngineService);
    getSystemHealth(): Promise<{
        success: boolean;
        data: {
            synchronization: any;
            performance: any;
            tradeEngine: {
                isConnected: boolean;
                subscribedSymbols: string[];
                activeLimits: number;
            };
            healthScore: any;
            timestamp: Date;
        };
    }>;
    getOrderExecutionStatus(orderId: string): Promise<{
        success: boolean;
        data: {
            execution: any;
            synchronization: any;
            timestamp: Date;
        };
    }>;
    forceSyncOrder(orderId: string): Promise<{
        success: boolean;
        message: string;
        timestamp: Date;
    }>;
    getPerformanceMetrics(): Promise<{
        success: boolean;
        data: {
            metrics: any;
            errorBreakdown: {
                [k: string]: any;
            };
            counterBreakdown: {
                [k: string]: any;
            };
            recommendations: any;
            timestamp: Date;
        };
    }>;
    getAllSyncStates(): Promise<{
        success: boolean;
        data: {
            syncStates: any;
            count: any;
            timestamp: Date;
        };
    }>;
    cleanupCompletedOrders(): Promise<{
        success: boolean;
        message: string;
        timestamp: Date;
    }>;
    resetPerformanceMetrics(): Promise<{
        success: boolean;
        message: string;
        timestamp: Date;
    }>;
    getSystemDiagnostics(): Promise<{
        success: boolean;
        data: {
            overallHealth: string;
            synchronization: any;
            performance: any;
            tradeEngine: {
                status: string;
                isConnected: boolean;
                subscribedSymbols: string[];
                activeLimits: number;
            };
            recommendations: any;
            timestamp: Date;
        };
    }>;
    updatePerformanceThresholds(thresholds: {
        maxErrorRate?: number;
        maxExecutionTime?: number;
        maxMemoryUsage?: number;
        maxQueueLength?: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            maxErrorRate?: number;
            maxExecutionTime?: number;
            maxMemoryUsage?: number;
            maxQueueLength?: number;
        };
        timestamp: Date;
    } | {
        success: boolean;
        message: string;
        timestamp: Date;
        data?: undefined;
    }>;
    getOrderFlowStats(timeRange?: string): Promise<{
        success: boolean;
        data: {
            timeRange: string;
            flowStats: {
                totalOrders: any;
                ordersPerSecond: any;
                successRate: number;
                averageExecutionTime: any;
                breakdown: {
                    created: any;
                    executed: any;
                    failed: any;
                    cancelled: any;
                    retries: any;
                };
                positions: {
                    updated: any;
                };
                priceUpdates: any;
            };
            timestamp: Date;
        };
    }>;
    private calculateOverallHealth;
}
