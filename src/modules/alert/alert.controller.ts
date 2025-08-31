import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertDto } from './dto/query-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  create(@Body() createAlertDto: CreateAlertDto) {
    console.log('createAlertDto', createAlertDto);
    return this.alertService.create(createAlertDto);
  }

  @Get()
  findAll(@Query() query: QueryAlertDto) {
    return this.alertService.findAll(query);
  }

  @Get('active')
  findActiveAlerts() {
    return this.alertService.findActiveAlerts();
  }

  @Get('symbol/:symbol')
  findAlertsBySymbol(@Param('symbol') symbol: string) {
    return this.alertService.findAlertsBySymbol(symbol);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.alertService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertService.update(id, updateAlertDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.alertService.remove(id);
  }
}
