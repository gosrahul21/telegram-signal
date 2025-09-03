import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type OrderDocument = Order & Document;

// Exchange types
export enum Exchange {
  BINANCE = 'binance',
  UPSTOX = 'upstox',
  COINDCX = 'coindcx',
  MANUAL = 'manual', // For manual orders or paper trading
}

// Order side (buy/sell)
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

// Order type
export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP_LOSS = 'STOP_LOSS',
  STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
  LIMIT_MAKER = 'LIMIT_MAKER',
  STOP = 'STOP',
  STOP_MARKET = 'STOP_MARKET',
  TRAILING_STOP = 'TRAILING_STOP',
  OCO = 'OCO', // One-Cancels-Other
}

// Order status
export enum OrderStatus {
  PENDING = 'PENDING', // Order created but not yet submitted to exchange
  SUBMITTED = 'SUBMITTED', // Submitted to exchange
  NEW = 'NEW', // Order accepted by exchange
  PARTIALLY_FILLED = 'PARTIALLY_FILLED', // Partially filled
  FILLED = 'FILLED', // Completely filled
  CANCELED = 'CANCELED', // Canceled by user
  REJECTED = 'REJECTED', // Rejected by exchange
  EXPIRED = 'EXPIRED', // Order expired
  FAILED = 'FAILED', // Order failed
  PENDING_CANCEL = 'PENDING_CANCEL', // Cancel request submitted
  PENDING_REPLACE = 'PENDING_REPLACE', // Replace request submitted
}

// Time in force
export enum TimeInForce {
  GTC = 'GTC', // Good Till Canceled
  IOC = 'IOC', // Immediate or Cancel
  FOK = 'FOK', // Fill or Kill
  GTX = 'GTX', // Good Till Crossing
  DAY = 'DAY', // Day order
}

// Order source (how the order was created)
export enum OrderSource {
  SIGNAL = 'signal', // Created from trading signal
  MANUAL = 'manual', // Manually created by user
  ALGORITHM = 'algorithm', // Created by trading algorithm
  COPY_TRADING = 'copy_trading', // Created from copy trading
  GRID_TRADING = 'grid_trading', // Created from grid trading strategy
  DCA = 'dca', // Dollar Cost Averaging
  API = 'api', // Created via API
}

