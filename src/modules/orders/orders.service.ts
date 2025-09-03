import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Order,
  OrderDocument,
  OrderStatus,
  OrderSide,
  Exchange,
} from './orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import {
  BulkCreateOrderDto,
  BulkUpdateOrderDto,
  BulkCancelOrderDto,
  OrderExecutionDto,
} from './dto/bulk-order.dto';
import { EventsType } from '@/utils/constants/eventsType';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new order
   */
  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    try {
      const order = new this.orderModel({
        ...createOrderDto,
        userId: new Types.ObjectId(userId),
        status: OrderStatus.PENDING,
      });

      const savedOrder = await order.save();

      this.logger.log(`Order created: ${savedOrder.uuid} for user ${userId}`);

      // Emit order created event
      this.eventEmitter.emit(EventsType.ORDER_CREATED, {
        orderId: savedOrder._id,
        userId,
        order: savedOrder.toObject(),
      });

      return savedOrder;
    } catch (error) {
      this.logger.error(`Error creating order for user ${userId}:`, error);
      throw new BadRequestException('Failed to create order');
    }
  }

  /**
   * Get orders with pagination and filtering
   */
  async getOrders(
    userId: string,
    queryDto: QueryOrderDto,
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { userId: new Types.ObjectId(userId) };

    if (filters.exchange) filter.exchange = filters.exchange;
    if (filters.symbol)
      filter.symbol = { $regex: filters.symbol, $options: 'i' };
    if (filters.side) filter.side = filters.side;
    if (filters.type) filter.type = filters.type;
    if (filters.status) filter.status = filters.status;
    if (filters.source) filter.source = filters.source;
    if (filters.priority) filter.priority = filters.priority;
    if (filters.signalId) filter.signalId = filters.signalId;
    if (filters.alertId) filter.alertId = filters.alertId;
    if (filters.strategyId) filter.strategyId = filters.strategyId;
    if (filters.clientOrderId) filter.clientOrderId = filters.clientOrderId;
    if (filters.exchangeOrderId)
      filter.exchangeOrderId = filters.exchangeOrderId;
    if (filters.isPaperTrade !== undefined)
      filter.isPaperTrade = filters.isPaperTrade;
    if (filters.isBacktest !== undefined)
      filter.isBacktest = filters.isBacktest;
    if (filters.tag) filter.tags = { $in: [filters.tag] };

    // Date range filter
    if (filters.startDate || filters.endDate) {
      filter.createdAt = {};
      if (filters.startDate)
        filter.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) filter.createdAt.$lte = new Date(filters.endDate);
    }

    // Build sort object
    const sort: any = {};
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

  /**
   * Get order by ID
   */
  async getOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({
        _id: orderId,
        userId: new Types.ObjectId(userId),
      })
      .lean();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Update order
   */
  async updateOrder(
    userId: string,
    orderId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.orderModel.findOneAndUpdate(
      { _id: orderId, userId: new Types.ObjectId(userId) },
      { ...updateOrderDto },
      { new: true },
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.logger.log(`Order updated: ${order.uuid} for user ${userId}`);

    // Emit order updated event
    this.eventEmitter.emit(EventsType.ORDER_UPDATED, {
      orderId: order._id,
      userId,
      order: order.toObject(),
    });

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(
    userId: string,
    orderId: string,
    reason?: string,
  ): Promise<Order> {
    const order = await this.orderModel.findOne({
      _id: orderId,
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const activeStatuses = [
      OrderStatus.PENDING,
      OrderStatus.SUBMITTED,
      OrderStatus.NEW,
      OrderStatus.PARTIALLY_FILLED,
    ];

    if (!activeStatuses.includes(order.status)) {
      throw new BadRequestException(
        'Order cannot be canceled in current status',
      );
    }

    order.status = OrderStatus.CANCELED;
    order.canceledAt = new Date();
    if (reason) {
      order.auditTrail.push(`${new Date().toISOString()}: Canceled: ${reason}`);
    }

    const savedOrder = await order.save();

    this.logger.log(`Order canceled: ${savedOrder.uuid} for user ${userId}`);

    // Emit order canceled event
    this.eventEmitter.emit(EventsType.ORDER_CANCELED, {
      orderId: savedOrder._id,
      userId,
      order: savedOrder.toObject(),
    });

    return savedOrder;
  }

  /**
   * Delete order
   */
  async deleteOrder(userId: string, orderId: string): Promise<boolean> {
    const result = await this.orderModel.deleteOne({
      _id: orderId,
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Order not found');
    }

    this.logger.log(`Order deleted: ${orderId} for user ${userId}`);
    return true;
  }

  /**
   * Get order statistics
   */
  async getOrderStats(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byExchange: Record<string, number>;
    bySide: Record<string, number>;
    byType: Record<string, number>;
    totalVolume: number;
    totalFees: number;
    totalPnL: number;
    averagePnL: number;
  }> {
    const [total, byStatus, byExchange, bySide, byType, volumeStats] =
      await Promise.all([
        this.orderModel.countDocuments({ userId: new Types.ObjectId(userId) }),

        this.orderModel.aggregate([
          { $match: { userId: new Types.ObjectId(userId) } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $project: { status: '$_id', count: 1, _id: 0 } },
        ]),

        this.orderModel.aggregate([
          { $match: { userId: new Types.ObjectId(userId) } },
          { $group: { _id: '$exchange', count: { $sum: 1 } } },
          { $project: { exchange: '$_id', count: 1, _id: 0 } },
        ]),

        this.orderModel.aggregate([
          { $match: { userId: new Types.ObjectId(userId) } },
          { $group: { _id: '$side', count: { $sum: 1 } } },
          { $project: { side: '$_id', count: 1, _id: 0 } },
        ]),

        this.orderModel.aggregate([
          { $match: { userId: new Types.ObjectId(userId) } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $project: { type: '$_id', count: 1, _id: 0 } },
        ]),

        this.orderModel.aggregate([
          { $match: { userId: new Types.ObjectId(userId) } },
          {
            $group: {
              _id: null,
              totalVolume: { $sum: '$filledQuantity' },
              totalFees: { $sum: '$totalFees' },
              totalPnL: { $sum: '$pnl' },
              filledOrders: {
                $sum: {
                  $cond: [{ $eq: ['$status', OrderStatus.FILLED] }, 1, 0],
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
      byStatus: byStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item.count }),
        {},
      ),
      byExchange: byExchange.reduce(
        (acc, item) => ({ ...acc, [item.exchange]: item.count }),
        {},
      ),
      bySide: bySide.reduce(
        (acc, item) => ({ ...acc, [item.side]: item.count }),
        {},
      ),
      byType: byType.reduce(
        (acc, item) => ({ ...acc, [item.type]: item.count }),
        {},
      ),
      totalVolume: volumeData.totalVolume,
      totalFees: volumeData.totalFees,
      totalPnL: volumeData.totalPnL,
      averagePnL:
        volumeData.filledOrders > 0
          ? volumeData.totalPnL / volumeData.filledOrders
          : 0,
    };
  }

  /**
   * Get active orders
   */
  async getActiveOrders(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({
        userId: new Types.ObjectId(userId),
        status: {
          $in: [
            OrderStatus.PENDING,
            OrderStatus.SUBMITTED,
            OrderStatus.NEW,
            OrderStatus.PARTIALLY_FILLED,
          ],
        },
      })
      .lean();
  }

  /**
   * Get orders by symbol
   */
  async getOrdersBySymbol(userId: string, symbol: string): Promise<Order[]> {
    return this.orderModel
      .find({
        userId: new Types.ObjectId(userId),
        symbol,
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get orders by signal
   */
  async getOrdersBySignal(signalId: string): Promise<Order[]> {
    return this.orderModel.find({ signalId }).lean();
  }

  /**
   * Bulk create orders
   */
  async bulkCreateOrders(
    userId: string,
    bulkCreateDto: BulkCreateOrderDto,
  ): Promise<{
    created: Order[];
    failed: Array<{ order: CreateOrderDto; error: string }>;
  }> {
    const { orders, batchId, notes } = bulkCreateDto;
    const created: Order[] = [];
    const failed: Array<{ order: CreateOrderDto; error: string }> = [];

    for (const orderData of orders) {
      try {
        const order = new this.orderModel({
          ...orderData,
          userId: new Types.ObjectId(userId),
          status: OrderStatus.PENDING,
          metadata: {
            ...orderData.metadata,
            batchId,
            batchNotes: notes,
          },
        });

        const savedOrder = await order.save();
        created.push(savedOrder);

        this.logger.log(
          `Bulk order created: ${savedOrder.uuid} for user ${userId}`,
        );
      } catch (error) {
        failed.push({
          order: orderData,
          error: error.message,
        });
        this.logger.error(
          `Failed to create bulk order for user ${userId}:`,
          error,
        );
      }
    }

    // Emit bulk order created event
    this.eventEmitter.emit(EventsType.BULK_ORDERS_CREATED, {
      userId,
      createdCount: created.length,
      failedCount: failed.length,
      batchId,
    });

    return { created, failed };
  }

  /**
   * Bulk update orders
   */
  async bulkUpdateOrders(
    userId: string,
    bulkUpdateDto: BulkUpdateOrderDto,
  ): Promise<{
    updated: number;
    failed: string[];
  }> {
    const { orderIds, ...updateData } = bulkUpdateDto;
    let updated = 0;
    const failed: string[] = [];

    for (const orderId of orderIds) {
      try {
        const result = await this.orderModel.updateOne(
          { _id: orderId, userId: new Types.ObjectId(userId) },
          { ...updateData },
        );

        if (result.modifiedCount > 0) {
          updated++;
        } else {
          failed.push(orderId);
        }
      } catch (error) {
        failed.push(orderId);
        this.logger.error(`Failed to update order ${orderId}:`, error);
      }
    }

    this.logger.log(`Bulk updated ${updated} orders for user ${userId}`);
    return { updated, failed };
  }

  /**
   * Bulk cancel orders
   */
  async bulkCancelOrders(
    userId: string,
    bulkCancelDto: BulkCancelOrderDto,
  ): Promise<{
    canceled: number;
    failed: string[];
  }> {
    const { orderIds, reason, force } = bulkCancelDto;
    let canceled = 0;
    const failed: string[] = [];

    for (const orderId of orderIds) {
      try {
        const order = await this.orderModel.findOne({
          _id: orderId,
          userId: new Types.ObjectId(userId),
        });

        if (!order) {
          failed.push(orderId);
          continue;
        }

        const activeStatuses = [
          OrderStatus.PENDING,
          OrderStatus.SUBMITTED,
          OrderStatus.NEW,
          OrderStatus.PARTIALLY_FILLED,
        ];

        if (!force && !activeStatuses.includes(order.status)) {
          failed.push(orderId);
          continue;
        }

        order.status = OrderStatus.CANCELED;
        order.canceledAt = new Date();
        if (reason) {
          order.auditTrail.push(
            `${new Date().toISOString()}: Bulk canceled: ${reason}`,
          );
        }

        await order.save();
        canceled++;
      } catch (error) {
        failed.push(orderId);
        this.logger.error(`Failed to cancel order ${orderId}:`, error);
      }
    }

    this.logger.log(`Bulk canceled ${canceled} orders for user ${userId}`);
    return { canceled, failed };
  }

  /**
   * Update order execution (for exchange callbacks)
   */
  async updateOrderExecution(
    userId: string,
    executionDto: OrderExecutionDto,
  ): Promise<Order> {
    const { orderId, exchangeOrderId, filledQuantity, averagePrice, fees } =
      executionDto;

    const order = await this.orderModel.findOne({
      _id: orderId,
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update execution details
    if (exchangeOrderId) order.exchangeOrderId = exchangeOrderId;
    if (filledQuantity !== undefined) order.filledQuantity = filledQuantity;
    if (averagePrice !== undefined) order.averagePrice = averagePrice;
    if (fees !== undefined) order.totalFees += fees;

    // Update status based on fill
    if (order.filledQuantity >= order.quantity) {
      order.status = OrderStatus.FILLED;
      order.filledAt = new Date();
    } else if (order.filledQuantity > 0) {
      order.status = OrderStatus.PARTIALLY_FILLED;
    }

    const savedOrder = await order.save();

    this.logger.log(
      `Order execution updated: ${savedOrder.uuid} for user ${userId}`,
    );

    // Emit order execution event
    this.eventEmitter.emit(EventsType.ORDER_EXECUTED, {
      orderId: savedOrder._id,
      userId,
      order: savedOrder.toObject(),
    });

    return savedOrder;
  }

  /**
   * Calculate PnL for an order
   */
  async calculateOrderPnL(
    userId: string,
    orderId: string,
    currentPrice: number,
  ): Promise<{
    pnl: number;
    pnlPercentage: number;
  }> {
    const order = await this.getOrderById(userId, orderId);

    if (order.status !== OrderStatus.FILLED) {
      return { pnl: 0, pnlPercentage: 0 };
    }

    const filledValue = order.filledQuantity * order.averagePrice;
    const currentValue = order.filledQuantity * currentPrice;
    const pnl =
      order.side === OrderSide.BUY
        ? currentValue - filledValue - order.totalFees
        : filledValue - currentValue - order.totalFees;

    const pnlPercentage = filledValue > 0 ? (pnl / filledValue) * 100 : 0;

    // Update order with calculated PnL
    await this.orderModel.updateOne(
      { _id: orderId },
      {
        pnl,
        pnlPercentage,
        pnlCalculatedAt: new Date(),
      },
    );

    return { pnl, pnlPercentage };
  }

  /**
   * Get orders that need retry
   */
  async getOrdersForRetry(): Promise<Order[]> {
    return this.orderModel
      .find({
        status: { $in: [OrderStatus.FAILED, OrderStatus.REJECTED] },
        retryCount: { $lt: 3 }, // Max 3 retries
        $or: [
          { nextRetryAt: { $lte: new Date() } },
          { nextRetryAt: { $exists: false } },
        ],
      })
      .lean();
  }

  /**
   * Update retry information
   */
  async updateRetryInfo(orderId: string, error: string): Promise<void> {
    await this.orderModel.updateOne(
      { _id: orderId },
      {
        $inc: { retryCount: 1 },
        lastError: error,
        nextRetryAt: new Date(Date.now() + Math.pow(2, 3) * 1000), // Exponential backoff
      },
    );
  }

  /**
   * Clean up expired orders
   */
  async cleanupExpiredOrders(): Promise<{ deletedCount: number }> {
    const result = await this.orderModel.deleteMany({
      validUntil: { $lt: new Date() },
      status: { $in: [OrderStatus.PENDING, OrderStatus.SUBMITTED] },
    });

    this.logger.log(`Cleaned up ${result.deletedCount} expired orders`);
    return { deletedCount: result.deletedCount };
  }
}
