import { Document, Types } from 'mongoose';
export type AlertDocument = Alert & Document;
export declare enum AlertType {
    LIMIT = "limit",
    BOLLINGER_BANDS = "bollinger_bands",
    EMA = "ema_crossover",
    RSI = "rsi",
    MACD = "macd",
    STOCHASTIC = "stochastic",
    VOLUME = "volume",
    PRICE_ACTION = "price_action"
}
export declare enum Timeframe {
    ONE_MINUTE = "1m",
    FIVE_MINUTES = "5m",
    FIFTEEN_MINUTES = "15m",
    THIRTY_MINUTES = "30m",
    ONE_HOUR = "1h",
    FOUR_HOURS = "4h",
    ONE_DAY = "1d"
}
export declare class Alert {
    symbol: string;
    userId: Types.ObjectId;
    type: AlertType;
    count: number;
    uuid: string;
    timeframe: Timeframe;
    isActive: boolean;
    conditions: Record<string, any>;
    lastTriggered?: Date;
    triggerCount: number;
    description?: string;
    tags: string[];
    metadata?: Record<string, any>;
}
export declare const AlertSchema: import("mongoose").Schema<Alert, import("mongoose").Model<Alert, any, any, any, Document<unknown, any, Alert> & Alert & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Alert, Document<unknown, {}, import("mongoose").FlatRecord<Alert>> & import("mongoose").FlatRecord<Alert> & {
    _id: Types.ObjectId;
}>;
