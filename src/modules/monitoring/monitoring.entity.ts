import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MonitorEventType, Timeframe } from '../alert';

@Schema({ timestamps: true })
export class Monitoring {

  @Prop({ required: true, type: String })
  symbol: string;

  @Prop({ required: true, type: String })
  timeframe: Timeframe;

  @Prop({ required: true, enum: MonitorEventType })
  eventType: MonitorEventType;

  @Prop({ required: true, type: Number })
  count: number | 'INFINITE';

  monitoringInterval: NodeJS.Timeout;
}


export const MonitoringSchema = SchemaFactory.createForClass(Monitoring);
export type MonitoringDocument = Monitoring & Document;