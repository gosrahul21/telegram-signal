# Bot Notification Implementation

## Overview

This document explains the implementation of Telegram notifications in the **Bot Module**. The Bot Module now listens for notifications emitted from the notification service and sends Telegram messages to users who have a `telegramId` in their user entity.

## Architecture

```
┌─────────────────────┐    ┌─────────────────────────────┐    ┌─────────────────────┐
│   Your Service      │    │   Event Emitter             │    │   Notification      │
│   (Monitoring,      │───▶│   (EventsType.*)            │    │   Service           │
│    Orders, etc.)    │    │                             │    │                     │
└─────────────────────┘    └─────────────────────────────┘    └─────────────────────┘
                                      │
                                      ▼
                           ┌─────────────────────────────┐
                           │   Event Listeners           │
                           │                             │
                           │   • SocketListenerService   │
                           │   • BotNotificationListener │
                           │   • NotificationService     │
                           └─────────────────────────────┘
                                      │
                                      ▼
                           ┌─────────────────────────────┐
                           │   Delivery Channels         │
                           │                             │
                           │   • WebSocket (Real-time)   │
                           │   • Telegram (Push)         │
                           │   • Database (Persistence)  │
                           └─────────────────────────────┘
```

## Answer to Your Question

**The Bot Module now listens for notifications emitted from the notification service and sends Telegram messages to users with `telegramId`.**

### Key Features

1. **Event-Driven**: Bot Module listens to the same events as other services
2. **User Lookup**: Automatically looks up users by `userId` and checks for `telegramId`
3. **Type Matching**: Matches notification types and formats messages accordingly
4. **Error Handling**: Comprehensive error handling and logging
5. **Rich Formatting**: Beautiful messages with emojis and HTML formatting

## Implementation Details

### 1. BotNotificationListenerService

**Location**: `src/modules/bot/bot-notification-listener.service.ts`

This service listens to notification events and sends formatted Telegram messages.

**Key Features**:

- Listens to `NOTIFICATION_CREATED`, `ALERT_TRIGGERED_USER`, `ORDER_UPDATED`, `ALERT_TRIGGERED_ORDER` events
- Looks up users by `userId` and checks for `telegramId`
- Matches notification types and formats messages accordingly
- Uses `telegramId` as `chatId` for sending messages
- Comprehensive error handling and logging

### 2. Enhanced BotService

**Location**: `src/modules/bot/bot.service.ts`

The BotService already has methods for sending messages:

- `sendMessage()` - Send basic message
- `sendBulkMessage()` - Send to multiple users
- `sendSignalMessage()` - Send formatted signal alerts
- `sendAlertMessage()` - Send formatted alert notifications

### 3. User Entity Integration

**Location**: `src/modules/user/entities/user.entity.ts`

The User entity has:

- `telegramId` - User's Telegram ID (used as chatId)
- `chatId` - Alternative chat ID field

## Notification Type Matching

The BotNotificationListenerService matches different notification types and formats them accordingly:

### 1. ALERT_TRIGGERED

```
🔴 SELL SIGNAL - BTCUSDT

🎯 Alert Type: RSI_OVERBOUGHT
⏱️ Timeframe: 1h
🆔 Alert ID: alert_1234567890

💰 Current Price: $43500.5
📈 RSI: 72.5
📊 Volume: 1,250,000

⏰ Time: 12/25/2023, 2:30:45 PM

⚠️ This is an automated alert. Please do your own research before trading.
```

### 2. ORDER_STATUS

```
✅ Order Update - BTCUSDT

🆔 Order ID: order_1234567890
📊 Status: FILLED
📈 Side: BUY
📦 Quantity: 0.1
💰 Price: $43500.0
⏰ Time: 12/25/2023, 2:30:45 PM
```

### 3. PRICE_TARGET

```
🎯 Price Target - BTCUSDT

🎯 Target: $45000
📊 Current: $43500.5
📈 Direction: BELOW
⏰ Time: 12/25/2023, 2:30:45 PM
```

### 4. TECHNICAL_INDICATOR

