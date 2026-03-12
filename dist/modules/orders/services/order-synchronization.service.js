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
var OrderSynchronizationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSynchronizationService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_emitter_2 = require("@nestjs/event-emitter");
const orders_service_1 = require("./orders.service");
const position_management_service_1 = require("./position-management.service");
const order_lifecycle_service_1 = require("./order-lifecycle.service");
const trade_engine_service_1 = require("../../trade-engine/services/trade-engine.service");
const eventsType_1 = require("../../../utils/constants/eventsType");
const orders_entity_1 = require("../orders.entity");
let OrderSynchronizationService = OrderSynchronizationService_1 = class OrderSynchronizationService {
    constructor(ordersService, positionManagementService, orderLifecycleService, tradeEngineService, eventEmitter) {
        this.ordersService = ordersService;
        this.positionManagementService = positionManagementService;
        this.orderLifecycleService = orderLifecycleService;
        this.tradeEngineService = tradeEngineService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(OrderSynchronizationService_1.name);
        this.syncStates = new Map();
        this.syncQueue = [];
        this.isProcessingQueue = false;
    }
    async initializeOrderSync(orderId, userId, symbol, side) {
        const syncState = {
            orderId,
            orderStatus: orders_entity_1.OrderStatus.PENDING,
            positionStatus: 'NONE',
            tradeEngineStatus: 'MONITORING',
            lastSync: new Date(),
            errors: [],
        };
        this.syncStates.set(orderId, syncState);
        this.logger.log(`Initialized sync for order ${orderId}`);
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_SYNC_INITIALIZED, {
            orderId,
            userId,
            symbol,
            side,
            timestamp: new Date(),
        });
    }
    async handleOrderStatusUpdate(event) {
        try {
            const { orderId, status } = event;
            this.logger.log(`Order status updated: ${orderId} -> ${status}`);
            const syncState = this.syncStates.get(orderId);
            if (syncState) {
                syncState.orderStatus = status;
                syncState.lastSync = new Date();
                await this.checkSynchronizationNeeded(orderId);
            }
        }
        catch (error) {
            this.logger.error(`Error handling order status update: ${error.message}`, error.stack);
        }
    }
    async handlePositionUpdate(event) {
        try {
            const { positionResult, executionEvent } = event;
            const orderId = executionEvent.orderId;
            this.logger.log(`Position updated for order ${orderId}: ${positionResult.action}`);
            const syncState = this.syncStates.get(orderId);
            if (syncState) {
                syncState.positionStatus = 'UPDATED';
                syncState.lastSync = new Date();
                await this.checkSynchronizationNeeded(orderId);
            }
        }
        catch (error) {
            this.logger.error(`Error handling position update: ${error.message}`, error.stack);
        }
    }
    async handlePriceLimitTriggered(event) {
        try {
            const { limitId, limit } = event;
            const orderId = limit.orderId;
            if (orderId) {
                this.logger.log(`Price limit triggered for order ${orderId}`);
                const syncState = this.syncStates.get(orderId);
                if (syncState) {
                    syncState.tradeEngineStatus = 'TRIGGERED';
                    syncState.lastSync = new Date();
                    await this.checkSynchronizationNeeded(orderId);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error handling price limit trigger: ${error.message}`, error.stack);
        }
    }
    async checkSynchronizationNeeded(orderId) {
        const syncState = this.syncStates.get(orderId);
        if (!syncState)
            return;
        const needsSync = this.detectSyncIssues(syncState);
        if (needsSync.length > 0) {
            this.logger.warn(`Sync issues detected for order ${orderId}: ${needsSync.join(', ')}`);
            if (!this.syncQueue.includes(orderId)) {
                this.syncQueue.push(orderId);
                syncState.errors.push(...needsSync);
            }
            if (!this.isProcessingQueue) {
                this.processSyncQueue();
            }
        }
    }
    detectSyncIssues(syncState) {
        const issues = [];
        const { orderId, orderStatus, positionStatus, tradeEngineStatus } = syncState;
        if (orderStatus === orders_entity_1.OrderStatus.FILLED && positionStatus === 'NONE') {
            issues.push('Order filled but no position created');
        }
        if (orderStatus === orders_entity_1.OrderStatus.CANCELLED && positionStatus !== 'NONE') {
            issues.push('Order cancelled but position still exists');
        }
        if (orderStatus === orders_entity_1.OrderStatus.FAILED && positionStatus !== 'NONE') {
            issues.push('Order failed but position was created');
        }
        if (orderStatus === orders_entity_1.OrderStatus.FILLED &&
            tradeEngineStatus === 'MONITORING') {
            issues.push('Order filled but trade engine still monitoring');
        }
        if (orderStatus === orders_entity_1.OrderStatus.CANCELLED &&
            tradeEngineStatus === 'MONITORING') {
            issues.push('Order cancelled but trade engine still monitoring');
        }
        return issues;
    }
    async processSyncQueue() {
        if (this.isProcessingQueue || this.syncQueue.length === 0)
            return;
        this.isProcessingQueue = true;
        this.logger.log(`Processing sync queue with ${this.syncQueue.length} orders`);
        while (this.syncQueue.length > 0) {
            const orderId = this.syncQueue.shift();
            try {
                await this.synchronizeOrder(orderId);
            }
            catch (error) {
                this.logger.error(`Error synchronizing order ${orderId}: ${error.message}`, error.stack);
                const syncState = this.syncStates.get(orderId);
                if (syncState && syncState.errors.length < 5) {
                    this.syncQueue.push(orderId);
                }
            }
        }
        this.isProcessingQueue = false;
    }
    async synchronizeOrder(orderId) {
        const syncState = this.syncStates.get(orderId);
        if (!syncState)
            return;
        this.logger.log(`Synchronizing order ${orderId}`);
        try {
            const order = await this.ordersService.getOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order ${orderId} not found, cleaning up sync state`);
                this.syncStates.delete(orderId);
                return;
            }
            switch (order.status) {
                case orders_entity_1.OrderStatus.FILLED:
                    await this.syncFilledOrder(orderId, order);
                    break;
                case orders_entity_1.OrderStatus.CANCELLED:
                    await this.syncCancelledOrder(orderId, order);
                    break;
                case orders_entity_1.OrderStatus.FAILED:
                    await this.syncFailedOrder(orderId, order);
                    break;
                case orders_entity_1.OrderStatus.PENDING:
                    await this.syncPendingOrder(orderId, order);
                    break;
            }
            syncState.errors = [];
            syncState.lastSync = new Date();
            this.logger.log(`Order ${orderId} synchronized successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to synchronize order ${orderId}: ${error.message}`, error.stack);
            syncState.errors.push(`Sync failed: ${error.message}`);
        }
    }
    async syncFilledOrder(orderId, order) {
        const position = await this.positionManagementService.getUserActivePositions(order.userId.toString());
        const orderPosition = position.find((p) => p.creatorOrderId.toString() === orderId);
        if (!orderPosition) {
            this.logger.warn(`No position found for filled order ${orderId}, creating position`);
            await this.positionManagementService.executeOrderManually(orderId, order.userId.toString(), order.symbol, order.side, order.quantity, order.executedPrice || order.price, order.exchangeId || 'manual');
        }
        const limits = this.tradeEngineService.getPriceLimitsForSymbol(order.symbol);
        const relevantLimit = limits.find((limit) => limit.orderId === orderId);
        if (relevantLimit) {
            this.tradeEngineService.removePriceLimit(relevantLimit.id);
        }
    }
    async syncCancelledOrder(orderId, order) {
        const position = await this.positionManagementService.getUserActivePositions(order.userId.toString());
        const orderPosition = position.find((p) => p.creatorOrderId.toString() === orderId);
        if (orderPosition) {
            this.logger.warn(`Position found for cancelled order ${orderId}, closing position`);
            await this.positionManagementService.closePosition(orderPosition._id.toString(), order.executedPrice || order.price);
        }
        const limits = this.tradeEngineService.getPriceLimitsForSymbol(order.symbol);
        const relevantLimit = limits.find((limit) => limit.orderId === orderId);
        if (relevantLimit) {
            this.tradeEngineService.removePriceLimit(relevantLimit.id);
        }
    }
    async syncFailedOrder(orderId, order) {
        const position = await this.positionManagementService.getUserActivePositions(order.userId.toString());
        const orderPosition = position.find((p) => p.creatorOrderId.toString() === orderId);
        if (orderPosition) {
            this.logger.warn(`Position found for failed order ${orderId}, closing position`);
            await this.positionManagementService.closePosition(orderPosition._id.toString(), order.executedPrice || order.price);
        }
        const limits = this.tradeEngineService.getPriceLimitsForSymbol(order.symbol);
        const relevantLimit = limits.find((limit) => limit.orderId === orderId);
        if (relevantLimit) {
            this.tradeEngineService.removePriceLimit(relevantLimit.id);
        }
    }
    async syncPendingOrder(orderId, order) {
        const limits = this.tradeEngineService.getPriceLimitsForSymbol(order.symbol);
        const relevantLimit = limits.find((limit) => limit.orderId === orderId);
        if (!relevantLimit && order.price) {
            this.logger.warn(`No price monitoring found for pending order ${orderId}, setting up monitoring`);
            const condition = order.side === orders_entity_1.OrderSide.BUY ? 'BELOW' : 'ABOVE';
            this.tradeEngineService.addPriceLimit({
                symbol: order.symbol,
                limitPrice: order.price,
                condition,
                orderId,
                amount: order.quantity,
                userId: order.userId.toString(),
            });
        }
    }
    getOrderSyncStatus(orderId) {
        return this.syncStates.get(orderId) || null;
    }
    getAllSyncStates() {
        return Array.from(this.syncStates.values());
    }
    async forceSyncOrder(orderId) {
        this.logger.log(`Force synchronizing order ${orderId}`);
        if (!this.syncQueue.includes(orderId)) {
            this.syncQueue.push(orderId);
        }
        if (!this.isProcessingQueue) {
            this.processSyncQueue();
        }
    }
    async cleanupCompletedOrders() {
        const completedStatuses = [
            orders_entity_1.OrderStatus.FILLED,
            orders_entity_1.OrderStatus.CANCELLED,
            orders_entity_1.OrderStatus.FAILED,
        ];
        const completedOrders = Array.from(this.syncStates.entries())
            .filter(([_, state]) => completedStatuses.includes(state.orderStatus))
            .map(([orderId, _]) => orderId);
        completedOrders.forEach((orderId) => {
            this.syncStates.delete(orderId);
        });
        this.logger.log(`Cleaned up ${completedOrders.length} completed orders from sync states`);
    }
    getSyncHealth() {
        const totalOrders = this.syncStates.size;
        const ordersWithErrors = Array.from(this.syncStates.values()).filter((state) => state.errors.length > 0).length;
        const queueLength = this.syncQueue.length;
        return {
            totalOrders,
            ordersWithErrors,
            queueLength,
            isProcessingQueue: this.isProcessingQueue,
            errorRate: totalOrders > 0 ? (ordersWithErrors / totalOrders) * 100 : 0,
        };
    }
};
exports.OrderSynchronizationService = OrderSynchronizationService;
__decorate([
    (0, event_emitter_2.OnEvent)(eventsType_1.EventsType.ORDER_STATUS_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderSynchronizationService.prototype, "handleOrderStatusUpdate", null);
__decorate([
    (0, event_emitter_2.OnEvent)(eventsType_1.EventsType.POSITION_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderSynchronizationService.prototype, "handlePositionUpdate", null);
__decorate([
    (0, event_emitter_2.OnEvent)(eventsType_1.EventsType.PRICE_LIMIT_TRIGGERED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderSynchronizationService.prototype, "handlePriceLimitTriggered", null);
exports.OrderSynchronizationService = OrderSynchronizationService = OrderSynchronizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof orders_service_1.OrdersService !== "undefined" && orders_service_1.OrdersService) === "function" ? _a : Object, position_management_service_1.PositionManagementService,
        order_lifecycle_service_1.OrderLifecycleService,
        trade_engine_service_1.TradeEngineService,
        event_emitter_1.EventEmitter2])
], OrderSynchronizationService);
//# sourceMappingURL=order-synchronization.service.js.map