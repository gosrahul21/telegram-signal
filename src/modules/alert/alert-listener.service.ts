import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlertService } from './alert.service';
import { EventsType } from '@/utils/constants/eventsType';
import { AlertFor } from '@/utils/types/AlertFor';

@Injectable()
export class AlertListenerService {
  private readonly logger = new Logger(AlertListenerService.name);

  constructor(private readonly alertService: AlertService) {}

  /**
   * Listener for monitoring triggered events
   */
  @OnEvent(EventsType.MONITORING_TRIGGERED, { async: true })
  async handleMonitoringTriggered(payload: any) {
    const { symbol, timeframe, eventType } = payload;
    this.logger.log(
      `Received monitoring event for ${symbol} ${timeframe} ${eventType}`,
    );

    // Find matching active alerts
    const alerts =
      await this.alertService.findActiveAlertsBySymbolTimeframeEventType(
        symbol,
        timeframe,
        eventType,
      );

    for (const alert of alerts) {
      let updatedCount = alert.count;

      if (!alert.infinite && updatedCount > 0) {
        updatedCount -= 1;
        await this.alertService.update(alert.uuid, { count: updatedCount });
      }

      // Decide which event to emit (user / order)
      if (alert.alertFor === AlertFor.USER) {
        await this.alertService.emitCustomEvent(
          EventsType.ALERT_TRIGGERED_USER,
          {
            ...payload,
            alertId: alert.uuid,
            userId: alert.userId,
            count: updatedCount,
          },
        );
      } else if (alert.alertFor === AlertFor.ORDER) {
        await this.alertService.emitCustomEvent(
          EventsType.ALERT_TRIGGERED_ORDER,
          {
            ...payload,
            alertId: alert.uuid,
            orderId: alert.orderId,
            userId: alert.userId,
            count: updatedCount,
          },
        );
      }
    }
  }

  /**
   * Listener for order events
   */
  @OnEvent(EventsType.ORDER_CREATED, { async: true })
  @OnEvent(EventsType.ORDER_UPDATED, { async: true })
  @OnEvent(EventsType.ORDER_CANCELLED, { async: true })
  @OnEvent(EventsType.ORDER_FILLED, { async: true })
  async handleOrderEvents(payload: any) {
    this.logger.log(`Received order event: ${JSON.stringify(payload)}`);

    // Here you can hook logic if alerts depend on order lifecycle
    // Example: trigger alerts when an order is filled
    if (payload.type === 'FILLED') {
      await this.alertService.emitCustomEvent(
        EventsType.ALERT_TRIGGERED_ORDER,
        payload,
      );
    }
  }
}
