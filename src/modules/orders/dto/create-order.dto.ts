import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Exchange,
  OrderSide,
  OrderType,
  TimeInForce,
  OrderSource,
  OrderPriority,
} from '../orders.entity';

export class CreateOrderDto {
  @IsEnum(Exchange)
  exchange: Exchange;

  @IsString()
  symbol: string;

  @IsEnum(OrderSide)
  side: OrderSide;

  @IsEnum(OrderType)
  type: OrderType;

  @IsNumber()
  @Min(0.00000001)
  quantity: number;

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
  @IsEnum(TimeInForce)
  timeInForce?: TimeInForce;

  @IsOptional()
  @IsEnum(OrderSource)
  source?: OrderSource;

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @IsOptional()
  @IsString()
  clientOrderId?: string;

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
  @IsString()
  parentOrderId?: string;

  @IsOptional()
  @IsBoolean()
  isPaperTrade?: boolean;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @Type(() => Object)
  metadata?: {
    signalData?: {
      indicator?: string;
      timeframe?: string;
      confidence?: number;
      rsi?: number;
      ema?: number;
      macd?: number;
      bollingerBands?: {
        upper: number;
        middle: number;
        lower: number;
      };
    };
    riskManagement?: {
      maxRisk?: number;
      riskRewardRatio?: number;
      positionSize?: number;
      stopLossPercentage?: number;
      takeProfitPercentage?: number;
    };
    custom?: Record<string, any>;
  };
}
