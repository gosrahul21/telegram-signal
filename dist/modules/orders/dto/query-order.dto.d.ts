import { Exchange, OrderSide, OrderType, OrderStatus, OrderSource, OrderPriority } from '../orders.entity';
export declare class QueryOrderDto {
    page?: number;
    limit?: number;
    exchange?: Exchange;
    symbol?: string;
    side?: OrderSide;
    type?: OrderType;
    status?: OrderStatus;
    source?: OrderSource;
    priority?: OrderPriority;
    signalId?: string;
    alertId?: string;
    strategyId?: string;
    clientOrderId?: string;
    exchangeOrderId?: string;
    isPaperTrade?: boolean;
    isBacktest?: boolean;
    tag?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
