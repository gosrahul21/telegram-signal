import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AlertCreatedEvent,
  AlertDeletedEvent,
  AlertStatusChangedEvent,
  AlertUpdatedEvent,
} from '../alert';
import { MonitoringService } from './monitoring.service';

@Injectable()
export class AlertListenerService {
  private readonly logger = new Logger(AlertListenerService.name);

  constructor(private readonly monitoringService: MonitoringService) {}

  // Listen to alert events
  @OnEvent('alert.created')
  async handleAlertCreated(event: AlertCreatedEvent) {
    this.logger.log(
      `New alert created: ${event.alert.symbol} - ${event.alert.eventType} - ${event.alert.timeframe}`,
    );

    if (event.alert.isActive) {
      await this.monitoringService.addAlertToMonitoring(event.alert);
    }
  }

  @OnEvent('alert.updated')
  async handleAlertUpdated(event: AlertUpdatedEvent & any) {
    this.logger.log(
      `Alert updated: ${event.alert.symbol} - ${event.alert.eventType} - ${event.alert.timeframe}`,
    );

    // Remove old alert from monitoring
    if (event.previousData) {
      await this.monitoringService.removeAlertFromMonitoring(
        event.previousData.uuid,
      );
    }

    // Add updated alert to monitoring if active
    if (event.alert.isActive) {
      await this.monitoringService.addAlertToMonitoring(event.alert);
    }
  }

  @OnEvent('alert.deleted')
  async handleAlertDeleted(event: AlertDeletedEvent) {
    this.logger.log(`Alert deleted: ${event.alertId}`);
    await this.monitoringService.removeAlertFromMonitoring(event.alertId);
  }

  @OnEvent('alert.status.changed')
  async handleAlertStatusChanged(event: AlertStatusChangedEvent & any) {
    this.logger.log(
      `Alert status changed: ${event.alert.symbol} - ${event.previousStatus} -> ${event.newStatus}`,
    );

    if (event.newStatus) {
      await this.monitoringService.addAlertToMonitoring(event.alert);
    } else {
      await this.monitoringService.removeAlertFromMonitoring(event.alert.uuid);
    }
  }
}
