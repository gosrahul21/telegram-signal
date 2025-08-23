# Alert Event System

This document explains how to use the event-driven architecture for the alert system, allowing other services to listen and react to alert-related events.

## Overview

The alert system emits events whenever alerts are created, updated, deleted, triggered, or have their status changed. Other services can listen to these events and perform actions accordingly.

## Events Available

### 1. Alert Created Event
- **Event Name**: `alert.created`
- **Triggered When**: A new alert is created
- **Event Data**: 
  ```typescript
  {
    alert: Alert,
    timestamp: Date
  }
  ```

### 2. Alert Updated Event
- **Event Name**: `alert.updated`
- **Triggered When**: An existing alert is updated
- **Event Data**:
  ```typescript
  {
    alert: Alert,
    previousData?: Partial<Alert>,
    timestamp: Date
  }
  ```

### 3. Alert Deleted Event
- **Event Name**: `alert.deleted`
- **Triggered When**: An alert is deleted
- **Event Data**:
  ```typescript
  {
    alertId: string,
    userId: string,
    timestamp: Date
  }
  ```

### 4. Alert Triggered Event
- **Event Name**: `alert.triggered`
- **Triggered When**: An alert condition is met and triggered
- **Event Data**:
  ```typescript
  {
    alert: Alert,
    triggerData: any,
    timestamp: Date
  }
  ```

### 5. Alert Status Changed Event
- **Event Name**: `alert.status.changed`
- **Triggered When**: An alert's active status is toggled
- **Event Data**:
  ```typescript
  {
    alert: Alert,
    previousStatus: boolean,
    newStatus: boolean,
    timestamp: Date
  }
  ```

## How to Listen to Events

### Option 1: Using @OnEvent Decorator

Create a service that listens to alert events:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlertCreatedEvent, AlertTriggeredEvent } from './events/alert.events';

@Injectable()
export class MyAlertListenerService {
  private readonly logger = new Logger(MyAlertListenerService.name);

  @OnEvent('alert.created')
  handleAlertCreated(event: AlertCreatedEvent) {
    this.logger.log(`New alert created for ${event.alert.symbol}`);
    
    // Your custom logic here
    this.processNewAlert(event.alert);
  }

  @OnEvent('alert.triggered')
  handleAlertTriggered(event: AlertTriggeredEvent) {
    this.logger.log(`Alert triggered for ${event.alert.symbol}`);
    
    // Your custom logic here
    this.executeTradingStrategy(event.alert, event.triggerData);
  }

  private async processNewAlert(alert: any) {
    // Implementation
  }

  private async executeTradingStrategy(alert: any, triggerData: any) {
    // Implementation
  }
}
```

### Option 2: Using EventEmitter2 Directly

Inject EventEmitter2 and listen to events manually:

```typescript
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlertCreatedEvent } from './events/alert.events';

@Injectable()
export class MyCustomService {
  constructor(private eventEmitter: EventEmitter2) {
    // Listen to alert created events
    this.eventEmitter.on('alert.created', (event: AlertCreatedEvent) => {
      console.log('Alert created:', event.alert.symbol);
      this.handleNewAlert(event.alert);
    });
  }

  private handleNewAlert(alert: any) {
    // Implementation
  }
}
```

### Option 3: Using Event Constants

Use the predefined event constants for type safety:

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ALERT_EVENTS, AlertCreatedEvent } from './events/alert.events';

@Injectable()
export class MyService {
  @OnEvent(ALERT_EVENTS.CREATED)
  handleAlertCreated(event: AlertCreatedEvent) {
    // Implementation
  }

  @OnEvent(ALERT_EVENTS.TRIGGERED)
  handleAlertTriggered(event: AlertTriggeredEvent) {
    // Implementation
  }
}
```

## Integration Examples

### 1. Trading Service Integration

```typescript
@Injectable()
export class TradingService {
  @OnEvent('alert.triggered')
  async handleAlertTriggered(event: AlertTriggeredEvent) {
    const { alert, triggerData } = event;
    
    // Execute trading logic based on alert type
    switch (alert.type) {
      case 'rsi':
        await this.executeRSIStrategy(alert, triggerData);
        break;
      case 'ema_crossover':
        await this.executeEMACrossoverStrategy(alert, triggerData);
        break;
      case 'bollinger_bands':
        await this.executeBollingerBandsStrategy(alert, triggerData);
        break;
    }
  }

  private async executeRSIStrategy(alert: any, triggerData: any) {
    // RSI trading logic
  }
}
```

