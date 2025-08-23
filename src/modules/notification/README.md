# Notification Module

This module is responsible for sending Telegram notifications and WebSocket responses to connected users.

## Features

- **Telegram Notifications**: Send messages to users via Telegram bot
- **WebSocket Support**: Real-time communication with connected clients
- **Multi-channel Notifications**: Send notifications through both Telegram and WebSocket simultaneously
- **Room-based Broadcasting**: Broadcast messages to users subscribed to specific symbols/types
- **Connection Management**: Track and manage WebSocket connections

## Components

### NotificationService

Handles Telegram notifications and WebSocket message sending.

### NotificationGateway

WebSocket gateway for real-time communication with clients.

### NotificationController

HTTP endpoints for sending notifications programmatically.

## API Endpoints

### Telegram Notifications

#### Send to Single User

```http
POST /notifications/telegram
Content-Type: application/json

{
  "userId": "123456789",
  "message": "Hello from the bot!",
  "type": "general"
}
```

#### Send to Multiple Users

```http
POST /notifications/telegram/bulk
Content-Type: application/json

{
  "userIds": ["123456789", "987654321"],
  "message": "Broadcast message to all users"
}
```

#### Send Signal Notification

```http
POST /notifications/signal
Content-Type: application/json

{
  "userId": "123456789",
  "signalData": {
    "symbol": "BTCUSDT",
    "type": "BUY",
    "price": "45000",
    "rsi": "30",
    "description": "RSI oversold signal"
  }
}
```

#### Send Alert Notification

```http
POST /notifications/alert
Content-Type: application/json

{
  "userId": "123456789",
  "alertData": {
    "symbol": "BTCUSDT",
    "condition": "Price above $50,000",
    "price": "51000",
    "message": "Price alert triggered"
  }
}
```

#### Send Status Notification

```http
POST /notifications/status
Content-Type: application/json

{
  "userId": "123456789",
  "statusData": {
    "symbol": "BTCUSDT",
    "status": "Monitoring",
    "price": "45000",
    "details": "RSI: 45, MACD: Bullish"
  }
}
```

### WebSocket Operations

#### Broadcast to All Connected Users

```http
POST /notifications/websocket/broadcast
Content-Type: application/json

{
  "message": {
    "type": "system",
    "data": "System maintenance in 5 minutes"
  }
}
```

#### Send to Specific User

```http
POST /notifications/websocket/user/123456789
Content-Type: application/json

{
  "message": {
    "type": "personal",
    "data": "Your portfolio has been updated"
  }
}
```

#### Broadcast to Symbol Subscribers

```http
POST /notifications/websocket/broadcast-symbol
Content-Type: application/json

{
  "symbol": "BTCUSDT",
  "type": "signal",
  "message": {
    "action": "BUY",
    "price": "45000",
    "confidence": "85%"
  }
}
```

### Connection Information

#### Get Connected Users Count

```http
GET /notifications/websocket/connections/count
```

#### Get Connected User IDs

```http
GET /notifications/websocket/connections/users
```

## WebSocket Client Usage

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000');

// Authenticate with user ID
socket.emit('authenticate', { userId: '123456789' });

socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
});
```

### Subscribe to Symbol/Type

```javascript
// Subscribe to BTCUSDT signals
socket.emit('subscribe', { symbol: 'BTCUSDT', type: 'signal' });

socket.on('subscribed', (data) => {
  console.log('Subscribed to:', data);
});

// Listen for signals
socket.on('signal', (data) => {
  console.log('Received signal:', data);
});
```

### Unsubscribe

```javascript
socket.emit('unsubscribe', { symbol: 'BTCUSDT', type: 'signal' });

socket.on('unsubscribed', (data) => {
  console.log('Unsubscribed from:', data);
});
```

### Ping/Pong

```javascript
socket.emit('ping');

socket.on('pong', (data) => {
  console.log('Pong received at:', data.timestamp);
});
```

## Message Types

### Signal Messages

- **type**: 'signal'
- **data**: Signal information (symbol, action, price, RSI, etc.)

### Alert Messages

- **type**: 'alert'
- **data**: Alert information (symbol, condition, price, message)

### Status Messages

- **type**: 'status'
- **data**: Status information (symbol, status, price, details)

### General Messages

- **type**: 'general'
- **data**: Any general information

## Error Handling

The service includes comprehensive error handling:

- Failed Telegram notifications are logged
- Failed WebSocket connections are automatically removed
- All operations return success/failure status
- Detailed logging for debugging

## Dependencies

- `@nestjs/common`: Core NestJS functionality
- `@nestjs/websockets`: WebSocket support
- `@nestjs/platform-socket.io`: Socket.IO integration
- `grammy`: Telegram bot API
- `socket.io`: WebSocket library

## Integration

To use this module in other parts of your application:

```typescript
import { NotificationService } from './modules/notification';

@Injectable()
export class SomeService {
  constructor(private notificationService: NotificationService) {}

  async sendNotification() {
    await this.notificationService.sendTelegramNotification(
      '123456789',
      'Hello from service!',
    );
  }
}
```

## Environment Variables

Make sure you have the following environment variables set:

- `BOT_TOKEN`: Your Telegram bot token
