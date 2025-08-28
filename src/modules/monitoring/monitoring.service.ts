import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { PriceMonitoringService } from './price-monitoring.service';
import { NotificationService } from './notification.service';
import { Alert, AlertService, MonitorEventType } from '../alert';

// Internal alert tracking structure - only for count management
interface InternalAlert {
  userId: string;
  remainingCount: number;
  isEternal: boolean;
}

type Symbol = string;
type Timeframe = string;
type AlertId = string;

@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringService.name);

  // Organized by symbol, timeframe, and monitor type - stores monitoring intervals and best count
  private alertGroups = new Map<
    Symbol,
    Map<
      Timeframe,
      Map<
        MonitorEventType,
        {
          count: number | 'ETERNAL';
          monitoringInterval: NodeJS.Timeout;
        }
      >
    >
  >();

  // Quick lookup for individual alerts - only for count tracking
  private activeAlerts = new Map<
    Symbol,
    Map<Timeframe, Map<MonitorEventType, Map<AlertId, InternalAlert>>>
  >();

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

  // Public methods for external use
  async addAlertToMonitoring(alert: Alert) {
    const alertId = alert.uuid;

    // Check if alert is already being monitored
    if (
      this.activeAlerts
        .get(alert.symbol)
        ?.get(alert.timeframe)
        ?.get(alert.eventType)
        ?.has(alertId)
    ) {
      this.logger.warn(`Alert ${alertId} is already being monitored`);
      return;
    }

    // Create internal alert structure for count tracking
    const internalAlert: InternalAlert = {
      userId: alert.userId.toString(),
      remainingCount: alert.count,
      isEternal: alert.eternal || false,
    };

    // Add to active alerts for count tracking
    this.setActiveAlertsMap(alert, internalAlert);

    // Add to organized structure and start monitoring if needed
    await this.organizeAlert(alert, internalAlert);

    this.logger.log(
      `Started monitoring alert ${alertId} for ${alert.symbol} - ${alert.eventType} - ${alert.timeframe}`,
    );
  }

  async removeAlertFromMonitoring(alertId: string) {
    // Find the alert in the activeAlerts structure
    for (const [symbol, timeframeMap] of this.activeAlerts) {
      for (const [timeframe, eventTypeMap] of timeframeMap) {
        for (const [eventType, alertMap] of eventTypeMap) {
          if (alertMap.has(alertId)) {
            const internalAlert = alertMap.get(alertId)!;

            // Remove from active alerts
            alertMap.delete(alertId);

            // Clean up empty maps
            if (alertMap.size === 0) {
              eventTypeMap.delete(eventType);
            }
            if (eventTypeMap.size === 0) {
              timeframeMap.delete(timeframe);
            }
            if (timeframeMap.size === 0) {
              this.activeAlerts.delete(symbol);
            }

            // Update alertGroups - check if we need to stop monitoring or update count
            await this.updateAlertGroupsAfterRemoval(
              symbol,
              timeframe,
              eventType,
            );

            this.logger.log(`Stopped monitoring alert ${alertId}`);
            return;
          }
        }
      }
    }
  }

  private async updateAlertGroupsAfterRemoval(
    symbol: string,
    timeframe: string,
    eventType: MonitorEventType,
  ) {
    const symbolMap = this.alertGroups.get(symbol);
    if (!symbolMap) return;

    const timeframeMap = symbolMap.get(timeframe);
    if (!timeframeMap) return;

    const groupData = timeframeMap.get(eventType);
    if (!groupData) return;

    // Check if there are any remaining alerts of this type
    const remainingAlerts = this.activeAlerts
      .get(symbol)
      ?.get(timeframe)
      ?.get(eventType);

    if (!remainingAlerts || remainingAlerts.size === 0) {
      // No more alerts of this type, stop monitoring and remove from groups
      if (groupData.monitoringInterval) {
        clearInterval(groupData.monitoringInterval);
      }
      timeframeMap.delete(eventType);

      // Clean up empty maps
      if (timeframeMap.size === 0) {
        symbolMap.delete(timeframe);
      }
      if (symbolMap.size === 0) {
        this.alertGroups.delete(symbol);
      }
    } else {
      // Update the count for remaining alerts
      const newCount = this.getBestCountForAlertType(
        symbol,
        timeframe,
        eventType,
      );
      groupData.count = newCount;
    }
  }

  private setActiveAlertsMap(alert: Alert, internalAlert: InternalAlert) {
    const alertId = alert.uuid;

    // Add to active alerts for count tracking
    if (!this.activeAlerts.has(alert.symbol)) {
      this.activeAlerts.set(alert.symbol, new Map());
    }
    if (!this.activeAlerts.get(alert.symbol)!.has(alert.timeframe)) {
      this.activeAlerts.get(alert.symbol)!.set(alert.timeframe, new Map());
    }
    if (
      !this.activeAlerts
        .get(alert.symbol)!
        .get(alert.timeframe)!
        .has(alert.eventType)
    ) {
      this.activeAlerts
        .get(alert.symbol)!
        .get(alert.timeframe)!
        .set(alert.eventType, new Map());
    }

    this.activeAlerts
      .get(alert.symbol)!
      .get(alert.timeframe)!
      .get(alert.eventType)!
      .set(alertId, internalAlert);
  }

  private async organizeAlert(alert: Alert, internalAlert: InternalAlert) {
    if (!this.alertGroups.has(alert.symbol)) {
      this.alertGroups.set(alert.symbol, new Map());
    }

    const symbolMap = this.alertGroups.get(alert.symbol)!;
    if (!symbolMap.has(alert.timeframe)) {
      symbolMap.set(alert.timeframe, new Map());
    }

    const timeframeMap = symbolMap.get(alert.timeframe)!;
    if (!timeframeMap.has(alert.eventType)) {
      // First alert of this type, start monitoring
      const bestCount = this.getBestCountForAlertType(
        alert.symbol,
        alert.timeframe,
        alert.eventType,
      );
      const monitoringInterval = await this.startMonitoringByType(
        alert.symbol,
        alert.timeframe,
        alert.eventType,
      );

      timeframeMap.set(alert.eventType, {
        count: bestCount,
        monitoringInterval,
      });
    } else {
      // Update count for existing monitoring
      const groupData = timeframeMap.get(alert.eventType)!;
      const newCount = this.getBestCountForAlertType(
        alert.symbol,
        alert.timeframe,
        alert.eventType,
      );
      groupData.count = newCount;
    }
  }

  private getBestCountForAlertType(
    symbol: string,
    timeframe: string,
    eventType: MonitorEventType,
  ): number | 'ETERNAL' {
    const alerts = this.activeAlerts
      .get(symbol)
      ?.get(timeframe)
      ?.get(eventType);
    if (!alerts) return 1; // Default count

    const alertValues = Array.from(alerts.values());
    const isEternal = alertValues.some(
      (internalAlert) => internalAlert.isEternal,
    );
    if (isEternal) return 'ETERNAL';

    // if not eternal, return the max count
    return Math.max(
      ...alertValues.map((internalAlert) => internalAlert.remainingCount),
    );
  }

  private async startMonitoringByType(
    symbol: string,
    timeframe: string,
    eventType: MonitorEventType,
  ): Promise<NodeJS.Timeout> {
    // Start monitoring based on alert type
    switch (eventType) {
      // case MonitorEventType.LIMIT:
      //   return this.startPriceMonitoring(symbol, timeframe);

      case MonitorEventType.BOLLINGER_BANDS_HIGH:
      case MonitorEventType.BOLLINGER_BANDS_LOW:
        return this.startBollingerBandsMonitoring(symbol, timeframe, eventType);

      case MonitorEventType.EMA_LOW:
      case MonitorEventType.EMA_HIGH:
        return this.startEMACrossoverMonitoring(symbol, timeframe, eventType);

      case MonitorEventType.RSI_LOW:
      case MonitorEventType.RSI_CROSSOVER_HIGH:
        return this.startRSIMonitoring(symbol, timeframe, eventType);

      case MonitorEventType.MACD_CROSSOVER_LOW:
      case MonitorEventType.MACD_CROSSOVER_HIGH:
        return this.startMACDMonitoring(symbol, timeframe, eventType);
      default:
        this.logger.warn(`Unknown alert type: ${eventType}`);
        return null as any;
    }
  }


  private startBollingerBandsMonitoring(
    symbol: string,
    timeframe: string,
    eventType: MonitorEventType,
  ): NodeJS.Timeout {
    const interval = setInterval(async () => {
      try {
        const alerts = this.activeAlerts
          .get(symbol)
          ?.get(timeframe)
          ?.get(eventType);
        if (!alerts) return;

        const bbData = await this.technicalAnalysisService.getBollingerBands(
          symbol,
          timeframe,
        );
        const currentPrice =
          await this.priceMonitoringService.getCurrentPrice(symbol);
        const isTriggered = this.checkBollingerBandsCondition(
          currentPrice,
          bbData,
          eventType,
        );
        if (isTriggered) {
          // no need to trigger alert as it is not triggered
          return;
        }
        // Check all alerts of this type
        for (const [alertId, internalAlert] of alerts) {
          try {
            // const alert = await this.alertService.findOne(alertId);
            // if (this.checkBollingerBandsCondition(currentPrice, bbData, eventType)) {
            const alert = {
              uuid: alertId,
              symbol,
              timeframe,
              eventType,
              count: internalAlert.remainingCount,
              isActive: true,
              userId: '1',
              eternal: internalAlert.isEternal,
            };
            await this.triggerAlert(alert, internalAlert, {
              currentPrice,
              bbData,
            });
            // }
          } catch (error) {
            this.logger.error(
              `Error checking Bollinger Bands alert ${alertId}:`,
              error,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `Error in Bollinger Bands monitoring for ${symbol}:`,
          error,
        );
      }
    }, this.getMonitoringInterval(timeframe));

    return interval;
  }

  private startEMACrossoverMonitoring(
    symbol: string,
    timeframe: string,
    eventType: MonitorEventType,
  ): NodeJS.Timeout {
    const interval = setInterval(async () => {
      try {
        const alerts = this.activeAlerts
          .get(symbol)
          ?.get(timeframe)
          ?.get(eventType);
        if (!alerts) return;

        const emaData = await this.technicalAnalysisService.getEMACrossover(
          symbol,
          timeframe,
        );
        const isTriggered = this.checkEMACrossoverCondition(emaData, eventType);
        if (isTriggered) {
          // no need to trigger alert as it is not triggered
          return;
        }
        // Check all alerts of this type
        for (const [alertId, internalAlert] of alerts) {
          try {
            // const alert = await this.alertService.findOne(alertId);
            // if (this.checkEMACrossoverCondition(emaData, eventType)) {
            const alert = {
              uuid: alertId,
              symbol,
              timeframe,
              eventType,
              count: internalAlert.remainingCount,
              isActive: true,
              userId: '1',
              eternal: internalAlert.isEternal,
            };
            await this.triggerAlert(alert, internalAlert, { emaData });
            // }
          } catch (error) {
            this.logger.error(`Error checking EMA alert ${alertId}:`, error);
          }
        }
      } catch (error) {
        this.logger.error(
          `Error in EMA crossover monitoring for ${symbol}:`,
          error,
        );
      }
    }, this.getMonitoringInterval(timeframe));

    return interval;
  }

  private startRSIMonitoring(
    symbol: string,
    timeframe: string,
    eventType: MonitorEventType,
  ): NodeJS.Timeout {
    const interval = setInterval(async () => {
      try {
        const alerts = this.activeAlerts
          .get(symbol)
          ?.get(timeframe)
          ?.get(eventType);
        if (!alerts) return;

        const rsiData = await this.technicalAnalysisService.getRSI(
          symbol,
          timeframe,
        );

        // Check all alerts of this type
        for (const [alertId, internalAlert] of alerts) {
          try {
            const alert = await this.alertService.findOne(alertId);
            if (
              alert &&
              this.checkRSICondition(
                rsiData,
                eventType === MonitorEventType.RSI_LOW ? 30 : 75,
                eventType,
              )
            ) {
              await this.triggerAlert(alert, internalAlert, { rsiData });
            }
          } catch (error) {
            this.logger.error(`Error checking RSI alert ${alertId}:`, error);
          }
        }
      } catch (error) {
        this.logger.error(`Error in RSI monitoring for ${symbol}:`, error);
      }
    }, this.getMonitoringInterval(timeframe));

    return interval;
  }

  private startMACDMonitoring(
    symbol: string,
    timeframe: string,
    eventType: MonitorEventType,
  ): NodeJS.Timeout {
    const interval = setInterval(async () => {
      try {
        const alerts = this.activeAlerts
          .get(symbol)
          ?.get(timeframe)
          ?.get(eventType);
        if (!alerts) return;

        const macdData = await this.technicalAnalysisService.getMACD(
          symbol,
          timeframe,
        );

        // Check all alerts of this type
        for (const [alertId, internalAlert] of alerts) {
          try {
            const alert = await this.alertService.findOne(alertId);
            if (alert && this.checkMACDCondition(macdData, eventType)) {
              await this.triggerAlert(alert, internalAlert, { macdData });
            }
          } catch (error) {
            this.logger.error(`Error checking MACD alert ${alertId}:`, error);
          }
        }
      } catch (error) {
        this.logger.error(`Error in MACD monitoring for ${symbol}:`, error);
      }
    }, this.getMonitoringInterval(timeframe));

    return interval;
  }

  private async triggerAlert(
    alert: {
      symbol: string;
      timeframe: string;
      eventType: MonitorEventType;
      uuid: string;
    },
    internalAlert: InternalAlert,
    triggerData: any,
  ) {
    try {
      // Emit notification event
      // emit eventTriggered with event data like uuid of alert, sybol, timeframe, eventType, countremainig, triggerData which alertType can update. we can add userId as well in alert
      await this.notificationService.emitAlertTriggered(alert, triggerData);

      this.logger.log(`Alert triggered: ${alert.symbol} - ${alert.eventType}`);

      // Handle count-based monitoring
      if (!internalAlert.isEternal) {
        internalAlert.remainingCount--;

        if (internalAlert.remainingCount <= 0) {
          // Alert has reached its trigger limit, stop monitoring
          this.logger.log(
            `Alert ${alert.uuid} has reached its trigger limit, stopping monitoring`,
          );
          await this.removeAlertFromMonitoring(alert.uuid);
        }
      }
    } catch (error) {
      this.logger.error(`Error triggering alert ${alert.uuid}:`, error);
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
    alertType: MonitorEventType,
  ): boolean {
    const { upperBand, lowerBand } = bbData;

    if (alertType === MonitorEventType.BOLLINGER_BANDS_HIGH) {
      return currentPrice > upperBand;
    } else if (alertType === MonitorEventType.BOLLINGER_BANDS_LOW) {
      return currentPrice < lowerBand;
    }

    return false;
  }

  private checkEMACrossoverCondition(
    emaData: any,
    alertType: MonitorEventType,
  ): boolean {
    const { fastEMA, slowEMA, previousFastEMA, previousSlowEMA } = emaData;

    if (alertType === MonitorEventType.EMA_HIGH) {
      return previousFastEMA <= previousSlowEMA && fastEMA > slowEMA;
    } else if (alertType === MonitorEventType.EMA_LOW) {
      return previousFastEMA >= previousSlowEMA && fastEMA < slowEMA;
    }

    return false;
  }

  private checkRSICondition(
    rsiData: any,
    rsiThreshold: number,
    alertType: MonitorEventType,
  ): boolean {
    const { rsi } = rsiData;

    if (alertType === MonitorEventType.RSI_LOW && rsi <= rsiThreshold) {
      return true;
    } else if (
      alertType === MonitorEventType.RSI_CROSSOVER_HIGH &&
      rsi >= rsiThreshold
    ) {
      return true;
    }

    return false;
  }

  private checkMACDCondition(
    macdData: any,
    alertType: MonitorEventType,
  ): boolean {
    const { macd, signal, histogram } = macdData;

    if (alertType === MonitorEventType.MACD_CROSSOVER_HIGH) {
      return macd > signal && histogram > 0;
    } else if (alertType === MonitorEventType.MACD_CROSSOVER_LOW) {
      return macd < signal && histogram < 0;
    }

    return false;
  }

  private async loadActiveAlerts() {
    try {
      const activeAlerts = await this.alertService.findActiveAlerts();
      for (const alert of activeAlerts) {
        await this.addAlertToMonitoring(alert);
      }
      this.logger.log(`Loaded ${activeAlerts.length} active alerts`);
    } catch (error) {
      this.logger.error('Error loading active alerts:', error);
    }
  }

  // Public methods for external use
  async getActiveAlerts(): Promise<any[]> {
    const alerts: any[] = [];

    for (const [symbol, timeframeMap] of this.activeAlerts) {
      for (const [timeframe, eventTypeMap] of timeframeMap) {
        for (const [eventType, alertMap] of eventTypeMap) {
          for (const [alertId, internalAlert] of alertMap) {
            // Get the alert data from the service
            try {
              const alert = await this.alertService.findOne(alertId);
              if (alert) {
                alerts.push(alert);
              }
            } catch (error) {
              this.logger.error(`Error getting alert ${alertId}:`, error);
            }
          }
        }
      }
    }

    return alerts;
  }

  async getMonitoringStatus(): Promise<any> {
    return {
      activeAlerts: this.activeAlerts.size,
      alertGroups: this.alertGroups.size,
      status: 'active',
    };
  }

  async getAlertsBySymbolAndTimeframe(
    symbol: string,
    timeframe: string,
  ): Promise<any[]> {
    const alerts: any[] = [];

    const timeframeMap = this.activeAlerts.get(symbol);
    if (timeframeMap) {
      const eventTypeMap = timeframeMap.get(timeframe);
      if (eventTypeMap) {
        for (const [eventType, alertMap] of eventTypeMap) {
          for (const [alertId, internalAlert] of alertMap) {
            try {
              const alert = await this.alertService.findOne(alertId);
              if (alert) {
                alerts.push(alert);
              }
            } catch (error) {
              this.logger.error(`Error getting alert ${alertId}:`, error);
            }
          }
        }
      }
    }

    return alerts;
  }

  async getAlertsByMonitorType(monitorType: MonitorEventType): Promise<any[]> {
    const alerts: any[] = [];

    for (const [symbol, timeframeMap] of this.activeAlerts) {
      for (const [timeframe, eventTypeMap] of timeframeMap) {
        const alertMap = eventTypeMap.get(monitorType);
        if (alertMap) {
          for (const [alertId, internalAlert] of alertMap) {
            try {
              const alert = await this.alertService.findOne(alertId);
              if (alert) {
                alerts.push(alert);
              }
            } catch (error) {
              this.logger.error(`Error getting alert ${alertId}:`, error);
            }
          }
        }
      }
    }

    return alerts;
  }
  
}
