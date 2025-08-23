# Alert System

This module provides a comprehensive alert system for cryptocurrency trading signals with MongoDB integration.

## Features

- **Multiple Alert Types**: Support for various technical indicators (RSI, EMA, Bollinger Bands, etc.)
- **Flexible Timeframes**: 1m, 5m, 15m, 30m, 1h, 4h, 1d
- **User Management**: Alerts are associated with specific users
- **Active/Inactive Status**: Toggle alerts on/off
- **Trigger Tracking**: Monitor how many times alerts have been triggered
- **Search & Filtering**: Advanced query capabilities
- **Tagging System**: Organize alerts with custom tags

## Alert Types

- `limit` - Price limit alerts
- `bollinger_bands` - Bollinger Bands breakouts
- `ema` - Exponential Moving Average crossovers
- `rsi` - Relative Strength Index signals
- `macd` - MACD crossovers
- `stochastic` - Stochastic oscillator signals
- `volume` - Volume-based alerts
- `price_action` - Price action patterns

## Timeframes

- `1m` - 1 minute
- `5m` - 5 minutes
- `15m` - 15 minutes
- `30m` - 30 minutes
- `1h` - 1 hour
- `4h` - 4 hours
- `1d` - 1 day

## API Endpoints

### Create Alert
```http
POST /api/alerts
```

### Get All Alerts
```http
GET /api/alerts
GET /api/alerts?symbol=BTCUSDT&type=rsi&timeframe=1h
```

### Get Active Alerts
```http
GET /api/alerts/active
```

### Get Alerts by Symbol
```http
GET /api/alerts/symbol/BTCUSDT
```

### Get Alerts by User
```http
GET /api/alerts/user/{userId}
```

### Get Single Alert
```http
GET /api/alerts/{id}
```

### Update Alert
```http
PATCH /api/alerts/{id}
```

### Toggle Alert Status
```http
PATCH /api/alerts/{id}/toggle
```

### Increment Trigger Count
```http
PATCH /api/alerts/{id}/increment-trigger
```

### Delete Alert
```http
DELETE /api/alerts/{id}
```

## Usage Examples

### Creating an RSI Alert
```typescript
const alertData = {
  symbol: 'BTCUSDT',
  userId: '507f1f77bcf86cd799439011',
  type: 'rsi',
  count: 5,
  timeframe: '1h',
  conditions: {
    rsiValue: 30,
    condition: 'below'
  },
  description: 'RSI oversold alert for BTC',
  tags: ['oversold', 'rsi', 'btc']
};
```

### Querying Alerts
```typescript
// Get all RSI alerts for BTCUSDT
const alerts = await alertService.findAll({
  symbol: 'BTCUSDT',
  type: 'rsi',
  isActive: true
});

// Search alerts by description
const alerts = await alertService.findAll({
  search: 'oversold'
});
```

## Database Schema

The alert entity includes:
- `symbol`: Trading pair symbol
- `userId`: Reference to user
- `type`: Alert type enum
- `count`: Alert count (1-10)
- `uuid`: Unique identifier
- `timeframe`: Time interval
- `isActive`: Active status
- `conditions`: Alert conditions
- `lastTriggered`: Last trigger timestamp
- `triggerCount`: Number of times triggered
- `description`: Alert description
- `tags`: Array of tags
- `metadata`: Additional data

## Indexes

Performance indexes are created for:
- `symbol + timeframe`
- `userId + isActive`
- `type + isActive`
- `uuid` (unique)

## Integration

To use this module, import `AlertModule` into your main application:

```typescript
import { AlertModule } from './modules/alert/alert.module';

@Module({
  imports: [
    AlertModule,
    // ... other modules
  ],
})
export class AppModule {}
```
