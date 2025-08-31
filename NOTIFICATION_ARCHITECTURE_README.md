# Notification Architecture - Event-Driven Design

## Overview

The notification system has been redesigned with a clean, event-driven architecture that separates concerns properly. Notifications are now saved to the database through dedicated event listeners in the notification service, while WebSocket delivery is handled separately by the socket service.

## Architecture Diagram

```
┌─────────────────────┐    ┌─────────────────────────────┐    ┌─────────────────────┐
│   Monitoring        │    │   Notification              │    │   Socket            │
│   Service           │    │   Event Listener            │    │   Service           │
│                     │    │                             │    │                     │
│   Emits Events      │───▶│   Listens to Events        │    │   WebSocket         │
│   (Alert, Price,    │    │   Saves to Database        │    │   Delivery          │
│    Technical, etc.) │    │                             │    │                     │
└─────────────────────┘    └─────────────────────────────┘    └─────────────────────┘
                                    │
                                    ▼
                           ┌─────────────────────┐
                           │   MongoDB           │
                           │   Notifications    │
                           │   Collection       │
                           └─────────────────────┘
```

## Key Components

### 1. **Notification Event Listener Service** (`NotificationEventListenerService`)

- **Location**: `src/modules/notification/notification-event-listener.service.ts`
- **Purpose**: Listens to all notification events and saves them to the database
- **Responsibility**: Database persistence of notifications
- **Events Handled**:
  - `ALERT_TRIGGERED` - Trading alerts
  - `PRICE_TARGET` - Price level notifications
  - `TECHNICAL_INDICATOR` - Technical analysis signals
  - `ORDER_STATUS` - Order updates
  - `MARKET_ALERT` - Market-wide alerts

### 2. **Socket Listener Service** (`SocketListenerService`)

- **Location**: `src/modules/socket/socket-listener.service.ts`
- **Purpose**: Handles real-time WebSocket delivery of notifications
- **Responsibility**: WebSocket message delivery to connected users
- **Events Handled**: Same events as above, but for WebSocket delivery only

### 3. **Notification Persistence Service** (`NotificationPersistenceService`)

- **Location**: `src/modules/notification/notification-persistence.service.ts`
- **Purpose**: Handles all database operations for notifications
- **Responsibility**: CRUD operations, queries, statistics

## Event Flow

### 1. **Event Emission**

```typescript
// In MonitoringService or other services
this.eventEmitter.emit(NOTIFICATION_EVENTS.ALERT_TRIGGERED, {
  alert: alertData,
  triggerData: triggerInfo,
  timestamp: new Date(),
});
```

### 2. **Event Handling**

```typescript
// NotificationEventListenerService automatically saves to database
@OnEvent(NOTIFICATION_EVENTS.ALERT_TRIGGERED)
async handleAlertTriggered(event: AlertTriggeredNotificationEvent) {
  // Save notification to database
  await this.notificationPersistenceService.createNotification({...});
}

// SocketListenerService automatically sends via WebSocket
@OnEvent(NOTIFICATION_EVENTS.ALERT_TRIGGERED)
async handleAlertTriggered(event: AlertTriggeredNotificationEvent) {
  // Send via WebSocket if user is connected
  this.socketService.emitToUser(userId, 'alert_triggered', message);
}
```

### 3. **Dual Delivery**

- **Database**: Notification is saved for later retrieval
- **WebSocket**: Real-time delivery to connected users

## Benefits of This Architecture

### 1. **Separation of Concerns**

- **Notification Service**: Handles database persistence
- **Socket Service**: Handles real-time delivery
- **Monitoring Service**: Emits events without knowing about delivery

### 2. **Scalability**

- Database operations are independent of WebSocket delivery
- Can easily add more delivery channels (email, SMS, push notifications)
- Event listeners can be scaled independently

### 3. **Reliability**

- Notifications are saved even if WebSocket delivery fails
- Database persistence continues even if socket service is down
- Graceful degradation ensures no data loss

