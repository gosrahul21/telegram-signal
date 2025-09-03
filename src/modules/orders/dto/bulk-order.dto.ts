import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Exchange,
  OrderSide,
  OrderType,
  TimeInForce,
  OrderSource,
  OrderPriority,
  OrderStatus,
} from '../orders.entity';
import { CreateOrderDto } from './create-order.dto';

export class BulkCreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  orders: CreateOrderDto[];

  @IsOptional()
  @IsBoolean()
  executeImmediately?: boolean = true;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkUpdateOrderDto {
  @IsArray()
  @IsString({ each: true })
  orderIds: string[];

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

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
  @IsBoolean()
  isPaperTrade?: boolean;
}

export class BulkCancelOrderDto {
  @IsArray()
  @IsString({ each: true })
  orderIds: string[];

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  force?: boolean = false;
}

export class OrderExecutionDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  exchangeOrderId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  filledQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averagePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fees?: number;

  @IsOptional()
  @IsString()
  executionNotes?: string;
}