// Order priority
export enum OrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, default: () => uuidv4() })
  uuid: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: Exchange })
  exchange: Exchange;

  @Prop({ required: true })
  symbol: string; // e.g., 'BTCUSDT', 'AAPL', 'NIFTY50'

  @Prop({ required: true, enum: OrderSide })
  side: OrderSide;

  @Prop({ required: true, enum: OrderType })
  type: OrderType;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ required: true, enum: TimeInForce, default: TimeInForce.GTC })
  timeInForce: TimeInForce;

  @Prop({ required: true, enum: OrderSource, default: OrderSource.MANUAL })
  source: OrderSource;

  @Prop({ required: true, enum: OrderPriority, default: OrderPriority.MEDIUM })
  priority: OrderPriority;

  // Order quantities and prices
  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ type: Number })
  price?: number; // Limit price for limit orders

  @Prop({ type: Number })
  stopPrice?: number; // Stop price for stop orders

  @Prop({ type: Number })
  takeProfitPrice?: number; // Take profit price

  @Prop({ type: Number })
  stopLossPrice?: number; // Stop loss price

  @Prop({ type: Number, default: 0 })
  filledQuantity: number; // Quantity that has been filled

  @Prop({ type: Number, default: 0 })
  averagePrice: number; // Average fill price

  @Prop({ type: Number, default: 0 })
  totalFees: number; // Total fees paid for this order

  // Exchange-specific fields
  @Prop({ type: String })
  exchangeOrderId?: string; // Order ID from the exchange

  @Prop({ type: String })
  clientOrderId?: string; // Client-specified order ID

  @Prop({ type: String })
  originalClientOrderId?: string; // Original client order ID for OCO orders

  // Order execution details
  @Prop({ type: Date })
  submittedAt?: Date; // When order was submitted to exchange

  @Prop({ type: Date })
  filledAt?: Date; // When order was completely filled

  @Prop({ type: Date })
  canceledAt?: Date; // When order was canceled

  @Prop({ type: Date })
  expiredAt?: Date; // When order expires

  // Signal and alert references
  @Prop({ type: String })
  signalId?: string; // Reference to the signal that triggered this order

  @Prop({ type: String })
  alertId?: string; // Reference to the alert that triggered this order

  @Prop({ type: String })
  strategyId?: string; // Reference to the trading strategy

  // Order metadata
  @Prop({ type: Object })
  metadata?: {
    // Exchange-specific metadata
    exchangeData?: Record<string, any>;

    // Trading signal metadata
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

    // Risk management
    riskManagement?: {
      maxRisk?: number;
      riskRewardRatio?: number;
      positionSize?: number;
      stopLossPercentage?: number;
      takeProfitPercentage?: number;
    };

    // Order execution
    execution?: {
      slippage?: number;
      latency?: number;
      retryCount?: number;
      errorMessages?: string[];
    };

    // Additional custom fields
    custom?: Record<string, any>;
  };

  // Order tags for categorization
  @Prop({ type: [String], default: [] })
  tags: string[];

  // Order notes
  @Prop({ type: String })
  notes?: string;

  // Risk management
  @Prop({ type: Number })
  maxRiskAmount?: number; // Maximum amount to risk

  @Prop({ type: Number })
  positionSize?: number; // Position size in base currency

  // Order relationships
  @Prop({ type: String })
  parentOrderId?: string; // For OCO or bracket orders

  @Prop({ type: [String], default: [] })
  childOrderIds: string[]; // Child orders (e.g., stop loss, take profit)

  // Performance tracking
  @Prop({ type: Number })
  pnl?: number; // Profit/Loss for this order

  @Prop({ type: Number })
  pnlPercentage?: number; // Profit/Loss percentage

  @Prop({ type: Date })
  pnlCalculatedAt?: Date; // When PnL was last calculated

  // Order validation
  @Prop({ type: Boolean, default: false })
  isPaperTrade: boolean; // Whether this is a paper trade

  @Prop({ type: Boolean, default: false })
  isBacktest: boolean; // Whether this is a backtest order

  // Compliance and audit
  @Prop({ type: String })
  complianceNotes?: string;

  @Prop({ type: [String], default: [] })
  auditTrail: string[]; // Audit trail of order changes

  // Order expiration
  @Prop({ type: Date })
  validUntil?: Date; // Order validity period

  // Retry mechanism
  @Prop({ type: Number, default: 0 })
  retryCount: number;

  @Prop({ type: Number, default: 3 })
  maxRetries: number;

  @Prop({ type: Date })
  nextRetryAt?: Date;

  // Error handling
  @Prop({ type: String })
  lastError?: string;

  @Prop({ type: Object })
  errorDetails?: Record<string, any>;

  // Webhook and notification
  @Prop({ type: Boolean, default: false })
  webhookSent: boolean;

  @Prop({ type: Date })
  webhookSentAt?: Date;

  @Prop({ type: Boolean, default: false })
  notificationSent: boolean;

  @Prop({ type: Date })
  notificationSentAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes for better query performance
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ userId: 1, symbol: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ exchange: 1, symbol: 1 });
OrderSchema.index({ exchangeOrderId: 1, exchange: 1 });
OrderSchema.index({ clientOrderId: 1 });
OrderSchema.index({ signalId: 1 });
OrderSchema.index({ alertId: 1 });
OrderSchema.index({ strategyId: 1 });
OrderSchema.index({ status: 1, createdAt: 1 });
OrderSchema.index({ source: 1, createdAt: 1 });
OrderSchema.index({ tags: 1 });
OrderSchema.index({ isPaperTrade: 1, isBacktest: 1 });
OrderSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired orders
OrderSchema.index({ nextRetryAt: 1 }); // For retry mechanism

// Compound indexes for common queries
OrderSchema.index({ userId: 1, exchange: 1, status: 1 });
OrderSchema.index({ userId: 1, symbol: 1, status: 1 });
OrderSchema.index({ userId: 1, side: 1, status: 1 });
OrderSchema.index({ userId: 1, type: 1, status: 1 });
OrderSchema.index({ userId: 1, source: 1, createdAt: -1 });

// Text index for searching
OrderSchema.index({
  symbol: 'text',
  notes: 'text',
  tags: 'text',
  'metadata.signalData.indicator': 'text',
});

// Virtual for remaining quantity
OrderSchema.virtual('remainingQuantity').get(function () {
  return this.quantity - this.filledQuantity;
});

// Virtual for fill percentage
OrderSchema.virtual('fillPercentage').get(function () {
  return this.quantity > 0 ? (this.filledQuantity / this.quantity) * 100 : 0;
});

