"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSchema = exports.Order = exports.OrderPriority = exports.OrderSource = exports.TimeInForce = exports.OrderStatus = exports.OrderType = exports.OrderSide = exports.Exchange = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
var Exchange;
(function (Exchange) {
    Exchange["BINANCE"] = "binance";
    Exchange["UPSTOX"] = "upstox";
    Exchange["COINDCX"] = "coindcx";
    Exchange["MANUAL"] = "manual";
})(Exchange || (exports.Exchange = Exchange = {}));
var OrderSide;
(function (OrderSide) {
    OrderSide["BUY"] = "BUY";
    OrderSide["SELL"] = "SELL";
})(OrderSide || (exports.OrderSide = OrderSide = {}));
var OrderType;
(function (OrderType) {
    OrderType["MARKET"] = "MARKET";
    OrderType["LIMIT"] = "LIMIT";
    OrderType["STOP_LOSS"] = "STOP_LOSS";
    OrderType["STOP_LOSS_LIMIT"] = "STOP_LOSS_LIMIT";
    OrderType["TAKE_PROFIT"] = "TAKE_PROFIT";
    OrderType["TAKE_PROFIT_LIMIT"] = "TAKE_PROFIT_LIMIT";
    OrderType["LIMIT_MAKER"] = "LIMIT_MAKER";
    OrderType["STOP"] = "STOP";
    OrderType["STOP_MARKET"] = "STOP_MARKET";
    OrderType["TRAILING_STOP"] = "TRAILING_STOP";
    OrderType["OCO"] = "OCO";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["SUBMITTED"] = "SUBMITTED";
    OrderStatus["NEW"] = "NEW";
    OrderStatus["PARTIALLY_FILLED"] = "PARTIALLY_FILLED";
    OrderStatus["FILLED"] = "FILLED";
    OrderStatus["CANCELED"] = "CANCELED";
    OrderStatus["REJECTED"] = "REJECTED";
    OrderStatus["EXPIRED"] = "EXPIRED";
    OrderStatus["FAILED"] = "FAILED";
    OrderStatus["PENDING_CANCEL"] = "PENDING_CANCEL";
    OrderStatus["PENDING_REPLACE"] = "PENDING_REPLACE";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var TimeInForce;
(function (TimeInForce) {
    TimeInForce["GTC"] = "GTC";
    TimeInForce["IOC"] = "IOC";
    TimeInForce["FOK"] = "FOK";
    TimeInForce["GTX"] = "GTX";
    TimeInForce["DAY"] = "DAY";
})(TimeInForce || (exports.TimeInForce = TimeInForce = {}));
var OrderSource;
(function (OrderSource) {
    OrderSource["SIGNAL"] = "signal";
    OrderSource["MANUAL"] = "manual";
    OrderSource["ALGORITHM"] = "algorithm";
    OrderSource["COPY_TRADING"] = "copy_trading";
    OrderSource["GRID_TRADING"] = "grid_trading";
    OrderSource["DCA"] = "dca";
    OrderSource["API"] = "api";
})(OrderSource || (exports.OrderSource = OrderSource = {}));
var OrderPriority;
(function (OrderPriority) {
    OrderPriority["LOW"] = "low";
    OrderPriority["MEDIUM"] = "medium";
    OrderPriority["HIGH"] = "high";
    OrderPriority["CRITICAL"] = "critical";
})(OrderPriority || (exports.OrderPriority = OrderPriority = {}));
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, default: () => (0, uuid_1.v4)() }),
    __metadata("design:type", String)
], Order.prototype, "uuid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: Exchange }),
    __metadata("design:type", String)
], Order.prototype, "exchange", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Order.prototype, "symbol", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OrderSide }),
    __metadata("design:type", String)
], Order.prototype, "side", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OrderType }),
    __metadata("design:type", String)
], Order.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OrderStatus, default: OrderStatus.PENDING }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TimeInForce, default: TimeInForce.GTC }),
    __metadata("design:type", String)
], Order.prototype, "timeInForce", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OrderSource, default: OrderSource.MANUAL }),
    __metadata("design:type", String)
], Order.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OrderPriority, default: OrderPriority.MEDIUM }),
    __metadata("design:type", String)
], Order.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "stopPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "takeProfitPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "stopLossPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "filledQuantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "averagePrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "totalFees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "exchangeOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "clientOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "originalClientOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "submittedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "filledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "canceledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "expiredAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "signalId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "alertId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "strategyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Order.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Order.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "maxRiskAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "positionSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "parentOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Order.prototype, "childOrderIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "pnl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "pnlPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "pnlCalculatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Order.prototype, "isPaperTrade", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Order.prototype, "isBacktest", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "complianceNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Order.prototype, "auditTrail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "validUntil", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "retryCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 3 }),
    __metadata("design:type", Number)
], Order.prototype, "maxRetries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "nextRetryAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "lastError", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Order.prototype, "errorDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Order.prototype, "webhookSent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "webhookSentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Order.prototype, "notificationSent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "notificationSentAt", void 0);
exports.Order = Order = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Order);
exports.OrderSchema = mongoose_1.SchemaFactory.createForClass(Order);
exports.OrderSchema.index({ userId: 1, status: 1 });
exports.OrderSchema.index({ userId: 1, symbol: 1 });
exports.OrderSchema.index({ userId: 1, createdAt: -1 });
exports.OrderSchema.index({ exchange: 1, symbol: 1 });
exports.OrderSchema.index({ exchangeOrderId: 1, exchange: 1 });
exports.OrderSchema.index({ clientOrderId: 1 });
exports.OrderSchema.index({ signalId: 1 });
exports.OrderSchema.index({ alertId: 1 });
exports.OrderSchema.index({ strategyId: 1 });
exports.OrderSchema.index({ status: 1, createdAt: 1 });
exports.OrderSchema.index({ source: 1, createdAt: 1 });
exports.OrderSchema.index({ tags: 1 });
exports.OrderSchema.index({ isPaperTrade: 1, isBacktest: 1 });
exports.OrderSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });
exports.OrderSchema.index({ nextRetryAt: 1 });
exports.OrderSchema.index({ userId: 1, exchange: 1, status: 1 });
exports.OrderSchema.index({ userId: 1, symbol: 1, status: 1 });
exports.OrderSchema.index({ userId: 1, side: 1, status: 1 });
exports.OrderSchema.index({ userId: 1, type: 1, status: 1 });
exports.OrderSchema.index({ userId: 1, source: 1, createdAt: -1 });
exports.OrderSchema.index({
    symbol: 'text',
    notes: 'text',
    tags: 'text',
    'metadata.signalData.indicator': 'text',
});
exports.OrderSchema.virtual('remainingQuantity').get(function () {
    return this.quantity - this.filledQuantity;
});
exports.OrderSchema.virtual('fillPercentage').get(function () {
    return this.quantity > 0 ? (this.filledQuantity / this.quantity) * 100 : 0;
});
exports.OrderSchema.virtual('orderValue').get(function () {
    return this.price ? this.quantity * this.price : 0;
});
exports.OrderSchema.virtual('filledValue').get(function () {
    return this.filledQuantity * this.averagePrice;
});
exports.OrderSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        const changes = this.modifiedPaths();
        this.auditTrail.push(`${new Date().toISOString()}: Modified fields: ${changes.join(', ')}`);
    }
    if (this.isModified('status') &&
        this.status === OrderStatus.SUBMITTED &&
        !this.submittedAt) {
        this.submittedAt = new Date();
    }
    if (this.isModified('status') &&
        this.status === OrderStatus.FILLED &&
        !this.filledAt) {
        this.filledAt = new Date();
    }
    if (this.isModified('status') &&
        this.status === OrderStatus.CANCELED &&
        !this.canceledAt) {
        this.canceledAt = new Date();
    }
    next();
});
exports.OrderSchema.methods.isFilled = function () {
    return this.status === OrderStatus.FILLED;
};
exports.OrderSchema.methods.isActive = function () {
    return [
        OrderStatus.PENDING,
        OrderStatus.SUBMITTED,
        OrderStatus.NEW,
        OrderStatus.PARTIALLY_FILLED,
        OrderStatus.PENDING_CANCEL,
        OrderStatus.PENDING_REPLACE,
    ].includes(this.status);
};
exports.OrderSchema.methods.isCompleted = function () {
    return [
        OrderStatus.FILLED,
        OrderStatus.CANCELED,
        OrderStatus.REJECTED,
        OrderStatus.EXPIRED,
        OrderStatus.FAILED,
    ].includes(this.status);
};
exports.OrderSchema.methods.canCancel = function () {
    return [
        OrderStatus.PENDING,
        OrderStatus.SUBMITTED,
        OrderStatus.NEW,
        OrderStatus.PARTIALLY_FILLED,
    ].includes(this.status);
};
exports.OrderSchema.methods.canModify = function () {
    return [OrderStatus.PENDING, OrderStatus.SUBMITTED, OrderStatus.NEW].includes(this.status);
};
exports.OrderSchema.methods.addToAuditTrail = function (message) {
    this.auditTrail.push(`${new Date().toISOString()}: ${message}`);
};
exports.OrderSchema.methods.calculatePnL = function (currentPrice) {
    if (!this.isFilled()) {
        return { pnl: 0, pnlPercentage: 0 };
    }
    const filledValue = this.filledQuantity * this.averagePrice;
    const currentValue = this.filledQuantity * currentPrice;
    const pnl = this.side === OrderSide.BUY
        ? currentValue - filledValue - this.totalFees
        : filledValue - currentValue - this.totalFees;
    const pnlPercentage = filledValue > 0 ? (pnl / filledValue) * 100 : 0;
    return { pnl, pnlPercentage };
};
exports.OrderSchema.statics.findActiveOrders = function (userId) {
    return this.find({
        userId: new mongoose_2.Types.ObjectId(userId),
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
exports.OrderSchema.statics.findOrdersBySymbol = function (userId, symbol) {
    return this.find({ userId: new mongoose_2.Types.ObjectId(userId), symbol });
};
exports.OrderSchema.statics.findOrdersBySignal = function (signalId) {
    return this.find({ signalId });
};
exports.OrderSchema.statics.getOrderStats = function (userId) {
    return this.aggregate([
        { $match: { userId: new mongoose_2.Types.ObjectId(userId) } },
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
//# sourceMappingURL=orders.entity.js.map