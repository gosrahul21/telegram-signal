import { Module } from '@nestjs/common';
import { MonitoringService } from './services/monitoring.service';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { PriceMonitoringService } from './price-monitoring.service';
import { AlertModule } from '../alert/alert.module';
import { AlertListenerService } from './alert-listener.service';
import { BinancePriceApiService } from '@/services/binance-price-api.service';
import { Monitoring, MonitoringSchema } from './entity/monitoring.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AlertModule,
    MongooseModule.forFeature([
      { name: Monitoring.name, schema: MonitoringSchema },
    ]),
  ],
  providers: [
    MonitoringService,
    TechnicalAnalysisService,
    PriceMonitoringService,
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
