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
var OrderLifecycleService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderLifecycleService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_emitter_2 = require("@nestjs/event-emitter");
const orders_service_1 = require("./orders.service");
const position_management_service_1 = require("./position-management.service");
const eventsType_1 = require("../../../utils/constants/eventsType");
const orders_entity_1 = require("../orders.entity");
const trade_engine_service_1 = require("../../trade-engine/services/trade-engine.service");
let OrderLifecycleService = OrderLifecycleService_1 = class OrderLifecycleService {
    constructor(ordersService, positionManagementService, tradeEngineService, eventEmitter) {
        this.ordersService = ordersService;
        this.positionManagementService = positionManagementService;
        this.tradeEngineService = tradeEngineService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(OrderLifecycleService_1.name);
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.executionQueue = new Map();
        this.retryCounters = new Map();
    }
    async handleOrderCreated(event) {
        try {
            this.logger.log(`Order created: ${event.orderId} for ${event.symbol}`);
            if (event.price && event.status === orders_entity_1.OrderStatus.PENDING) {
                await this.setupPriceMonitoring(event);
            }
            if (event.status === orders_entity_1.OrderStatus.PENDING && !event.price) {
                await this.executeMarketOrder(event);
            }
        }
        catch (error) {
            this.logger.error(`Error handling order creation: ${error.message}`, error.stack);
            await this.handleOrderError(event.orderId, error);
        }
    }
    async handleOrderTriggered(event) {
        try {
            this.logger.log(`Order triggered: ${event.orderId} for ${event.symbol}`);
            if (this.executionQueue.has(event.orderId)) {
                this.logger.warn(`Order ${event.orderId} is already being processed`);
                return;
            }
            const executionPromise = this.processOrderExecution(event);
            this.executionQueue.set(event.orderId, executionPromise);
            try {
                const result = await executionPromise;
                this.logger.log(`Order execution completed: ${event.orderId} - ${result.status}`);
            }
            finally {
                this.executionQueue.delete(event.orderId);
            }
        }
        catch (error) {
            this.logger.error(`Error handling order trigger: ${error.message}`, error.stack);
            await this.handleOrderError(event.orderId, error);
        }
    }
    async processOrderExecution(event) {
        const { orderId, userId, symbol, side, quantity, triggerPrice } = event;
        try {
            await this.updateOrderStatus(orderId, orders_entity_1.OrderStatus.EXECUTING);
            const positionResult = await this.positionManagementService.executeOrderManually(orderId, userId, symbol, side, quantity, triggerPrice, event.exchangeId || 'manual');
            await this.updateOrderStatus(orderId, orders_entity_1.OrderStatus.FILLED, triggerPrice);
            this.eventEmitter.emit(eventsType_1.EventsType.ORDER_EXECUTED, {
                orderId,
                userId,
                symbol,
                side,
                quantity,
                executedPrice: triggerPrice,
                executedAt: new Date(),
                positionResult,
            });
            return {
                success: true,
                orderId,
                status: orders_entity_1.OrderStatus.FILLED,
                executedPrice: triggerPrice,
                executedAt: new Date(),
                positionResult,
            };
        }
        catch (error) {
            this.logger.error(`Order execution failed: ${orderId} - ${error.message}`);
            await this.updateOrderStatus(orderId, orders_entity_1.OrderStatus.FAILED);
            this.eventEmitter.emit(eventsType_1.EventsType.ORDER_FAILED, {
                orderId,
                userId,
                symbol,
                error: error.message,
                timestamp: new Date(),
            });
            return {
                success: false,
                orderId,
                status: orders_entity_1.OrderStatus.FAILED,
                error: error.message,
            };
        }
    }
    async setupPriceMonitoring(event) {
        try {
            const { orderId, symbol, side, price, quantity, userId } = event;
            const condition = side === orders_entity_1.OrderSide.BUY ? 'BELOW' : 'ABOVE';
            const limitId = this.tradeEngineService.addPriceLimit({
                symbol,
                limitPrice: price,
                condition,
                orderId,
                amount: quantity,
                userId,
                metadata: {
                    orderType: 'LIMIT',
                    originalEvent: event,
                },
            });
            this.logger.log(`Price monitoring setup for order ${orderId} with limit ${limitId}`);
        }
        catch (error) {
            this.logger.error(`Error setting up price monitoring: ${error.message}`, error.stack);
            throw error;
        }
    }
    async executeMarketOrder(event) {
        try {
            const currentPrice = await this.tradeEngineService.getCurrentPrice(event.symbol);
            if (!currentPrice) {
                throw new Error(`No current price available for ${event.symbol}`);
            }
            const executionEvent = {
                orderId: event.orderId,
                userId: event.userId,
                symbol: event.symbol,
                side: event.side,
                quantity: event.quantity,
                triggerPrice: currentPrice,
                exchangeId: 'manual',
            };
            await this.processOrderExecution(executionEvent);
        }
        catch (error) {
            this.logger.error(`Error executing market order: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateOrderStatus(orderId, status, executedPrice) {
        try {
            const updateData = { status };
            if (executedPrice) {
                updateData.executedPrice = executedPrice;
                updateData.executedAt = new Date();
            }
            await this.ordersService.updateOrder(orderId, updateData);
            this.logger.log(`Order ${orderId} status updated to ${status}`);
            this.eventEmitter.emit(eventsType_1.EventsType.ORDER_STATUS_UPDATED, {
                orderId,
                status,
                executedPrice,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Error updating order status: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleOrderError(orderId, error) {
        const retryCount = this.retryCounters.get(orderId) || 0;
        if (retryCount < this.maxRetries) {
            this.logger.log(`Retrying order ${orderId} (attempt ${retryCount + 1}/${this.maxRetries})`);
            this.retryCounters.set(orderId, retryCount + 1);
            await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
            this.eventEmitter.emit(eventsType_1.EventsType.ORDER_RETRY, {
                orderId,
                retryCount: retryCount + 1,
                maxRetries: this.maxRetries,
                error: error.message,
                timestamp: new Date(),
            });
        }
        else {
            this.logger.error(`Order ${orderId} failed after ${this.maxRetries} retries`);
            this.retryCounters.delete(orderId);
            this.eventEmitter.emit(eventsType_1.EventsType.ORDER_FINAL_FAILURE, {
                orderId,
                error: error.message,
                retryCount,
                timestamp: new Date(),
            });
        }
    }
    async cancelOrder(orderId, userId) {
        try {
            const order = await this.ordersService.getOrderById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }
            if (order.userId.toString() !== userId) {
                throw new Error('Unauthorized to cancel this order');
            }
            if (order.status === orders_entity_1.OrderStatus.FILLED ||
                order.status === orders_entity_1.OrderStatus.CANCELLED) {
                throw new Error(`Cannot cancel order with status: ${order.status}`);
            }
            if (order.status === orders_entity_1.OrderStatus.PENDING && order.price) {
                const limits = this.tradeEngineService.getPriceLimitsForSymbol(order.symbol);
                const relevantLimit = limits.find((limit) => limit.orderId === orderId);
                if (relevantLimit) {
                    this.tradeEngineService.removePriceLimit(relevantLimit.id);
                }
            }
            await this.updateOrderStatus(orderId, orders_entity_1.OrderStatus.CANCELLED);
            this.eventEmitter.emit(eventsType_1.EventsType.ORDER_CANCELLED, {
                orderId,
                userId,
                symbol: order.symbol,
                side: order.side,
                quantity: order.quantity,
                cancelledAt: new Date(),
            });
            this.logger.log(`Order ${orderId} cancelled successfully`);
        }
        catch (error) {
            this.logger.error(`Error cancelling order: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getOrderExecutionStatus(orderId) {
        const isExecuting = this.executionQueue.has(orderId);
        const retryCount = this.retryCounters.get(orderId) || 0;
        return {
            orderId,
            isExecuting,
            retryCount,
            maxRetries: this.maxRetries,
        };
    }
    async cleanupCompletedOrders() {
        try {
            const completedOrders = Array.from(this.retryCounters.keys()).filter((orderId) => !this.executionQueue.has(orderId));
            completedOrders.forEach((orderId) => {
                this.retryCounters.delete(orderId);
            });
            this.logger.log(`Cleaned up ${completedOrders.length} completed orders`);
        }
        catch (error) {
            this.logger.error(`Error cleaning up orders: ${error.message}`, error.stack);
        }
    }
    getSystemHealth() {
        return {
            activeExecutions: this.executionQueue.size,
            pendingRetries: this.retryCounters.size,
            maxRetries: this.maxRetries,
            retryDelay: this.retryDelay,
        };
    }
};
exports.OrderLifecycleService = OrderLifecycleService;
__decorate([
    (0, event_emitter_2.OnEvent)(eventsType_1.EventsType.ORDER_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderLifecycleService.prototype, "handleOrderCreated", null);
__decorate([
    (0, event_emitter_2.OnEvent)(eventsType_1.EventsType.ORDER_TRIGGERED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderLifecycleService.prototype, "handleOrderTriggered", null);
exports.OrderLifecycleService = OrderLifecycleService = OrderLifecycleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof orders_service_1.OrdersService !== "undefined" && orders_service_1.OrdersService) === "function" ? _a : Object, position_management_service_1.PositionManagementService,
        trade_engine_service_1.TradeEngineService,
        event_emitter_1.EventEmitter2])
], OrderLifecycleService);
//# sourceMappingURL=order-lifecycle.service.js.map