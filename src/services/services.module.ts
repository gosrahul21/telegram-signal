import { Module } from '@nestjs/common';
import { CoindcxModule } from './coindcx/coindcx.module';
import { PriceApiModule } from './price-api/price-api.module';
import { OrderModule } from './order/order.module';
import { SignalsModule } from './signals/signals.module';
import { UserServiceModule } from './user-service/user-service.module';
import { OpenAIModule } from './openai/openai.module';
import { UpstoxApiModule } from './upstox-api/upstox-api.module';
import { ProcessRSISignalModule } from './process-rsi-signal/process-rsi-signal.module';
import { GetStockHistoricalCandlesModule } from './get-stock-historical-candles/get-stock-historical-candles.module';

@Module({
  imports: [
    CoindcxModule,
    PriceApiModule,
    OrderModule,
    SignalsModule,
    UserServiceModule,
    OpenAIModule,
    UpstoxApiModule,
    ProcessRSISignalModule,
    GetStockHistoricalCandlesModule,
  ],
})
export class ServicesModule {}
