import { OrderStatus, OrderPriority } from '../orders.entity';
export declare class UpdateOrderDto {
    status?: OrderStatus;
    quantity?: number;
    price?: number;
    stopPrice?: number;
    takeProfitPrice?: number;
    stopLossPrice?: number;
    priority?: OrderPriority;
    notes?: string;
    tags?: string[];
    maxRiskAmount?: number;
    positionSize?: number;
    isPaperTrade?: boolean;
    validUntil?: string;
    metadata?: Record<string, any>;
}