### 4. **Maintainability**

- Clear separation of responsibilities
- Easy to modify notification logic without affecting delivery
- Easy to add new notification types

## Implementation Details

### Event Listener Registration

```typescript
// Automatically registered when NotificationEventListenerService is instantiated
@OnEvent(NOTIFICATION_EVENTS.ALERT_TRIGGERED)
async handleAlertTriggered(event: AlertTriggeredNotificationEvent) {
  // Handle alert triggered event
}

@OnEvent(NOTIFICATION_EVENTS.PRICE_TARGET)
async handlePriceTarget(event: PriceTargetNotificationEvent) {
  // Handle price target event
}
```

### Database Persistence

```typescript
// Notification is automatically saved with proper metadata
await this.notificationPersistenceService.createNotification({
  userId: event.userId,
  type: NotificationType.ALERT_TRIGGERED,
  title: `Alert Triggered: ${event.symbol}`,
  message: `Alert triggered for ${event.symbol}`,
  data: event.data,
  priority: NotificationPriority.HIGH,
  isPersistent: true,
  tags: ['alert', 'triggered', event.symbol],
});
```

### WebSocket Delivery

```typescript
// Real-time delivery to connected users
const sent = this.socketService.emitToUser(userId, 'alert_triggered', message);
if (sent) {
  this.logger.log(`Alert sent to user ${userId}`);
} else {
  this.logger.warn(`User ${userId} not connected`);
}
```

## Configuration

### Module Setup

```typescript
// notification.module.ts
@Module({
  imports: [
    EventEmitterModule.forRoot(), // Required for event handling
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [
    NotificationService,
    NotificationPersistenceService,
    NotificationEventListenerService, // Event listener
  ],
  exports: [
    NotificationService,
    NotificationPersistenceService,
    NotificationEventListenerService,
  ],
})
export class NotificationModule {}
```

### Event Emitter Configuration

```typescript
// app.module.ts
@Module({
  imports: [
    EventEmitterModule.forRoot(), // Global event emitter
    // ... other modules
  ],
})
export class AppModule {}
```

## Usage Examples

### Emitting Events

```typescript
// In any service that needs to send notifications
constructor(private eventEmitter: EventEmitter2) {}

async triggerAlert(alert: Alert, data: any) {
  this.eventEmitter.emit(NOTIFICATION_EVENTS.ALERT_TRIGGERED, {
    alert,
    triggerData: data,
    timestamp: new Date()
  });
}
```

### Manual Notification Creation

```typescript
// Using the event listener service directly
constructor(private notificationEventListener: NotificationEventListenerService) {}

async createCustomNotification(userId: string, message: string) {
  await this.notificationEventListener.createNotification({
    userId,
    type: NotificationType.GENERAL,
    title: 'Custom Notification',
    message,
    priority: NotificationPriority.MEDIUM
  });
}
```

### Broadcast Notifications

```typescript
// Send to multiple users
await this.notificationEventListener.createBroadcastNotification(
  {
    type: NotificationType.MARKET_ALERT,
    title: 'Market Update',
    message: 'Important market information',
    priority: NotificationPriority.HIGH,
  },
  ['user1', 'user2', 'user3'],
);
```

## Event Types and Handling

### Alert Triggered Events

- **Event**: `NOTIFICATION_EVENTS.ALERT_TRIGGERED`
- **Handler**: `handleAlertTriggered()`
- **Persistence**: Always saved (persistent)
- **WebSocket**: Sent to specific user if connected

### Price Target Events

- **Event**: `NOTIFICATION_EVENTS.PRICE_TARGET`
- **Handler**: `handlePriceTarget()`
- **Persistence**: Temporarily saved (expires in 24 hours)
- **WebSocket**: Broadcast to all connected users

### Technical Indicator Events

- **Event**: `NOTIFICATION_EVENTS.TECHNICAL_INDICATOR`
- **Handler**: `handleTechnicalIndicator()`
- **Persistence**: Temporarily saved (expires in 12 hours)
- **WebSocket**: Broadcast to all connected users

