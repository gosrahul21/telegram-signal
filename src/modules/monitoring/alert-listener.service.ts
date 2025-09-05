import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AlertCreatedEvent,
  AlertDeletedEvent,
  AlertUpdatedEvent,
} from '../alert';
import { MonitoringService } from './services/monitoring.service';
import { EventsType } from '@/utils/constants/eventsType';
import { MonitorEventType } from '../alert';
import { CreateMonitoringDto } from './dto/create-monitoring.dto';

@Injectable()
export class AlertListenerService {
  private readonly logger = new Logger(AlertListenerService.name);

  constructor(private readonly monitoringService: MonitoringService) {}

  /** Handle new alert */
  @OnEvent(EventsType.ALERT_CREATED)
  async handleAlertCreated(event: AlertCreatedEvent) {
    const alert = event;
    this.logger.log(
      `New monitoring created: ${alert.symbol} - ${alert.eventType} - ${alert.timeframe}`,
    );

    // Skip if inactive as it would not affect the current monitoring
    if (!alert.isActive) return;

    await this.monitoringService.addMonitoring({
      symbol: alert.symbol,
      timeframe: alert.timeframe,
      eventType: alert.eventType,
      count: alert.count.toString(),
    } as CreateMonitoringDto);
  }

  /** Handle alert update */
  @OnEvent(EventsType.ALERT_UPDATED)
  async handleAlertUpdated(event: AlertUpdatedEvent) {
    const alert = event;

    this.logger.log(
      `Alert updated: ${alert.symbol} - ${alert.eventType} - ${alert.timeframe}`,
    );

    // Add new monitoring if active and valid
    // if (alert.isActive) {
    if (alert.count === 0 && (alert.count as any) !== 'INFINITE') {
      await this.monitoringService.removeMonitoring(
        alert.symbol,
        alert.timeframe,
        alert.eventType as MonitorEventType,
      );
      return;
    }

    await this.monitoringService.addMonitoring({
      symbol: alert.symbol,
      timeframe: alert.timeframe,
      eventType: alert.eventType,
      count: alert.count.toString(),
    } as any);
  }

  @OnEvent(EventsType.ALERT_DELETED)
  async handleAlertDeleted(alert: AlertDeletedEvent) {
    try {
      // if count is 0 then remove monitoring
      if (alert.count === 0 && (alert.count as any) !== 'INFINITE') {
        return await this.monitoringService.removeMonitoring(
          alert.symbol,
          alert.timeframe,
          alert.eventType as MonitorEventType,
        );
      }

      await this.monitoringService.addMonitoring({
        symbol: alert.symbol,
        timeframe: alert.timeframe,
        eventType: alert.eventType,
        count: alert.count.toString(),
      } as any);
    } catch (error) {
      this.logger.error(`Error removing monitoring: ${error}`);
    }
  }
}
