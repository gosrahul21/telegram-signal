import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AlertDocument = Alert & Document;

/**
 * This is the type of event that will trigger the alert or order
 */
export enum MonitorEventType {
  LIMIT = 'limit',
  BOLLINGER_BANDS_LOW = 'bollinger_bands_low',
  BOLLINGER_BANDS_HIGH = 'bollinger_bands_high',
  EMA_LOW = 'ema_crossover_low',
  EMA_HIGH = 'ema_crossover_high',
  RSI_LOW = 'rsi_low',
  RSI_CROSSOVER_HIGH = 'rsi_crossover_high',
  MACD_CROSSOVER_LOW = 'macd_crossover_low',
  MACD_CROSSOVER_HIGH = 'macd_crossover_high',
  // STOCHASTIC_LOW = 'stochastic_low',
  // STOCHASTIC_CROSSOVER_HIGH = 'stochastic_crossover_high',
  // VOLUME_LOW = 'volume_low',
  // VOLUME_HIGH = 'volume_high',
  // PRICE_ACTION_LOW = 'price_action_low',
  // PRICE_ACTION_HIGH = 'price_action_high',
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

  @Prop({ required: true, enum: MonitorEventType })
  eventType: MonitorEventType;

  @Prop({ required: true, min: 1})
  count: number; // max number of times the alert to triggered

  @Prop({ required: true, unique: true, default: () => uuidv4() })
  uuid: string;

  @Prop({ required: true, enum: Timeframe })
  timeframe: Timeframe;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: false })
  infinite: boolean; // if true, the alert will never expire

  @Prop({ type: Object })
  conditions: Record<string, any>;

  @Prop({ type: Date })
  lastTriggered?: Date;

  @Prop({ type: Number, default: 0 })
  triggerCount: number; // number of times the alert has been triggered

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
