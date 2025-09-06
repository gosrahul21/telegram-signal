import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { BulkCreateOrderDto, BulkUpdateOrderDto, BulkCancelOrderDto, OrderExecutionDto } from './dto/bulk-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: any, createOrderDto: CreateOrderDto): Promise<{
        success: boolean;
        message: string;
        data: import("./orders.entity").Order;
    }>;
    getOrders(req: any, queryDto: QueryOrderDto): Promise<{
        success: boolean;
        data: {
            orders: import("./orders.entity").Order[];
            total: number;
            page: number;
            totalPages: number;
        };
    }>;
    getOrderById(req: any, id: string): Promise<{
        success: boolean;
        data: import("./orders.entity").Order;
    }>;
    updateOrder(req: any, id: string, updateOrderDto: UpdateOrderDto): Promise<{
        success: boolean;
        message: string;
        data: import("./orders.entity").Order;
    }>;
    cancelOrder(req: any, id: string, body: {
        reason?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./orders.entity").Order;
    }>;
    deleteOrder(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getOrderStats(req: any): Promise<{
        success: boolean;
        data: {
            total: number;
            byStatus: Record<string, number>;
            byExchange: Record<string, number>;
            bySide: Record<string, number>;
            byType: Record<string, number>;
            totalVolume: number;
            totalFees: number;
            totalPnL: number;
            averagePnL: number;
        };
    }>;
    getActiveOrders(req: any): Promise<{
        success: boolean;
        data: import("./orders.entity").Order[];
    }>;
    getOrdersBySymbol(req: any, symbol: string): Promise<{
        success: boolean;
        data: import("./orders.entity").Order[];
    }>;
    getOrdersBySignal(signalId: string): Promise<{
        success: boolean;
        data: import("./orders.entity").Order[];
    }>;
    bulkCreateOrders(req: any, bulkCreateDto: BulkCreateOrderDto): Promise<{
        success: boolean;
        message: string;
        data: {
            created: import("./orders.entity").Order[];
            failed: Array<{
                order: CreateOrderDto;
                error: string;
            }>;
        };
    }>;
    bulkUpdateOrders(req: any, bulkUpdateDto: BulkUpdateOrderDto): Promise<{
        success: boolean;
        message: string;
        data: {
            updated: number;
            failed: string[];
        };
    }>;
    bulkCancelOrders(req: any, bulkCancelDto: BulkCancelOrderDto): Promise<{
        success: boolean;
        message: string;
        data: {
            canceled: number;
            failed: string[];
        };
    }>;
    updateOrderExecution(req: any, id: string, executionDto: Omit<OrderExecutionDto, 'orderId'>): Promise<{
        success: boolean;
        message: string;
        data: import("./orders.entity").Order;
    }>;
    calculateOrderPnL(req: any, id: string, body: {
        currentPrice: number;
    }): Promise<{
        success: boolean;
        data: {
            pnl: number;
            pnlPercentage: number;
        };
    }>;
    getOrdersForRetry(): Promise<{
        success: boolean;
        data: import("./orders.entity").Order[];
    }>;
    cleanupExpiredOrders(): Promise<{
        success: boolean;
        message: string;
        data: {
            deletedCount: number;
        };
    }>;
}