### Order Status Events

- **Event**: `NOTIFICATION_EVENTS.ORDER_STATUS`
- **Handler**: `handleOrderStatus()`
- **Persistence**: Always saved (persistent)
- **WebSocket**: Broadcast to all connected users

### Market Alert Events

- **Event**: `NOTIFICATION_EVENTS.MARKET_ALERT`
- **Handler**: `handleMarketAlert()`
- **Persistence**: Always saved (persistent)
- **WebSocket**: Broadcast to all connected users

## Error Handling

### Database Errors

```typescript
try {
  await this.notificationPersistenceService.createNotification(createDto);
} catch (error) {
  this.logger.error('Error creating notification:', error);
  // Notification creation failed, but WebSocket delivery continues
}
```

### WebSocket Errors

```typescript
try {
  const sent = this.socketService.emitToUser(userId, event, data);
  if (!sent) {
    this.logger.warn(`User ${userId} not connected`);
  }
} catch (error) {
  this.logger.error('Error sending WebSocket message:', error);
  // WebSocket delivery failed, but notification is saved in database
}
```

## Monitoring and Debugging

### Event Logging

```typescript
// All events are logged for debugging
this.logger.log(`Alert triggered event received for ${event.symbol}`);
this.logger.log(`Notification saved for user ${userId}`);
this.logger.log(`WebSocket message sent to user ${userId}`);
```

### Performance Monitoring

```typescript
// Track notification creation and delivery
const startTime = Date.now();
await this.notificationPersistenceService.createNotification(createDto);
const dbTime = Date.now() - startTime;

const wsStartTime = Date.now();
const sent = this.socketService.emitToUser(userId, event, data);
const wsTime = Date.now() - wsStartTime;

this.logger.log(`DB: ${dbTime}ms, WS: ${wsTime}ms`);
```

## Future Enhancements

### 1. **Additional Delivery Channels**

- Email notifications
- Push notifications
- SMS alerts
- Slack/Discord integration

### 2. **User Preferences**

- Notification frequency controls
- Channel preferences
- Symbol-specific settings

### 3. **Advanced Targeting**

- User segmentation
- Behavioral targeting
- Geographic targeting

### 4. **Analytics and Insights**

- Delivery success rates
- User engagement metrics
- Performance monitoring

## Best Practices

### 1. **Event Design**

- Use descriptive event names
- Include all necessary data in events
- Keep events focused and single-purpose

### 2. **Error Handling**

- Always wrap database operations in try-catch
- Log errors for debugging
- Continue processing even if one operation fails

### 3. **Performance**

- Use async/await for database operations
- Batch operations when possible
- Monitor execution times

### 4. **Testing**

- Test event emission and handling separately
- Mock external dependencies
- Test error scenarios

## Troubleshooting

### Common Issues

1. **Events Not Being Handled**
   - Check EventEmitterModule is imported
   - Verify event names match exactly
   - Check service is properly registered

2. **Notifications Not Being Saved**
   - Check MongoDB connection
   - Verify NotificationEventListenerService is running
   - Check for database errors in logs

3. **WebSocket Messages Not Delivered**
   - Check user connection status
   - Verify socket service is working
   - Check for WebSocket errors in logs

### Debug Commands

```typescript
// Check if event listener is working
this.logger.log('Event listener service initialized');

// Check event emission
this.logger.log(`Emitting event: ${NOTIFICATION_EVENTS.ALERT_TRIGGERED}`);

// Check database operations
this.logger.log(`Notification saved: ${notification.uuid}`);

// Check WebSocket delivery
this.logger.log(`WebSocket message sent: ${sent}`);
```

## Support

For issues or questions:

1. Check event emitter configuration
2. Verify notification event listener service is running
3. Monitor notification persistence logs
4. Check WebSocket connection status
5. Review event emission and handling flow
