import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlertService } from './alert.service';
import { EventsType } from '@/utils/constants/eventsType';
import { AlertFor } from '@/utils/types/AlertFor';
import { MonitoringTriggeredPayload } from '../monitoring/types';
import { AlertTriggeredUserPayload, AlertTriggeredOrderPayload } from './types';
import { Types } from 'mongoose';

@Injectable()
export class AlertListenerService {
  private readonly logger = new Logger(AlertListenerService.name);

  constructor(private readonly alertService: AlertService) {}

  /**
   * Listener for monitoring triggered events
   */
  @OnEvent(EventsType.MONITORING_TRIGGERED, { async: true })
  async handleMonitoringTriggered(payload: MonitoringTriggeredPayload) {
    const {
      monitoring: { symbol, timeframe, eventType },
      triggerData,
    } = payload;
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
        const userPayload: AlertTriggeredUserPayload = {
          ...payload,
          alertId: alert.uuid,
          userId: alert.userId as Types.ObjectId,
          count: updatedCount,
        };
        await this.alertService.emitCustomEvent(
          EventsType.ALERT_TRIGGERED_USER,
          userPayload,
        );
      } else if (alert.alertFor === AlertFor.ORDER) {
        const orderPayload: AlertTriggeredOrderPayload = {
          ...payload,
          alertId: alert.uuid,
          orderId: alert.orderId?.toString() || '',
          userId: alert.userId as Types.ObjectId,
          count: updatedCount,
        };
        await this.alertService.emitCustomEvent(
          EventsType.ALERT_TRIGGERED_ORDER,
          orderPayload,
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
