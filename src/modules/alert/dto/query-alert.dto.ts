import { IsOptional, IsString, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { MonitorEventType, Timeframe } from '../alert.entity';
import { Transform } from 'class-transformer';

export class QueryAlertDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(MonitorEventType)
  type?: MonitorEventType;

  @IsOptional()
  @IsEnum(Timeframe)
  timeframe?: Timeframe;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  search?: string;
}
