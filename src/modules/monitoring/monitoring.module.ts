import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MonitoringService } from './monitoring.service';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { PriceMonitoringService } from './price-monitoring.service';
import { BollingerBandsService } from './bollinger-bands.service';
import { MACDService } from './macd.service';
import { RSIService } from './rsi.service';
import { EMAService } from './ema.service';
import { NotificationService } from './notification.service';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AlertModule,
  ],
  providers: [
    MonitoringService,
    TechnicalAnalysisService,
    PriceMonitoringService,
    BollingerBandsService,
    MACDService,
    RSIService,
    EMAService,
    NotificationService,
  ],
  exports: [
    MonitoringService,
    TechnicalAnalysisService,
    PriceMonitoringService,
    NotificationService,
  ],
})
export class MonitoringModule {}
