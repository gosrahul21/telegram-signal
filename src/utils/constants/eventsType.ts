export enum EventsType {
  ALERT_TRIGGERED_USER = 'alert.user.triggered',
  ALERT_TRIGGERED_ORDER = 'alert.order.triggered',
  ALERT_CREATED = 'alert.created',
  ALERT_UPDATED = 'alert.updated',
  ALERT_DELETED = 'alert.deleted',

  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_FILLED = 'order.filled',

  NOTIFICATION_CREATED = 'notification.created',
  NOTIFICATION_UPDATED = 'notification.updated',


  MONITORING_TRIGGERED = 'monitoring.triggered',
}