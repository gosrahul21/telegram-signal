import { MonitorEventType, Timeframe } from '@/modules/alert';
export declare class Monitoring {
    symbol: string;
    timeframe: Timeframe;
    eventType: MonitorEventType;
    count: string | 'INFINITE';
    monitoringInterval: NodeJS.Timeout;
}
export declare const MonitoringSchema: import("mongoose").Schema<Monitoring, import("mongoose").Model<Monitoring, any, any, any, import("mongoose").Document<unknown, any, Monitoring, any, {}> & Monitoring & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Monitoring, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Monitoring>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Monitoring> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export type MonitoringDocument = Monitoring & Document;
