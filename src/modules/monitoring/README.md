# Monitoring Module

The Monitoring Module is a comprehensive system that listens to events from both the Alert Service and Order Service, performs real-time technical analysis, and emits notification events when conditions are met.

## Overview

This module acts as a central monitoring hub that:
- **Listens to Alert Events**: Automatically starts monitoring when alerts are created/updated
- **Listens to Order Events**: Monitors order status changes and execution
- **Performs Technical Analysis**: Calculates various technical indicators in real-time
- **Emits Notifications**: Sends events when conditions are triggered
- **Manages Monitoring Lifecycle**: Automatically starts/stops monitoring based on alert status

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Alert Service │    │  Order Service   │    │ Price APIs      │
│                 │    │                  │    │ (CoinGecko,     │
└─────────┬───────┘    └──────────┬───────┘    │  Binance, etc.) │
          │                       │            └─────────┬───────┘
          │                       │                      │
          ▼                       ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING MODULE                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Monitoring      │  │ Technical       │  │ Notification    │ │
│  │ Service         │  │ Analysis        │  │ Service         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Price           │  │ Indicator       │  │ Event          │ │
│  │ Monitoring      │  │ Services        │  │ Emission       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                       │                      │
          ▼                       ▼                      ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Trading         │    │ Notification     │    │ Analytics       │
│ Services        │    │ Services         │    │ Services        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Services

### 1. MonitoringService
The main orchestrator that:
- Listens to alert and order events
- Manages monitoring lifecycle
- Coordinates technical analysis
- Triggers notifications

### 2. TechnicalAnalysisService
Provides all technical indicators:
- **Bollinger Bands**: Volatility and breakout detection
- **EMA Crossovers**: Trend following signals
- **RSI**: Momentum and overbought/oversold conditions
- **MACD**: Trend momentum and crossovers
- **Stochastic**: Momentum oscillators
- **Volume Analysis**: Volume-based insights
- **Price Action**: Pattern recognition

### 3. PriceMonitoringService
Handles real-time price data:
- Current price fetching
- Historical price data
- Price change calculations
- Volatility analysis
- Caching for performance

### 4. NotificationService
Emits various notification events:
- Alert triggered notifications
- Price target notifications
- Technical indicator notifications
- Order status notifications
- Market alert notifications

### 5. Indicator-Specific Services
Specialized services for each indicator:
- **BollingerBandsService**: BB-specific monitoring
- **MACDService**: MACD-specific monitoring
- **RSIService**: RSI-specific monitoring
- **EMAService**: EMA-specific monitoring

## Features

### 🔄 **Event-Driven Architecture**
- Automatically responds to alert/order events
- No manual intervention required
- Real-time monitoring activation

### 📊 **Comprehensive Technical Analysis**
- 7+ technical indicators
- Multiple timeframes support
- Real-time calculations
- Pattern recognition

### ⚡ **Performance Optimized**
- Intelligent caching system
- Configurable monitoring intervals
- Efficient data processing
- Background monitoring

### 🎯 **Flexible Alert Conditions**
- Price targets (above/below/equals)
- Technical indicator conditions
- Custom threshold values
- Multiple condition types

### 📱 **Rich Notifications**
- Detailed trigger information
- Multiple notification types
- Severity levels
- Custom event support

## Usage Examples

### 1. Basic Alert Monitoring

```typescript
// The monitoring service automatically starts monitoring when an alert is created
@OnEvent('alert.created')
async handleAlertCreated(event: AlertCreatedEvent) {
  // Monitoring automatically starts for this alert
  console.log(`Monitoring started for ${event.alert.symbol}`);
}
```

### 2. Custom Technical Analysis

```typescript
@Injectable()
export class MyService {
  constructor(
    private readonly technicalAnalysis: TechnicalAnalysisService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async analyzeSymbol(symbol: string) {
    // Get RSI analysis
    const rsiData = await this.technicalAnalysis.getRSI(symbol, '1h');
    
    // Get Bollinger Bands
    const bbData = await this.technicalAnalysis.getBollingerBands(symbol, '1h');
    
    // Get MACD
    const macdData = await this.technicalAnalysis.getMACD(symbol, '1h');
    
    return { rsiData, bbData, macdData };
  }
}
```

### 3. Listening to Notifications

```typescript
@Injectable()
export class TradingService {
  @OnEvent('notification.alert_triggered')
  async handleAlertTriggered(event: AlertTriggeredNotificationEvent) {
    const { alert, triggerData } = event;
    
    // Execute trading logic based on alert type
    switch (alert.type) {
      case 'rsi':
        await this.executeRSIStrategy(alert, triggerData);
        break;
      case 'ema_crossover':
        await this.executeEMACrossoverStrategy(alert, triggerData);
        break;
    }
  }
}
```

### 4. Custom Price Monitoring

```typescript
@Injectable()
export class PriceService {
  constructor(
    private readonly priceMonitoring: PriceMonitoringService,
  ) {}

  async monitorPrice(symbol: string) {
    // Get current price
    const currentPrice = await this.priceMonitoring.getCurrentPrice(symbol);
    
    // Get price change
    const change = await this.priceMonitoring.getPriceChange(symbol, '1h');
    
    // Get volatility
    const volatility = await this.priceMonitoring.getVolatility(symbol, '1h');
    
    return { currentPrice, change, volatility };
  }
}
```

## Alert Types Supported

### 1. **Price Limit Alerts**
```typescript
{
  type: 'limit',
  conditions: {
    targetPrice: 50000,
    condition: 'above' // 'above', 'below', 'equals'
  }
}
```

