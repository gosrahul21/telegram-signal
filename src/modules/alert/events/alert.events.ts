import { Alert, MonitorEventType } from '../alert.entity';

// Base event interface
export interface BaseAlertEvent {
  timestamp: Date;
}

// Alert created event
export interface AlertCreatedEvent extends BaseAlertEvent, Alert {
  // alert: Alert;
}

// Alert updated event
export interface AlertUpdatedEvent extends BaseAlertEvent, Alert {

}

// Alert deleted event
export interface AlertDeletedEvent extends BaseAlertEvent {
  alertId: string;
  userId: string;
  symbol: string;
  timeframe: string;
  eventType: MonitorEventType;
  count: number | string;
}

// Alert triggered event
export interface AlertTriggeredEvent extends BaseAlertEvent {
  alert: Alert;
  triggerData: any;
}

// Alert status changed event
export interface AlertStatusChangedEvent extends BaseAlertEvent {
  alert: Alert;
  previousStatus: boolean;
  newStatus: boolean;
}

// Custom alert event
export interface CustomAlertEvent extends BaseAlertEvent {
  eventName: string;
  data: any;
}

// Event names constants
export const ALERT_EVENTS = {
  CREATED: 'alert.created',
  UPDATED: 'alert.updated',
  DELETED: 'alert.deleted',
  TRIGGERED: 'alert.triggered',
  STATUS_CHANGED: 'alert.status.changed',
} as const;

export type AlertEventName = typeof ALERT_EVENTS[keyof typeof ALERT_EVENTS];