### 2. Notification Service Integration

```typescript
@Injectable()
export class NotificationService {
  @OnEvent('alert.created')
  async handleAlertCreated(event: AlertCreatedEvent) {
    await this.sendAlertConfirmation(event.alert);
  }

  @OnEvent('alert.triggered')
  async handleAlertTriggered(event: AlertTriggeredEvent) {
    await this.sendAlertNotification(event.alert, event.triggerData);
  }

  @OnEvent('alert.status.changed')
  async handleAlertStatusChanged(event: AlertStatusChangedEvent) {
    await this.sendStatusChangeNotification(event.alert, event.newStatus);
  }
}
```

### 3. Analytics Service Integration

```typescript
@Injectable()
export class AnalyticsService {
  @OnEvent('alert.created')
  async handleAlertCreated(event: AlertCreatedEvent) {
    await this.trackAlertCreation(event.alert);
  }

  @OnEvent('alert.triggered')
  async handleAlertTriggered(event: AlertTriggeredEvent) {
    await this.trackAlertTrigger(event.alert, event.triggerData);
  }

  @OnEvent('alert.deleted')
  async handleAlertDeleted(event: AlertDeletedEvent) {
    await this.trackAlertDeletion(event.alertId);
  }
}
```

### 4. Monitoring Service Integration

```typescript
@Injectable()
export class MonitoringService {
  @OnEvent('alert.created')
  async handleAlertCreated(event: AlertCreatedEvent) {
    await this.startMonitoringAlert(event.alert);
  }

  @OnEvent('alert.updated')
  async handleAlertUpdated(event: AlertUpdatedEvent) {
    await this.updateMonitoringConfiguration(event.alert);
  }

  @OnEvent('alert.deleted')
  async handleAlertDeleted(event: AlertDeletedEvent) {
    await this.stopMonitoringAlert(event.alertId);
  }

  @OnEvent('alert.status.changed')
  async handleAlertStatusChanged(event: AlertStatusChangedEvent) {
    if (event.newStatus) {
      await this.activateMonitoring(event.alert);
    } else {
      await this.deactivateMonitoring(event.alert);
    }
  }
}
```

## Custom Events

You can also emit custom events using the `emitCustomEvent` method:

```typescript
// In your service
await this.alertService.emitCustomEvent('alert.custom_action', {
  alertId: '123',
  action: 'manual_trigger',
  data: { price: 50000 }
});

// Listen to custom events
@OnEvent('alert.custom_action')
handleCustomAction(event: any) {
  console.log('Custom action:', event);
}
```

## Error Handling

Events are emitted asynchronously and don't block the main operation. If an event listener throws an error, it won't affect the alert operation:

```typescript
@OnEvent('alert.created')
async handleAlertCreated(event: AlertCreatedEvent) {
  try {
    await this.processAlert(event.alert);
  } catch (error) {
    // Log error but don't let it affect the alert creation
    this.logger.error('Error processing alert:', error);
  }
}
```

## Performance Considerations

- Events are emitted asynchronously and don't block operations
- Use event listeners for non-critical operations
- For critical operations, consider using direct service calls
- Event listeners should be lightweight and not perform heavy operations

## Testing Events

Test your event listeners by mocking the EventEmitter2:

```typescript
describe('MyAlertListenerService', () => {
  let service: MyAlertListenerService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MyAlertListenerService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            on: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MyAlertListenerService>(MyAlertListenerService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should handle alert created event', () => {
    const mockEvent = {
      alert: { symbol: 'BTCUSDT', type: 'rsi' },
      timestamp: new Date(),
    };

    service.handleAlertCreated(mockEvent);
    // Add your assertions here
  });
});
```

## Best Practices

1. **Keep listeners lightweight**: Don't perform heavy operations in event listeners
2. **Handle errors gracefully**: Wrap listener logic in try-catch blocks
3. **Use typed events**: Import event interfaces for type safety
4. **Avoid circular dependencies**: Don't create circular references between services
5. **Test event handling**: Ensure your listeners work correctly with unit tests
6. **Monitor performance**: Keep track of event processing times
7. **Use event constants**: Use predefined event names for consistency

## Configuration

Make sure your main application has EventEmitter2 configured:

```typescript
// app.module.ts
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Global configuration
      wildcard: false,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

This event system provides a robust foundation for building reactive, decoupled services that can respond to alert changes in real-time.
