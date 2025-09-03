import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, OrderPriority } from '../orders.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stopPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  takeProfitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stopLossPrice?: number;

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRiskAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  positionSize?: number;

  @IsOptional()
  @IsBoolean()
  isPaperTrade?: boolean;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @Type(() => Object)
  metadata?: Record<string, any>;
}
