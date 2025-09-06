import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderDocument } from './orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { BulkCreateOrderDto, BulkUpdateOrderDto, BulkCancelOrderDto, OrderExecutionDto } from './dto/bulk-order.dto';
export declare class OrdersService {
    private orderModel;
    private readonly eventEmitter;
    private readonly logger;
    constructor(orderModel: Model<OrderDocument>, eventEmitter: EventEmitter2);
    createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order>;
    getOrders(userId: string, queryDto: QueryOrderDto): Promise<{
        orders: Order[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOrderById(userId: string, orderId: string): Promise<Order>;
    updateOrder(userId: string, orderId: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    cancelOrder(userId: string, orderId: string, reason?: string): Promise<Order>;
    deleteOrder(userId: string, orderId: string): Promise<boolean>;
    getOrderStats(userId: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byExchange: Record<string, number>;
        bySide: Record<string, number>;
        byType: Record<string, number>;
        totalVolume: number;
        totalFees: number;
        totalPnL: number;
        averagePnL: number;
    }>;
    getActiveOrders(userId: string): Promise<Order[]>;
    getOrdersBySymbol(userId: string, symbol: string): Promise<Order[]>;
    getOrdersBySignal(signalId: string): Promise<Order[]>;
    bulkCreateOrders(userId: string, bulkCreateDto: BulkCreateOrderDto): Promise<{
        created: Order[];
        failed: Array<{
            order: CreateOrderDto;
            error: string;
        }>;
    }>;
    bulkUpdateOrders(userId: string, bulkUpdateDto: BulkUpdateOrderDto): Promise<{
        updated: number;
        failed: string[];
    }>;
    bulkCancelOrders(userId: string, bulkCancelDto: BulkCancelOrderDto): Promise<{
        canceled: number;
        failed: string[];
    }>;
    updateOrderExecution(userId: string, executionDto: OrderExecutionDto): Promise<Order>;
    calculateOrderPnL(userId: string, orderId: string, currentPrice: number): Promise<{
        pnl: number;
        pnlPercentage: number;
    }>;
    getOrdersForRetry(): Promise<Order[]>;
    updateRetryInfo(orderId: string, error: string): Promise<void>;
    cleanupExpiredOrders(): Promise<{
        deletedCount: number;
    }>;
}
