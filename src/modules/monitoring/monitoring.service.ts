import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
// import { AlertService, AlertCreatedEvent, AlertUpdatedEvent, AlertDeletedEvent, AlertStatusChangedEvent } from '../alert/alert.service';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { PriceMonitoringService } from './price-monitoring.service';
import { NotificationService } from './notification.service';
import {
  AlertCreatedEvent,
  AlertDeletedEvent,
  AlertService,
  AlertStatusChangedEvent,
  AlertUpdatedEvent,
} from '../alert';

@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringService.name);
  private activeAlerts = new Map<string, any>();
  private monitoringIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly alertService: AlertService,
    private readonly technicalAnalysisService: TechnicalAnalysisService,
    private readonly priceMonitoringService: PriceMonitoringService,
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit() {
    this.logger.log('Monitoring service initialized');
    this.loadActiveAlerts();
  }

  // Listen to alert events
  @OnEvent('alert.created')
  async handleAlertCreated(event: AlertCreatedEvent) {
    this.logger.log(
      `New alert created: ${event.alert.symbol} - ${event.alert.type}`,
    );

    if (event.alert.isActive) {
      await this.startMonitoringAlert(event.alert);
    }
  }

  @OnEvent('alert.updated')
  async handleAlertUpdated(event: AlertUpdatedEvent & any) {
    this.logger.log(
      `Alert updated: ${event.alert.symbol} - ${event.alert.type}`,
    );

    // Stop old monitoring if conditions changed significantly
    if (
      event.previousData &&
      this.hasSignificantChanges(event.previousData, event.alert)
    ) {
      await this.stopMonitoringAlert(
        event.previousData._id || event.previousData.id,
      );
    }

    if (event.alert.isActive) {
      await this.startMonitoringAlert(event.alert);
    }
  }

  @OnEvent('alert.deleted')
  async handleAlertDeleted(event: AlertDeletedEvent) {
    this.logger.log(`Alert deleted: ${event.alertId}`);
    await this.stopMonitoringAlert(event.alertId);
  }

  @OnEvent('alert.status.changed')
  async handleAlertStatusChanged(event: AlertStatusChangedEvent & any) {
    this.logger.log(
      `Alert status changed: ${event.alert.symbol} - ${event.previousStatus} -> ${event.newStatus}`,
    );

    if (event.newStatus) {
      await this.startMonitoringAlert(event.alert);
    } else {
      await this.stopMonitoringAlert(event.alert._id || event.alert.id);
    }
  }

  // Listen to order events (you'll need to create these)
  @OnEvent('order.created')
  async handleOrderCreated(event: any) {
    this.logger.log(`New order created: ${event.order.symbol}`);
    await this.startMonitoringOrder(event.order);
  }

  @OnEvent('order.updated')
  async handleOrderUpdated(event: any) {
    this.logger.log(`Order updated: ${event.order.symbol}`);
    await this.updateOrderMonitoring(event.order);
  }

  @OnEvent('order.filled')
  async handleOrderFilled(event: any) {
    this.logger.log(`Order filled: ${event.order.symbol}`);
    await this.stopOrderMonitoring(event.order.id);
  }

  // Periodic monitoring check
  @Cron(CronExpression.EVERY_30_SECONDS)
  async performPeriodicChecks() {
    this.logger.debug('Performing periodic monitoring checks');

    for (const [alertId, alert] of this.activeAlerts) {
      try {
        await this.checkAlertConditions(alert);
      } catch (error) {
        this.logger.error(`Error checking alert ${alertId}:`, error);
      }
    }
  }

  private async loadActiveAlerts() {
    try {
      const activeAlerts = await this.alertService.findActiveAlerts();
      for (const alert of activeAlerts) {
        await this.startMonitoringAlert(alert);
      }
      this.logger.log(`Loaded ${activeAlerts.length} active alerts`);
    } catch (error) {
      this.logger.error('Error loading active alerts:', error);
    }
  }

  private async startMonitoringAlert(alert: any) {
    const alertId = alert._id || alert.id;

    if (this.activeAlerts.has(alertId)) {
      this.logger.warn(`Alert ${alertId} is already being monitored`);
      return;
    }

    this.activeAlerts.set(alertId, alert);

    // Start monitoring based on alert type
    switch (alert.type) {
      case 'limit':
        await this.startPriceMonitoring(alert);
        break;
      case 'bollinger_bands':
        await this.startBollingerBandsMonitoring(alert);
        break;
      case 'ema_crossover':
        await this.startEMACrossoverMonitoring(alert);
        break;
      case 'rsi':
        await this.startRSIMonitoring(alert);
        break;
      case 'macd':
        await this.startMACDMonitoring(alert);
        break;
      default:
        this.logger.warn(`Unknown alert type: ${alert.type}`);
    }

    this.logger.log(`Started monitoring alert ${alertId} for ${alert.symbol}`);
  }

  private async stopMonitoringAlert(alertId: string) {
    if (!this.activeAlerts.has(alertId)) {
      return;
    }

    // Clear monitoring interval
    const interval = this.monitoringIntervals.get(alertId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(alertId);
    }

    this.activeAlerts.delete(alertId);
    this.logger.log(`Stopped monitoring alert ${alertId}`);
  }

  private async startPriceMonitoring(alert: any) {
    const alertId = alert._id || alert.id;

    // Set up price monitoring interval
    const interval = setInterval(async () => {
      try {
        const currentPrice = await this.priceMonitoringService.getCurrentPrice(
          alert.symbol,
        );
        const targetPrice = alert.conditions?.targetPrice;

        if (
          targetPrice &&
          this.checkPriceCondition(
            currentPrice,
            targetPrice,
            alert.conditions?.condition,
          )
        ) {
          await this.triggerAlert(alert, { currentPrice, targetPrice });
        }
      } catch (error) {
        this.logger.error(
          `Error in price monitoring for ${alert.symbol}:`,
          error,
        );
      }
    }, this.getMonitoringInterval(alert.timeframe));

    this.monitoringIntervals.set(alertId, interval);
  }

  private async startBollingerBandsMonitoring(alert: any) {
    const alertId = alert._id || alert.id;

    const interval = setInterval(async () => {
      try {
        const bbData = await this.technicalAnalysisService.getBollingerBands(
          alert.symbol,
          alert.timeframe,
        );
        const currentPrice = await this.priceMonitoringService.getCurrentPrice(
          alert.symbol,
        );

        if (
          this.checkBollingerBandsCondition(
            currentPrice,
            bbData,
            alert.conditions,
          )
        ) {
          await this.triggerAlert(alert, { currentPrice, bbData });
        }
      } catch (error) {
        this.logger.error(
          `Error in Bollinger Bands monitoring for ${alert.symbol}:`,
          error,
        );
      }
    }, this.getMonitoringInterval(alert.timeframe));

    this.monitoringIntervals.set(alertId, interval);
  }

  private async startEMACrossoverMonitoring(alert: any) {
    const alertId = alert._id || alert.id;

    const interval = setInterval(async () => {
      try {
        const emaData = await this.technicalAnalysisService.getEMACrossover(
          alert.symbol,
          alert.timeframe,
        );

        if (this.checkEMACrossoverCondition(emaData, alert.conditions)) {
          await this.triggerAlert(alert, { emaData });
        }
      } catch (error) {
        this.logger.error(
          `Error in EMA crossover monitoring for ${alert.symbol}:`,
          error,
        );
      }
    }, this.getMonitoringInterval(alert.timeframe));

    this.monitoringIntervals.set(alertId, interval);
  }

  private async startRSIMonitoring(alert: any) {
    const alertId = alert._id || alert.id;

    const interval = setInterval(async () => {
      try {
        const rsiData = await this.technicalAnalysisService.getRSI(
          alert.symbol,
          alert.timeframe,
        );

        if (this.checkRSICondition(rsiData, alert.conditions)) {
          await this.triggerAlert(alert, { rsiData });
        }
      } catch (error) {
        this.logger.error(
          `Error in RSI monitoring for ${alert.symbol}:`,
          error,
        );
      }
    }, this.getMonitoringInterval(alert.timeframe));

    this.monitoringIntervals.set(alertId, interval);
  }

  private async startMACDMonitoring(alert: any) {
    const alertId = alert._id || alert.id;

    const interval = setInterval(async () => {
      try {
        const macdData = await this.technicalAnalysisService.getMACD(
          alert.symbol,
          alert.timeframe,
        );

        if (this.checkMACDCondition(macdData, alert.conditions)) {
          await this.triggerAlert(alert, { macdData });
        }
      } catch (error) {
        this.logger.error(
          `Error in MACD monitoring for ${alert.symbol}:`,
          error,
        );
      }
    }, this.getMonitoringInterval(alert.timeframe));

    this.monitoringIntervals.set(alertId, interval);
  }

  private async startMonitoringOrder(order: any) {
    // Implement order monitoring logic
    this.logger.log(`Started monitoring order ${order.id} for ${order.symbol}`);
  }

  private async updateOrderMonitoring(order: any) {
    // Implement order monitoring update logic
    this.logger.log(`Updated monitoring for order ${order.id}`);
  }

  private async stopOrderMonitoring(orderId: string) {
    // Implement order monitoring stop logic
    this.logger.log(`Stopped monitoring order ${orderId}`);
  }

  private async checkAlertConditions(alert: any) {
    // This method can be used for additional periodic checks
    // beyond the interval-based monitoring
  }

  private checkPriceCondition(
    currentPrice: number,
    targetPrice: number,
    condition: string,
  ): boolean {
    switch (condition) {
      case 'above':
        return currentPrice > targetPrice;
      case 'below':
        return currentPrice < targetPrice;
      case 'equals':
        return Math.abs(currentPrice - targetPrice) < 0.0001; // Small tolerance
      default:
        return false;
    }
  }

  private checkBollingerBandsCondition(
    currentPrice: number,
    bbData: any,
    conditions: any,
  ): boolean {
    const { upperBand, lowerBand } = bbData;

    if (conditions?.breakout === 'upper') {
      return currentPrice > upperBand;
    } else if (conditions?.breakout === 'lower') {
      return currentPrice < lowerBand;
    } else if (conditions?.bounce === 'upper') {
      return (
        currentPrice <= upperBand && currentPrice > (upperBand + lowerBand) / 2
      );
    } else if (conditions?.bounce === 'lower') {
      return (
        currentPrice >= lowerBand && currentPrice < (upperBand + lowerBand) / 2
      );
    }

    return false;
  }

  private checkEMACrossoverCondition(emaData: any, conditions: any): boolean {
    const { fastEMA, slowEMA, previousFastEMA, previousSlowEMA } = emaData;

    if (conditions?.crossover === 'bullish') {
      return previousFastEMA <= previousSlowEMA && fastEMA > slowEMA;
    } else if (conditions?.crossover === 'bearish') {
      return previousFastEMA >= previousSlowEMA && fastEMA < slowEMA;
    }

    return false;
  }

  private checkRSICondition(rsiData: any, conditions: any): boolean {
    const { rsi } = rsiData;

    if (conditions?.oversold && rsi < conditions.oversold) {
      return true;
    } else if (conditions?.overbought && rsi > conditions.overbought) {
      return true;
    }

    return false;
  }

  private checkMACDCondition(macdData: any, conditions: any): boolean {
    const { macd, signal, histogram } = macdData;

    if (conditions?.crossover === 'bullish') {
      return macd > signal && histogram > 0;
    } else if (conditions?.crossover === 'bearish') {
      return macd < signal && histogram < 0;
    }

    return false;
  }

  private async triggerAlert(alert: any, triggerData: any) {
    try {
      // Increment trigger count
      await this.alertService.incrementTriggerCount(
        alert._id || alert.id,
        triggerData,
      );

      // Emit notification event
      await this.notificationService.emitAlertTriggered(alert, triggerData);

      this.logger.log(`Alert triggered: ${alert.symbol} - ${alert.type}`);
    } catch (error) {
      this.logger.error(
        `Error triggering alert ${alert._id || alert.id}:`,
        error,
      );
    }
  }

  private getMonitoringInterval(timeframe: string): number {
    const intervals: Record<string, number> = {
      '1m': 30 * 1000, // 30 seconds
      '5m': 60 * 1000, // 1 minute
      '15m': 2 * 60 * 1000, // 2 minutes
      '30m': 5 * 60 * 1000, // 5 minutes
      '1h': 10 * 60 * 1000, // 10 minutes
      '4h': 30 * 60 * 1000, // 30 minutes
      '1d': 2 * 60 * 60 * 1000, // 2 hours
    };

    return intervals[timeframe] || 60 * 1000; // Default to 1 minute
  }

  private hasSignificantChanges(previous: any, current: any): boolean {
    // Check if conditions, timeframe, or symbol changed
    return (
      previous.conditions !== current.conditions ||
      previous.timeframe !== current.timeframe ||
      previous.symbol !== current.symbol
    );
  }

  // Public methods for external use
  async getActiveAlerts(): Promise<any[]> {
    return Array.from(this.activeAlerts.values());
  }

  async getMonitoringStatus(): Promise<any> {
    return {
      activeAlerts: this.activeAlerts.size,
      monitoringIntervals: this.monitoringIntervals.size,
      status: 'active',
    };
  }
}
