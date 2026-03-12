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
var PositionManagementService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionManagementService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_emitter_2 = require("@nestjs/event-emitter");
const position_service_1 = require("./position.service");
const orders_service_1 = require("./orders.service");
const eventsType_1 = require("../../../utils/constants/eventsType");
const orders_entity_1 = require("../orders.entity");
let PositionManagementService = PositionManagementService_1 = class PositionManagementService {
    constructor(positionService, ordersService, eventEmitter) {
        this.positionService = positionService;
        this.ordersService = ordersService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PositionManagementService_1.name);
    }
    async handleOrderTriggered(event) {
        try {
            this.logger.log(`Order triggered: ${event.orderId} for ${event.symbol}`);
            const executionEvent = {
                orderId: event.orderId,
                userId: event.userId,
                symbol: event.symbol,
                side: event.side,
                quantity: event.quantity,
                executedPrice: event.triggerPrice,
                executedAt: new Date(),
                exchangeId: event.exchangeId || 'manual',
                fees: event.fees || 0,
            };
            await this.processOrderExecution(executionEvent);
        }
        catch (error) {
            this.logger.error(`Error handling order trigger: ${error.message}`, error.stack);
        }
    }
    async processOrderExecution(executionEvent) {
        try {
            const { orderId, userId, symbol, side, quantity, executedPrice, exchangeId, } = executionEvent;
            this.logger.log(`Processing order execution: ${orderId} - ${side} ${quantity} ${symbol} @ $${executedPrice}`);
            const positionResult = await this.positionService.handleOrderExecution(userId, symbol, side, quantity, executedPrice, orderId, exchangeId);
            await this.updateOrderStatus(orderId, orders_entity_1.OrderStatus.FILLED, executedPrice);
            this.eventEmitter.emit(eventsType_1.EventsType.POSITION_UPDATED, {
                userId,
                symbol,
                positionResult,
                executionEvent,
                timestamp: new Date(),
            });
            this.logger.log(`Position updated: ${positionResult.action} - ${positionResult.message}`);
            return positionResult;
        }
        catch (error) {
            this.logger.error(`Error processing order execution: ${error.message}`, error.stack);
            await this.updateOrderStatus(executionEvent.orderId, orders_entity_1.OrderStatus.FAILED);
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
            this.logger.log(`Updated order ${orderId} status to ${status}`);
        }
        catch (error) {
            this.logger.error(`Error updating order status: ${error.message}`, error.stack);
        }
    }
    async executeOrderManually(orderId, userId, symbol, side, quantity, executedPrice, exchangeId = 'manual') {
        const executionEvent = {
            orderId,
            userId,
            symbol,
            side,
            quantity,
            executedPrice,
            executedAt: new Date(),
            exchangeId,
        };
        return await this.processOrderExecution(executionEvent);
    }
    async getUserPositionSummary(userId) {
        return await this.positionService.getPositionSummary(userId);
    }
    async closePosition(positionId, closePrice) {
        return await this.positionService.closePosition(positionId, closePrice);
    }
    async getUserActivePositions(userId) {
        return await this.positionService.getActivePositions(userId);
    }
    async calculatePositionPnL(positionId, currentPrice) {
        const position = await this.positionService.getPositionByOrderId(positionId);
        if (!position) {
            throw new Error('Position not found');
        }
        return await this.positionService.calculatePositionMetrics(position, currentPrice);
    }
    async handleStopLossTrigger(orderId, userId, symbol, currentPrice) {
        try {
            const position = await this.positionService.getPositionByOrderId(orderId);
            if (!position) {
                this.logger.warn(`No position found for order ${orderId}`);
                return;
            }
            const result = await this.positionService.closePosition(position._id.toString(), currentPrice);
            this.logger.log(`Stop loss triggered for position ${position._id}: ${result.message}`);
            this.eventEmitter.emit(eventsType_1.EventsType.STOP_LOSS_TRIGGERED, {
                positionId: position._id,
                orderId,
                userId,
                symbol,
                triggerPrice: currentPrice,
                pnl: result.pnl,
                timestamp: new Date(),
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error handling stop loss trigger: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleTakeProfitTrigger(orderId, userId, symbol, currentPrice) {
        try {
            const position = await this.positionService.getPositionByOrderId(orderId);
            if (!position) {
                this.logger.warn(`No position found for order ${orderId}`);
                return;
            }
            const result = await this.positionService.closePosition(position._id.toString(), currentPrice);
            this.logger.log(`Take profit triggered for position ${position._id}: ${result.message}`);
            this.eventEmitter.emit(eventsType_1.EventsType.TAKE_PROFIT_TRIGGERED, {
                positionId: position._id,
                orderId,
                userId,
                symbol,
                triggerPrice: currentPrice,
                pnl: result.pnl,
                timestamp: new Date(),
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error handling take profit trigger: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPositionStatistics(userId) {
        return {
            totalPositions: 0,
            totalPnl: 0,
            winRate: 0,
            averageHoldingTime: 0,
            bestTrade: null,
            worstTrade: null,
        };
    }
};
exports.PositionManagementService = PositionManagementService;
__decorate([
    (0, event_emitter_2.OnEvent)(eventsType_1.EventsType.ORDER_TRIGGERED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PositionManagementService.prototype, "handleOrderTriggered", null);
exports.PositionManagementService = PositionManagementService = PositionManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [position_service_1.PositionService, typeof (_a = typeof orders_service_1.OrdersService !== "undefined" && orders_service_1.OrdersService) === "function" ? _a : Object, event_emitter_1.EventEmitter2])
], PositionManagementService);
//# sourceMappingURL=position-management.service.js.map