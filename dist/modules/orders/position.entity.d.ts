import { Types } from 'mongoose';
import { OrderSide } from './orders.entity';
export declare class Position {
    uuid: string;
    userId: Types.ObjectId;
    creatorOrderId: Types.ObjectId;
    exchangeId: Types.ObjectId;
    symbol: string;
    side: OrderSide;
    quantity: number;
    openPrice: number;
    closePrice?: number;
    pnl?: number;
    pnlPercentage?: number;
    pnlCalculatedAt?: Date;
    closedAt?: Date;
}
export declare const PositionSchema: import("mongoose").Schema<Position, import("mongoose").Model<Position, any, any, any, import("mongoose").Document<unknown, any, Position, any, {}> & Position & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Position, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Position>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Position> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export type PositionDocument = Position & Document;
