import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './services/monitoring.service';

@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitoringService) {}

  @Get('rsi')
  async getRsiStatus() {
    // return this.monitorService.getRsiStatus();
  }

  @Get('bollinger-bands')
  async getBollingerBandsStatus() {
    // return this.monitorService.getBollingerBandsStatus();
  }

  @Get('macd')
  async getMacdStatus() {
    // return this.monitorService.getMacdStatus();
  }
}