### 2. **Bollinger Bands Alerts**
```typescript
{
  type: 'bollinger_bands',
  conditions: {
    breakout: 'upper', // 'upper', 'lower'
    bounce: 'upper',   // 'upper', 'lower'
    squeeze: true,
    expansion: true
  }
}
```

### 3. **EMA Crossover Alerts**
```typescript
{
  type: 'ema_crossover',
  conditions: {
    crossover: 'bullish', // 'bullish', 'bearish'
    position: 'above',    // 'above', 'below'
    distance: 5,          // percentage
    distanceType: 'above' // 'above', 'below'
  }
}
```

### 4. **RSI Alerts**
```typescript
{
  type: 'rsi',
  conditions: {
    oversold: 30,
    overbought: 70,
    rsiLevel: 50,
    condition: 'below' // 'above', 'below', 'equals'
  }
}
```

### 5. **MACD Alerts**
```typescript
{
  type: 'macd',
  conditions: {
    crossover: 'bullish', // 'bullish', 'bearish'
    histogramPositive: true,
    histogramNegative: true,
    divergence: true
  }
}
```

## Monitoring Intervals

The system automatically adjusts monitoring frequency based on timeframe:

| Timeframe | Monitoring Interval | Description |
|-----------|-------------------|-------------|
| 1m        | 30 seconds        | High-frequency monitoring |
| 5m        | 1 minute          | Medium-frequency monitoring |
| 15m       | 2 minutes         | Balanced monitoring |
| 30m       | 5 minutes         | Moderate monitoring |
| 1h        | 10 minutes        | Standard monitoring |
| 4h        | 30 minutes        | Low-frequency monitoring |
| 1d        | 2 hours           | Daily monitoring |

## Event Flow

### 1. **Alert Creation Flow**
```
Alert Created → Monitoring Started → Technical Analysis → Condition Check → Notification Emitted
```

### 2. **Price Monitoring Flow**
```
Price Check → Target Comparison → Condition Met → Alert Triggered → Notification Emitted
```

### 3. **Technical Indicator Flow**
```
Data Fetch → Calculation → Condition Check → Signal Generated → Notification Emitted
```

## Configuration

### Environment Variables
```bash
# Price API Configuration
PRICE_API_KEY=your_api_key
PRICE_API_URL=https://api.coingecko.com/api/v3

# Monitoring Configuration
MONITORING_INTERVAL=30000
CACHE_DURATION=30000
HISTORICAL_CACHE_DURATION=300000

# Notification Configuration
NOTIFICATION_ENABLED=true
NOTIFICATION_LOG_LEVEL=info
```

### Module Configuration
```typescript
@Module({
  imports: [
    MonitoringModule.forRoot({
      // Global monitoring settings
      defaultInterval: 30000,
      maxConcurrentAlerts: 100,
      enableCaching: true,
      cacheDuration: 30000,
    }),
  ],
})
export class AppModule {}
```

## Performance Considerations

### 1. **Caching Strategy**
- Price data cached for 30 seconds
- Historical data cached for 5 minutes
- Configurable cache durations
- Automatic cache invalidation

### 2. **Monitoring Efficiency**
- Intelligent interval management
- Background processing
- Non-blocking operations
- Resource cleanup

### 3. **API Rate Limiting**
- Built-in rate limiting
- Exponential backoff
- Fallback to cached data
- Error handling

## Error Handling

### 1. **Graceful Degradation**
- Fallback to cached data
- Retry mechanisms
- Error logging
- Service continuity

### 2. **Monitoring Recovery**
- Automatic restart on failure
- Health checks
- Performance monitoring
- Alert notifications

## Testing

### 1. **Unit Tests**
```typescript
describe('MonitoringService', () => {
  it('should start monitoring when alert is created', async () => {
    // Test implementation
  });

  it('should emit notification when condition is met', async () => {
    // Test implementation
  });
});
```

### 2. **Integration Tests**
```typescript
describe('Monitoring Integration', () => {
  it('should process alert events end-to-end', async () => {
    // Test implementation
  });
});
```

## Best Practices

### 1. **Alert Design**
- Use appropriate timeframes
- Set realistic thresholds
- Avoid too many alerts
- Monitor performance impact

### 2. **Condition Optimization**
- Use efficient conditions
- Avoid complex calculations
- Leverage caching
- Monitor resource usage

### 3. **Notification Management**
- Handle notifications gracefully
- Implement retry logic
- Monitor delivery rates
- Log all activities

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Reduce cache duration
   - Limit concurrent alerts
   - Monitor memory usage

2. **API Rate Limits**
   - Increase cache duration
   - Implement rate limiting
   - Use multiple API providers

3. **Performance Issues**
   - Optimize monitoring intervals
   - Review alert conditions
   - Monitor CPU usage

### Debug Mode
```typescript
// Enable debug logging
@Module({
  imports: [
    MonitoringModule.forRoot({
      debug: true,
      logLevel: 'debug',
    }),
  ],
})
export class AppModule {}
```

## Future Enhancements

### 1. **Advanced Indicators**
- Ichimoku Cloud
- Fibonacci Retracements
- Elliott Wave Analysis
- Market Profile

### 2. **Machine Learning**
- Pattern recognition
- Predictive analytics
- Risk assessment
- Portfolio optimization

### 3. **Real-time Streaming**
- WebSocket support
- Real-time price feeds
- Instant notifications
- Live monitoring dashboard

This monitoring module provides a robust foundation for building sophisticated trading systems with real-time technical analysis and automated alert management.

