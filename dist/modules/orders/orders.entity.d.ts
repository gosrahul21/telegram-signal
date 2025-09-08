import { Document, Types } from 'mongoose';
export type OrderDocument = Order & Document;
export declare enum Exchange {
    BINANCE = "binance",
    UPSTOX = "upstox",
    COINDCX = "coindcx",
    MANUAL = "manual"
}
export declare enum OrderSide {
    BUY = "BUY",
    SELL = "SELL"
}
export declare enum OrderType {
    MARKET = "MARKET",
    LIMIT = "LIMIT",
    STOP_LOSS = "STOP_LOSS",
    STOP_LOSS_LIMIT = "STOP_LOSS_LIMIT",
    TAKE_PROFIT = "TAKE_PROFIT",
    TAKE_PROFIT_LIMIT = "TAKE_PROFIT_LIMIT",
    LIMIT_MAKER = "LIMIT_MAKER",
    STOP = "STOP",
    STOP_MARKET = "STOP_MARKET",
    TRAILING_STOP = "TRAILING_STOP",
    OCO = "OCO"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    SUBMITTED = "SUBMITTED",
    NEW = "NEW",
    PARTIALLY_FILLED = "PARTIALLY_FILLED",
    FILLED = "FILLED",
    CANCELED = "CANCELED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED",
    FAILED = "FAILED",
    PENDING_CANCEL = "PENDING_CANCEL",
    PENDING_REPLACE = "PENDING_REPLACE"
}
export declare enum TimeInForce {
    GTC = "GTC",
    IOC = "IOC",
    FOK = "FOK",
    GTX = "GTX",
    DAY = "DAY"
}
export declare enum OrderSource {
    SIGNAL = "signal",
    MANUAL = "manual",
    ALGORITHM = "algorithm",
    COPY_TRADING = "copy_trading",
    GRID_TRADING = "grid_trading",
    DCA = "dca",
    API = "api"
}
export declare enum OrderPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class Order {
    uuid: string;
    userId: Types.ObjectId;
    exchange: Exchange;
    symbol: string;
    side: OrderSide;
    type: OrderType;
    status: OrderStatus;
    timeInForce: TimeInForce;
    source: OrderSource;
    priority: OrderPriority;
    quantity: number;
    price?: number;
    stopPrice?: number;
    takeProfitPrice?: number;
    stopLossPrice?: number;
    filledQuantity: number;
    averagePrice: number;
    totalFees: number;
    exchangeOrderId?: string;
    clientOrderId?: string;
    originalClientOrderId?: string;
    submittedAt?: Date;
    filledAt?: Date;
    canceledAt?: Date;
    expiredAt?: Date;
    signalId?: string;
    alertId?: string;
    strategyId?: string;
    metadata?: {
        exchangeData?: Record<string, any>;
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
        execution?: {
            slippage?: number;
            latency?: number;
            retryCount?: number;
            errorMessages?: string[];
        };
        custom?: Record<string, any>;
    };
    tags: string[];
    notes?: string;
    maxRiskAmount?: number;
    positionSize?: number;
    parentOrderId?: string;
    childOrderIds: string[];
    pnl?: number;
    pnlPercentage?: number;
    pnlCalculatedAt?: Date;
    isPaperTrade: boolean;
    isBacktest: boolean;
    complianceNotes?: string;
    auditTrail: string[];
    validUntil?: Date;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;
    lastError?: string;
    errorDetails?: Record<string, any>;
    webhookSent: boolean;
    webhookSentAt?: Date;
    notificationSent: boolean;
    notificationSentAt?: Date;
}
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, Document<unknown, any, Order, any, {}> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, import("mongoose").FlatRecord<Order>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
