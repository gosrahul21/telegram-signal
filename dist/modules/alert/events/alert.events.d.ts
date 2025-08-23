import { Alert } from '../alert.entity';
export interface BaseAlertEvent {
    timestamp: Date;
}
export interface AlertCreatedEvent extends BaseAlertEvent {
    alert: Alert;
}
export interface AlertUpdatedEvent extends BaseAlertEvent {
    alert: Alert;
    previousData?: Partial<Alert>;
}
export interface AlertDeletedEvent extends BaseAlertEvent {
    alertId: string;
    userId: string;
}
export interface AlertTriggeredEvent extends BaseAlertEvent {
    alert: Alert;
    triggerData: any;
}
export interface AlertStatusChangedEvent extends BaseAlertEvent {
    alert: Alert;
    previousStatus: boolean;
    newStatus: boolean;
}
export interface CustomAlertEvent extends BaseAlertEvent {
    eventName: string;
    data: any;
}
export declare const ALERT_EVENTS: {
    readonly CREATED: "alert.created";
    readonly UPDATED: "alert.updated";
    readonly DELETED: "alert.deleted";
    readonly TRIGGERED: "alert.triggered";
    readonly STATUS_CHANGED: "alert.status.changed";
};
export type AlertEventName = typeof ALERT_EVENTS[keyof typeof ALERT_EVENTS];
