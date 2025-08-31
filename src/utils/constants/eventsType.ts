export enum EventsType {
  // EMITTED BY ALERT SERVICE one for notification and one for order  
  ALERT_TRIGGERED_USER = 'alert.user.triggered',
  ALERT_TRIGGERED_ORDER = 'alert.order.triggered',

  // EMITTED BY ALERT SERVICE
  ALERT_CREATED = 'alert.created',
  ALERT_UPDATED = 'alert.updated',
  ALERT_DELETED = 'alert.deleted',

  // EMITTED BY ORDER SERVICE
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_FILLED = 'order.filled',

  // EMITTED BY NOTIFICATION SERVICE
  NOTIFICATION_CREATED = 'notification.created',
  NOTIFICATION_UPDATED = 'notification.updated',

  // EMITTED BY MONITORING SERVICE
  MONITORING_TRIGGERED = 'monitoring.triggered',
}