// Virtual for order value
OrderSchema.virtual('orderValue').get(function () {
  return this.price ? this.quantity * this.price : 0;
});

// Virtual for filled value
OrderSchema.virtual('filledValue').get(function () {
  return this.filledQuantity * this.averagePrice;
});

// Pre-save middleware
OrderSchema.pre('save', function (next) {
  // Update audit trail
  if (this.isModified() && !this.isNew) {
    const changes = this.modifiedPaths();
    this.auditTrail.push(
      `${new Date().toISOString()}: Modified fields: ${changes.join(', ')}`,
    );
  }

  // Set submittedAt when status changes to SUBMITTED
  if (
    this.isModified('status') &&
    this.status === OrderStatus.SUBMITTED &&
    !this.submittedAt
  ) {
    this.submittedAt = new Date();
  }

  // Set filledAt when status changes to FILLED
  if (
    this.isModified('status') &&
    this.status === OrderStatus.FILLED &&
    !this.filledAt
  ) {
    this.filledAt = new Date();
  }

  // Set canceledAt when status changes to CANCELED
  if (
    this.isModified('status') &&
    this.status === OrderStatus.CANCELED &&
    !this.canceledAt
  ) {
    this.canceledAt = new Date();
  }

  next();
});

// Instance methods
OrderSchema.methods.isFilled = function () {
  return this.status === OrderStatus.FILLED;
};

OrderSchema.methods.isActive = function () {
  return [
    OrderStatus.PENDING,
    OrderStatus.SUBMITTED,
    OrderStatus.NEW,
    OrderStatus.PARTIALLY_FILLED,
    OrderStatus.PENDING_CANCEL,
    OrderStatus.PENDING_REPLACE,
  ].includes(this.status);
};

OrderSchema.methods.isCompleted = function () {
  return [
    OrderStatus.FILLED,
    OrderStatus.CANCELED,
    OrderStatus.REJECTED,
    OrderStatus.EXPIRED,
    OrderStatus.FAILED,
  ].includes(this.status);
};

OrderSchema.methods.canCancel = function () {
  return [
    OrderStatus.PENDING,
    OrderStatus.SUBMITTED,
    OrderStatus.NEW,
    OrderStatus.PARTIALLY_FILLED,
  ].includes(this.status);
};

OrderSchema.methods.canModify = function () {
  return [OrderStatus.PENDING, OrderStatus.SUBMITTED, OrderStatus.NEW].includes(
    this.status,
  );
};

OrderSchema.methods.addToAuditTrail = function (message: string) {
  this.auditTrail.push(`${new Date().toISOString()}: ${message}`);
};

OrderSchema.methods.calculatePnL = function (currentPrice: number) {
  if (!this.isFilled()) {
    return { pnl: 0, pnlPercentage: 0 };
  }

  const filledValue = this.filledQuantity * this.averagePrice;
  const currentValue = this.filledQuantity * currentPrice;
  const pnl =
    this.side === OrderSide.BUY
      ? currentValue - filledValue - this.totalFees
      : filledValue - currentValue - this.totalFees;

  const pnlPercentage = filledValue > 0 ? (pnl / filledValue) * 100 : 0;

  return { pnl, pnlPercentage };
};

// Static methods
OrderSchema.statics.findActiveOrders = function (userId: string) {
  return this.find({
    userId: new Types.ObjectId(userId),
    status: {
      $in: [
        OrderStatus.PENDING,
        OrderStatus.SUBMITTED,
        OrderStatus.NEW,
        OrderStatus.PARTIALLY_FILLED,
      ],
    },
  });
};

OrderSchema.statics.findOrdersBySymbol = function (
  userId: string,
  symbol: string,
) {
  return this.find({ userId: new Types.ObjectId(userId), symbol });
};

OrderSchema.statics.findOrdersBySignal = function (signalId: string) {
  return this.find({ signalId });
};

OrderSchema.statics.getOrderStats = function (userId: string) {
  return this.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        filledOrders: {
          $sum: { $cond: [{ $eq: ['$status', OrderStatus.FILLED] }, 1, 0] },
        },
        canceledOrders: {
          $sum: { $cond: [{ $eq: ['$status', OrderStatus.CANCELED] }, 1, 0] },
        },
        totalVolume: { $sum: '$filledQuantity' },
        totalFees: { $sum: '$totalFees' },
        totalPnL: { $sum: '$pnl' },
      },
    },
  ]);
};

// Schema is already exported above
