import { Module } from '@nestjs/common';
import { DelayService } from './delay.service';
import { GenerateRSIOverBoughtSignalService } from './generate-rsi-over-bought-signal.service';
import { GenerateRSIOverSoldSignalService } from './generate-rsi-over-sold-signal.service';
import { RenderRSISignalService } from './render-rsi-signal.service';
import { RenderSignalsService } from './render-signals.service';
import { RsiSignalService } from './rsi-signal.service';

@Module({
  providers: [
    DelayService,
    GenerateRSIOverBoughtSignalService,
    GenerateRSIOverSoldSignalService,
    RenderRSISignalService,
    RenderSignalsService,
    RsiSignalService,
  ],
  exports: [
    DelayService,
    GenerateRSIOverBoughtSignalService,
    GenerateRSIOverSoldSignalService,
    RenderRSISignalService,
    RenderSignalsService,
    RsiSignalService,
  ],
})
export class UtilsModule {}
