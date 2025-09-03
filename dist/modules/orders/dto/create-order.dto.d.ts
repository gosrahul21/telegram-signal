import { Exchange, OrderSide, OrderType, TimeInForce, OrderSource, OrderPriority } from '../orders.entity';
export declare class CreateOrderDto {
    exchange: Exchange;
    symbol: string;
    side: OrderSide;
    type: OrderType;
    quantity: number;
    price?: number;
    stopPrice?: number;
    takeProfitPrice?: number;
    stopLossPrice?: number;
    timeInForce?: TimeInForce;
    source?: OrderSource;
    priority?: OrderPriority;
    clientOrderId?: string;
    signalId?: string;
    alertId?: string;
    strategyId?: string;
    notes?: string;
    tags?: string[];
    maxRiskAmount?: number;
    positionSize?: number;
    parentOrderId?: string;
    isPaperTrade?: boolean;
    validUntil?: string;
    metadata?: {
        signalData?: {
            indicator?: string;
            timeframe?: string;
            confidence?: number;
            rsi?: number;
            ema?: number;
            macd?: number;
            bollingerBands?: {
                upper: number;
                middle: number;
                lower: number;
            };
        };
        riskManagement?: {
            maxRisk?: number;
            riskRewardRatio?: number;
            positionSize?: number;
            stopLossPercentage?: number;
            takeProfitPercentage?: number;
        };
        custom?: Record<string, any>;
    };
}
