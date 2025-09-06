import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  ALERT_TRIGGERED = 'alert_triggered',
  PRICE_TARGET = 'price_target',
  TECHNICAL_INDICATOR = 'technical_indicator',
  ORDER_STATUS = 'order_status',
  MARKET_ALERT = 'market_alert',
  MONITORING_STATUS = 'monitoring_status',
  ALERT_MONITORING_UPDATE = 'alert_monitoring_update',
  GENERAL = 'general',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Schema({ timestamps: true })
export class Notification {
  _id?: Types.ObjectId;

  @Prop({ required: true, unique: true, default: () => uuidv4() })
  uuid: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({
    required: true,
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @Prop({
    required: true,
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop({ type: String })
  symbol?: string;

  @Prop({ type: String })
  timeframe?: string;

  @Prop({ type: String })
  eventType?: string;

  @Prop({ type: String })
  alertId?: string;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  isPersistent: boolean; // Whether to keep this notification after user reads it

  @Prop({ type: Date })
  expiresAt?: Date; // When this notification should be automatically cleaned up

  createdAt?: Date;
  
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for better query performance
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ symbol: 1, type: 1 });
NotificationSchema.index({ status: 1, createdAt: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup
