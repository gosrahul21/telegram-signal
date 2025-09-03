import {
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Exchange,
  OrderSide,
  OrderType,
  OrderStatus,
  OrderSource,
  OrderPriority,
} from '../orders.entity';

export class QueryOrderDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(Exchange)
  exchange?: Exchange;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsEnum(OrderSide)
  side?: OrderSide;

  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(OrderSource)
  source?: OrderSource;

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @IsOptional()
  @IsString()
  signalId?: string;

  @IsOptional()
  @IsString()
  alertId?: string;

  @IsOptional()
  @IsString()
  strategyId?: string;

  @IsOptional()
  @IsString()
  clientOrderId?: string;

  @IsOptional()
  @IsString()
  exchangeOrderId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPaperTrade?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isBacktest?: boolean;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
