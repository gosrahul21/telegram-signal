import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AlertDocument = Alert & Document;

export enum AlertType {
  LIMIT = 'limit',
  BOLLINGER_BANDS = 'bollinger_bands',
  EMA = 'ema_crossover',
  RSI = 'rsi',
  MACD = 'macd',
  STOCHASTIC = 'stochastic',
  VOLUME = 'volume',
  PRICE_ACTION = 'price_action',
}

export enum Timeframe {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
}

@Schema({ timestamps: true })
export class Alert {
  @Prop({ required: true, type: String })
  symbol: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: AlertType })
  type: AlertType;

  @Prop({ required: true, min: 1, max: 10 })
  count: number;

  @Prop({ required: true, unique: true, default: () => uuidv4() })
  uuid: string;

  @Prop({ required: true, enum: Timeframe })
  timeframe: Timeframe;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: Object })
  conditions: Record<string, any>;

  @Prop({ type: Date })
  lastTriggered?: Date;

  @Prop({ type: Number, default: 0 })
  triggerCount: number;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);

// Indexes for better query performance
AlertSchema.index({ symbol: 1, timeframe: 1 });
AlertSchema.index({ userId: 1, isActive: 1 });
AlertSchema.index({ type: 1, isActive: 1 });
AlertSchema.index({ uuid: 1 }, { unique: true });
