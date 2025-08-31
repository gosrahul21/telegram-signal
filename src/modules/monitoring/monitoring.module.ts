import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { PriceMonitoringService } from './price-monitoring.service';
import { BollingerBandsService } from './bollinger-bands.service';
import { MACDService } from './macd.service';
import { RSIService } from './rsi.service';
import { EMAService } from './ema.service';
import { AlertModule } from '../alert/alert.module';
import { AlertListenerService } from './alert-listener.service';
import { BinancePriceApiService } from '@/services/binance-price-api.service';

@Module({
  imports: [AlertModule],
  providers: [
    MonitoringService,
    TechnicalAnalysisService,
    PriceMonitoringService,
    BollingerBandsService,
    MACDService,
    RSIService,
    EMAService,
    AlertListenerService,
    BinancePriceApiService,
  ],
  exports: [
    MonitoringService,
    TechnicalAnalysisService,
    PriceMonitoringService,
  ],
})
export class MonitoringModule {}
