import { AlertFor } from '@/utils/types/AlertFor';
import { Document, Types } from 'mongoose';
export type AlertDocument = Alert & Document;
export declare enum MonitorEventType {
    LIMIT = "limit",
    BOLLINGER_BANDS_LOW = "bollinger_bands_low",
    BOLLINGER_BANDS_HIGH = "bollinger_bands_high",
    EMA_LOW = "ema_crossover_low",
    EMA_HIGH = "ema_crossover_high",
    RSI_LOW = "rsi_low",
    RSI_CROSSOVER_HIGH = "rsi_crossover_high",
    MACD_CROSSOVER_LOW = "macd_crossover_low",
    MACD_CROSSOVER_HIGH = "macd_crossover_high"
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
    eventType: MonitorEventType;
    count: number;
    uuid: string;
    timeframe: Timeframe;
    isActive: boolean;
    infinite: boolean;
    conditions: Record<string, any>;
    lastTriggered?: Date;
    triggerCount: number;
    description?: string;
    alertFor: AlertFor;
    tags: string[];
    metadata?: Record<string, any>;
}
export declare const AlertSchema: import("mongoose").Schema<Alert, import("mongoose").Model<Alert, any, any, any, Document<unknown, any, Alert> & Alert & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Alert, Document<unknown, {}, import("mongoose").FlatRecord<Alert>> & import("mongoose").FlatRecord<Alert> & {
    _id: Types.ObjectId;
}>;
