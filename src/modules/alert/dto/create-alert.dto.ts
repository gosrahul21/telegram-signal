import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { MonitorEventType, Timeframe } from '../alert.entity';

export class CreateAlertDto {
  @IsString()
  symbol: string;

  // @IsString()
  // userId: string;

  @IsEnum(MonitorEventType)
  type: MonitorEventType;

  @IsNumber()
  @Min(0)
  count: number;

  @IsOptional()
  @IsBoolean()
  infinite?: boolean;

  @IsEnum(Timeframe)
  timeframe: Timeframe;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  userId?: string;
}