```
🟢 Technical Signal - BTCUSDT

📊 Indicator: RSI
🎯 Signal: BUY
💰 Price: $42000
📈 Value: Oversold
⏰ Time: 12/25/2023, 2:30:45 PM
```

### 5. MARKET_ALERT

```
🚨 Market Alert

Bitcoin Market Update

Major market movement detected in BTCUSDT

📊 Affected: BTCUSDT, ETHUSDT
⏰ Time: 12/25/2023, 2:30:45 PM
```

### 6. GENERAL

```
📢 General Notification

Welcome to our trading platform!

⏰ Time: 12/25/2023, 2:30:45 PM
```

## Usage Examples

### 1. Sending Alert Notifications

```typescript
// In any service
constructor(private eventEmitter: EventEmitter2) {}

async triggerAlert(userId: string, symbol: string) {
  this.eventEmitter.emit(EventsType.ALERT_TRIGGERED_USER, {
    userId,
    symbol,
    eventType: 'RSI_OVERBOUGHT',
    timeframe: '1h',
    alertId: `alert_${Date.now()}`,
    price: 43500.5,
    rsi: 72.5,
    priority: 'high',
  });
}
```

### 2. Sending Order Updates

```typescript
async updateOrder(userId: string, orderData: any) {
  this.eventEmitter.emit(EventsType.ORDER_UPDATED, {
    userId,
    orderId: orderData.orderId,
    symbol: orderData.symbol,
    status: orderData.status,
    side: orderData.side,
    quantity: orderData.quantity,
    price: orderData.price,
  });
}
```

### 3. Sending General Notifications

```typescript
async sendNotification(userId: string, title: string, message: string) {
  this.eventEmitter.emit(EventsType.NOTIFICATION_CREATED, {
    userId,
    type: 'GENERAL',
    priority: 'MEDIUM',
    title,
    message,
  });
}
```

## Configuration

### Module Setup

The `BotModule` now includes:

- `BotService` - Handles Telegram bot operations
- `BotNotificationListenerService` - Listens for notifications and sends Telegram messages
- `UserModule` - For user lookup and telegramId mapping

### Event Emitter

Make sure `EventEmitterModule.forRoot()` is imported in your `AppModule`.

## Error Handling

The system includes comprehensive error handling:

- User not found or no telegramId
- Telegram API errors
- Network connectivity issues
- Message formatting errors

All errors are logged but don't break the notification flow.

## Benefits

1. **Centralized Bot Logic**: All Telegram functionality is in the Bot Module
2. **Event-Driven**: Consistent with your existing architecture
3. **Type Matching**: Different notification types get appropriate formatting
4. **User-Centric**: Only sends to users with telegramId
5. **Error Resilient**: Continues working even if Telegram fails
6. **Maintainable**: Clear separation of concerns

## Testing

You can test the system using the existing test endpoints in `NotificationController`:

- `POST /notifications/test/sample-alert`
- `POST /notifications/test/price-alert`
- `POST /notifications/test/order-update`

## Flow Summary

1. **Service emits event** (e.g., `ALERT_TRIGGERED_USER`)
2. **BotNotificationListenerService** receives the event
3. **User lookup** by `userId` to get `telegramId`
4. **Type matching** to determine message format
5. **Message formatting** with appropriate emojis and structure
6. **Telegram sending** using `BotService.sendMessage()`
7. **Logging** of success/failure

## Future Enhancements

1. **User Preferences**: Allow users to disable specific notification types
2. **Message Templates**: Customizable message formats per user
3. **Rate Limiting**: Prevent spam notifications
4. **Delivery Status**: Track message delivery success/failure
5. **Rich Media**: Support for images, charts, and buttons
6. **Scheduling**: Delayed or scheduled notifications

## Conclusion

The Bot Module now perfectly handles Telegram notifications by:

- Listening for events from the notification service
- Looking up users by `userId` and checking for `telegramId`
- Matching notification types and formatting messages accordingly
- Sending beautiful, formatted messages via Telegram
- Providing comprehensive error handling and logging

This implementation ensures that users with `telegramId` receive all relevant notifications through Telegram while maintaining the event-driven architecture of your application.

