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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const orders_entity_1 = require("./orders.entity");
const eventsType_1 = require("../../utils/constants/eventsType");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(orderModel, eventEmitter) {
        this.orderModel = orderModel;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async createOrder(userId, createOrderDto) {
        try {
            const order = new this.orderModel({
                ...createOrderDto,
                userId: new mongoose_2.Types.ObjectId(userId),
                status: orders_entity_1.OrderStatus.PENDING,
            });
            const savedOrder = await order.save();
            this.logger.log(`Order created: ${savedOrder.uuid} for user ${userId}`);
            this.eventEmitter.emit(eventsType_1.EventsType.ORDER_CREATED, {
                orderId: savedOrder._id,
                userId,
                order: savedOrder.toObject(),
            });
            return savedOrder;
        }
        catch (error) {
            this.logger.error(`Error creating order for user ${userId}:`, error);
            throw new common_1.BadRequestException('Failed to create order');
        }
    }
    async getOrders(userId, queryDto) {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = queryDto;
        const skip = (page - 1) * limit;
        const filter = { userId: new mongoose_2.Types.ObjectId(userId) };
        if (filters.exchange)
            filter.exchange = filters.exchange;
        if (filters.symbol)
            filter.symbol = { $regex: filters.symbol, $options: 'i' };
        if (filters.side)
            filter.side = filters.side;
        if (filters.type)
            filter.type = filters.type;
        if (filters.status)
            filter.status = filters.status;
        if (filters.source)
            filter.source = filters.source;
        if (filters.priority)
            filter.priority = filters.priority;
        if (filters.signalId)
            filter.signalId = filters.signalId;
        if (filters.alertId)
            filter.alertId = filters.alertId;
        if (filters.strategyId)
            filter.strategyId = filters.strategyId;
        if (filters.clientOrderId)
            filter.clientOrderId = filters.clientOrderId;
        if (filters.exchangeOrderId)
            filter.exchangeOrderId = filters.exchangeOrderId;
        if (filters.isPaperTrade !== undefined)
            filter.isPaperTrade = filters.isPaperTrade;
        if (filters.isBacktest !== undefined)
            filter.isBacktest = filters.isBacktest;
        if (filters.tag)
            filter.tags = { $in: [filters.tag] };
        if (filters.startDate || filters.endDate) {
            filter.createdAt = {};
            if (filters.startDate)
                filter.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate)
                filter.createdAt.$lte = new Date(filters.endDate);
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const [orders, total] = await Promise.all([
            this.orderModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            this.orderModel.countDocuments(filter),
        ]);
        return {
            orders,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getOrderById(userId, orderId) {
        const order = await this.orderModel
            .findOne({
            _id: orderId,
            userId: new mongoose_2.Types.ObjectId(userId),
        })
            .lean();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateOrder(userId, orderId, updateOrderDto) {
        const order = await this.orderModel.findOneAndUpdate({ _id: orderId, userId: new mongoose_2.Types.ObjectId(userId) }, { ...updateOrderDto }, { new: true });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        this.logger.log(`Order updated: ${order.uuid} for user ${userId}`);
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_UPDATED, {
            orderId: order._id,
            userId,
            order: order.toObject(),
        });
        return order;
    }
    async cancelOrder(userId, orderId, reason) {
        const order = await this.orderModel.findOne({
            _id: orderId,
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const activeStatuses = [
            orders_entity_1.OrderStatus.PENDING,
            orders_entity_1.OrderStatus.SUBMITTED,
            orders_entity_1.OrderStatus.NEW,
            orders_entity_1.OrderStatus.PARTIALLY_FILLED,
        ];
        if (!activeStatuses.includes(order.status)) {
            throw new common_1.BadRequestException('Order cannot be canceled in current status');
        }
        order.status = orders_entity_1.OrderStatus.CANCELED;
        order.canceledAt = new Date();
        if (reason) {
            order.auditTrail.push(`${new Date().toISOString()}: Canceled: ${reason}`);
        }
        const savedOrder = await order.save();
        this.logger.log(`Order canceled: ${savedOrder.uuid} for user ${userId}`);
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_CANCELED, {
            orderId: savedOrder._id,
            userId,
            order: savedOrder.toObject(),
        });
        return savedOrder;
    }
    async deleteOrder(userId, orderId) {
        const result = await this.orderModel.deleteOne({
            _id: orderId,
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Order not found');
        }
        this.logger.log(`Order deleted: ${orderId} for user ${userId}`);
        return true;
    }
    async getOrderStats(userId) {
        const [total, byStatus, byExchange, bySide, byType, volumeStats] = await Promise.all([
            this.orderModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId) }),
            this.orderModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $project: { status: '$_id', count: 1, _id: 0 } },
            ]),
            this.orderModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId) } },
                { $group: { _id: '$exchange', count: { $sum: 1 } } },
                { $project: { exchange: '$_id', count: 1, _id: 0 } },
            ]),
            this.orderModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId) } },
                { $group: { _id: '$side', count: { $sum: 1 } } },
                { $project: { side: '$_id', count: 1, _id: 0 } },
            ]),
            this.orderModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId) } },
                { $group: { _id: '$type', count: { $sum: 1 } } },
                { $project: { type: '$_id', count: 1, _id: 0 } },
            ]),
            this.orderModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalVolume: { $sum: '$filledQuantity' },
                        totalFees: { $sum: '$totalFees' },
                        totalPnL: { $sum: '$pnl' },
                        filledOrders: {
                            $sum: {
                                $cond: [{ $eq: ['$status', orders_entity_1.OrderStatus.FILLED] }, 1, 0],
                            },
                        },
                    },
                },
            ]),
        ]);
        const volumeData = volumeStats[0] || {
            totalVolume: 0,
            totalFees: 0,
            totalPnL: 0,
            filledOrders: 0,
        };
        return {
            total,
            byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item.count }), {}),
            byExchange: byExchange.reduce((acc, item) => ({ ...acc, [item.exchange]: item.count }), {}),
            bySide: bySide.reduce((acc, item) => ({ ...acc, [item.side]: item.count }), {}),
            byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item.count }), {}),
            totalVolume: volumeData.totalVolume,
            totalFees: volumeData.totalFees,
            totalPnL: volumeData.totalPnL,
            averagePnL: volumeData.filledOrders > 0
                ? volumeData.totalPnL / volumeData.filledOrders
                : 0,
        };
    }
    async getActiveOrders(userId) {
        return this.orderModel
            .find({
            userId: new mongoose_2.Types.ObjectId(userId),
            status: {
                $in: [
                    orders_entity_1.OrderStatus.PENDING,
                    orders_entity_1.OrderStatus.SUBMITTED,
                    orders_entity_1.OrderStatus.NEW,
                    orders_entity_1.OrderStatus.PARTIALLY_FILLED,
                ],
            },
        })
            .lean();
    }
    async getOrdersBySymbol(userId, symbol) {
        return this.orderModel
            .find({
            userId: new mongoose_2.Types.ObjectId(userId),
            symbol,
        })
            .sort({ createdAt: -1 })
            .lean();
    }
    async getOrdersBySignal(signalId) {
        return this.orderModel.find({ signalId }).lean();
    }
    async bulkCreateOrders(userId, bulkCreateDto) {
        const { orders, batchId, notes } = bulkCreateDto;
        const created = [];
        const failed = [];
        for (const orderData of orders) {
            try {
                const order = new this.orderModel({
                    ...orderData,
                    userId: new mongoose_2.Types.ObjectId(userId),
                    status: orders_entity_1.OrderStatus.PENDING,
                    metadata: {
                        ...orderData.metadata,
                        batchId,
                        batchNotes: notes,
                    },
                });
                const savedOrder = await order.save();
                created.push(savedOrder);
                this.logger.log(`Bulk order created: ${savedOrder.uuid} for user ${userId}`);
            }
            catch (error) {
                failed.push({
                    order: orderData,
                    error: error.message,
                });
                this.logger.error(`Failed to create bulk order for user ${userId}:`, error);
            }
        }
        this.eventEmitter.emit(eventsType_1.EventsType.BULK_ORDERS_CREATED, {
            userId,
            createdCount: created.length,
            failedCount: failed.length,
            batchId,
        });
        return { created, failed };
    }
    async bulkUpdateOrders(userId, bulkUpdateDto) {
        const { orderIds, ...updateData } = bulkUpdateDto;
        let updated = 0;
        const failed = [];
        for (const orderId of orderIds) {
            try {
                const result = await this.orderModel.updateOne({ _id: orderId, userId: new mongoose_2.Types.ObjectId(userId) }, { ...updateData });
                if (result.modifiedCount > 0) {
                    updated++;
                }
                else {
                    failed.push(orderId);
                }
            }
            catch (error) {
                failed.push(orderId);
                this.logger.error(`Failed to update order ${orderId}:`, error);
            }
        }
        this.logger.log(`Bulk updated ${updated} orders for user ${userId}`);
        return { updated, failed };
    }
    async bulkCancelOrders(userId, bulkCancelDto) {
        const { orderIds, reason, force } = bulkCancelDto;
        let canceled = 0;
        const failed = [];
        for (const orderId of orderIds) {
            try {
                const order = await this.orderModel.findOne({
                    _id: orderId,
                    userId: new mongoose_2.Types.ObjectId(userId),
                });
                if (!order) {
                    failed.push(orderId);
                    continue;
                }
                const activeStatuses = [
                    orders_entity_1.OrderStatus.PENDING,
                    orders_entity_1.OrderStatus.SUBMITTED,
                    orders_entity_1.OrderStatus.NEW,
                    orders_entity_1.OrderStatus.PARTIALLY_FILLED,
                ];
                if (!force && !activeStatuses.includes(order.status)) {
                    failed.push(orderId);
                    continue;
                }
                order.status = orders_entity_1.OrderStatus.CANCELED;
                order.canceledAt = new Date();
                if (reason) {
                    order.auditTrail.push(`${new Date().toISOString()}: Bulk canceled: ${reason}`);
                }
                await order.save();
                canceled++;
            }
            catch (error) {
                failed.push(orderId);
                this.logger.error(`Failed to cancel order ${orderId}:`, error);
            }
        }
        this.logger.log(`Bulk canceled ${canceled} orders for user ${userId}`);
        return { canceled, failed };
    }
    async updateOrderExecution(userId, executionDto) {
        const { orderId, exchangeOrderId, filledQuantity, averagePrice, fees } = executionDto;
        const order = await this.orderModel.findOne({
            _id: orderId,
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (exchangeOrderId)
            order.exchangeOrderId = exchangeOrderId;
        if (filledQuantity !== undefined)
            order.filledQuantity = filledQuantity;
        if (averagePrice !== undefined)
            order.averagePrice = averagePrice;
        if (fees !== undefined)
            order.totalFees += fees;
        if (order.filledQuantity >= order.quantity) {
            order.status = orders_entity_1.OrderStatus.FILLED;
            order.filledAt = new Date();
        }
        else if (order.filledQuantity > 0) {
            order.status = orders_entity_1.OrderStatus.PARTIALLY_FILLED;
        }
        const savedOrder = await order.save();
        this.logger.log(`Order execution updated: ${savedOrder.uuid} for user ${userId}`);
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_EXECUTED, {
            orderId: savedOrder._id,
            userId,
            order: savedOrder.toObject(),
        });
        return savedOrder;
    }
    async calculateOrderPnL(userId, orderId, currentPrice) {
        const order = await this.getOrderById(userId, orderId);
        if (order.status !== orders_entity_1.OrderStatus.FILLED) {
            return { pnl: 0, pnlPercentage: 0 };
        }
        const filledValue = order.filledQuantity * order.averagePrice;
        const currentValue = order.filledQuantity * currentPrice;
        const pnl = order.side === orders_entity_1.OrderSide.BUY
            ? currentValue - filledValue - order.totalFees
            : filledValue - currentValue - order.totalFees;
        const pnlPercentage = filledValue > 0 ? (pnl / filledValue) * 100 : 0;
        await this.orderModel.updateOne({ _id: orderId }, {
            pnl,
            pnlPercentage,
            pnlCalculatedAt: new Date(),
        });
        return { pnl, pnlPercentage };
    }
    async getOrdersForRetry() {
        return this.orderModel
            .find({
            status: { $in: [orders_entity_1.OrderStatus.FAILED, orders_entity_1.OrderStatus.REJECTED] },
            retryCount: { $lt: 3 },
            $or: [
                { nextRetryAt: { $lte: new Date() } },
                { nextRetryAt: { $exists: false } },
            ],
        })
            .lean();
    }
    async updateRetryInfo(orderId, error) {
        await this.orderModel.updateOne({ _id: orderId }, {
            $inc: { retryCount: 1 },
            lastError: error,
            nextRetryAt: new Date(Date.now() + Math.pow(2, 3) * 1000),
        });
    }
    async cleanupExpiredOrders() {
        const result = await this.orderModel.deleteMany({
            validUntil: { $lt: new Date() },
            status: { $in: [orders_entity_1.OrderStatus.PENDING, orders_entity_1.OrderStatus.SUBMITTED] },
        });
        this.logger.log(`Cleaned up ${result.deletedCount} expired orders`);
        return { deletedCount: result.deletedCount };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(orders_entity_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        event_emitter_1.EventEmitter2])
], OrdersService);
//# sourceMappingURL=orders.service.js.map