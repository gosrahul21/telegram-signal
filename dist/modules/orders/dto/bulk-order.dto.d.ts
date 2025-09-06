import { OrderPriority, OrderStatus } from '../orders.entity';
import { CreateOrderDto } from './create-order.dto';
export declare class BulkCreateOrderDto {
    orders: CreateOrderDto[];
    executeImmediately?: boolean;
    batchId?: string;
    notes?: string;
}
export declare class BulkUpdateOrderDto {
    orderIds: string[];
    status?: OrderStatus;
    priority?: OrderPriority;
    notes?: string;
    tags?: string[];
    isPaperTrade?: boolean;
}
export declare class BulkCancelOrderDto {
    orderIds: string[];
    reason?: string;
    force?: boolean;
}
export declare class OrderExecutionDto {
    orderId: string;
    exchangeOrderId?: string;
    filledQuantity?: number;
    averagePrice?: number;
    fees?: number;
    executionNotes?: string;
}
