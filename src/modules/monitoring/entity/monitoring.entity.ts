import { MonitorEventType, Timeframe } from '@/modules/alert';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema({ timestamps: true })
export class Monitoring {

  @Prop({ required: true, type: String })
  symbol: string;

  @Prop({ required: true, type: String })
  timeframe: Timeframe;

  @Prop({ required: true, enum: MonitorEventType })
  eventType: MonitorEventType;

  @Prop({ required: true, type: String })
  count: string | 'INFINITE'; // number type string for infinite monitoring

  monitoringInterval: NodeJS.Timeout; // internal interval reference for monitoring
}


export const MonitoringSchema = SchemaFactory.createForClass(Monitoring);
export type MonitoringDocument = Monitoring & Document;