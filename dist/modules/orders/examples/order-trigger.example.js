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
var OrderTriggerExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTriggerExample = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const orders_service_1 = require("../orders.service");
const position_service_1 = require("../services/position.service");
const orders_entity_1 = require("../orders.entity");
const eventsType_1 = require("../../../utils/constants/eventsType");
let OrderTriggerExample = OrderTriggerExample_1 = class OrderTriggerExample {
    constructor(ordersService, positionService, eventEmitter) {
        this.ordersService = ordersService;
        this.positionService = positionService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(OrderTriggerExample_1.name);
    }
    async demonstrateOrderTriggerFlow() {
        this.logger.log('=== Order Trigger Flow Demo ===');
        this.logger.log('1. Creating limit order...');
        const order = await this.ordersService.createOrder('user123', {
            symbol: 'BTCUSDT',
            side: orders_entity_1.OrderSide.BUY,
            quantity: 1,
            price: 50000,
            type: 'LIMIT',
        });
        this.logger.log(`Order created: ${order.uuid} - ${order.side} ${order.quantity} ${order.symbol} @ $${order.price}`);
        this.logger.log('2. Simulating price trigger from trade engine...');
        const triggerEvent = {
            orderId: order._id.toString(),
            userId: 'user123',
            symbol: 'BTCUSDT',
            side: orders_entity_1.OrderSide.BUY,
            quantity: 1,
            triggerPrice: 49900,
        };
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_TRIGGERED, triggerEvent);
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.logger.log('3. Checking position...');
        const position = this.positionService.getPosition('user123', 'BTCUSDT');
        if (position) {
            this.logger.log(`Position: ${position.side} ${position.quantity} ${position.symbol} @ $${position.averagePrice}`);
        }
        else {
            this.logger.log('No position found');
        }
        this.logger.log('4. Getting position statistics...');
        const stats = this.positionService.getUserPositionStats('user123');
        this.logger.log('Position Stats:', JSON.stringify(stats, null, 2));
    }
    async demonstratePositionManagement() {
        this.logger.log('=== Position Management Demo ===');
        const userId = 'user456';
        const symbol = 'ETHUSDT';
        this.logger.log('1. Creating first order: BUY 10 ETH @ $3,000');
        const order1 = await this.ordersService.createOrder(userId, {
            symbol,
            side: orders_entity_1.OrderSide.BUY,
            quantity: 10,
            price: 3000,
            type: 'LIMIT',
        });
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_TRIGGERED, {
            orderId: order1._id.toString(),
            userId,
            symbol,
            side: orders_entity_1.OrderSide.BUY,
            quantity: 10,
            triggerPrice: 2990,
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.logger.log('2. Creating second order: BUY 5 ETH @ $3,100');
        const order2 = await this.ordersService.createOrder(userId, {
            symbol,
            side: orders_entity_1.OrderSide.BUY,
            quantity: 5,
            price: 3100,
            type: 'LIMIT',
        });
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_TRIGGERED, {
            orderId: order2._id.toString(),
            userId,
            symbol,
            side: orders_entity_1.OrderSide.BUY,
            quantity: 5,
            triggerPrice: 3090,
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.logger.log('3. Creating third order: SELL 3 ETH @ $3,200');
        const order3 = await this.ordersService.createOrder(userId, {
            symbol,
            side: orders_entity_1.OrderSide.SELL,
            quantity: 3,
            price: 3200,
            type: 'LIMIT',
        });
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_TRIGGERED, {
            orderId: order3._id.toString(),
            userId,
            symbol,
            side: orders_entity_1.OrderSide.SELL,
            quantity: 3,
            triggerPrice: 3210,
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.logger.log('4. Checking final position...');
        const position = this.positionService.getPosition(userId, symbol);
        if (position) {
            this.logger.log(`Final Position: ${position.side} ${position.quantity} ${position.symbol} @ $${position.averagePrice}`);
            this.logger.log(`Realized PnL: $${position.realizedPnl || 0}`);
        }
        const stats = this.positionService.getUserPositionStats(userId);
        this.logger.log('Final Stats:', JSON.stringify(stats, null, 2));
    }
    async demonstratePositionClosure() {
        this.logger.log('=== Position Closure Demo ===');
        const userId = 'user789';
        const symbol = 'SOLUSDT';
        this.logger.log('1. Creating buy order: BUY 100 SOL @ $100');
        const buyOrder = await this.ordersService.createOrder(userId, {
            symbol,
            side: orders_entity_1.OrderSide.BUY,
            quantity: 100,
            price: 100,
            type: 'LIMIT',
        });
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_TRIGGERED, {
            orderId: buyOrder._id.toString(),
            userId,
            symbol,
            side: orders_entity_1.OrderSide.BUY,
            quantity: 100,
            triggerPrice: 99,
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.logger.log('2. Closing position manually at $120');
        const closedPosition = this.positionService.closePosition(userId, symbol, 120);
        if (closedPosition) {
            this.logger.log(`Position closed: PnL $${closedPosition.realizedPnl}`);
        }
        const stats = this.positionService.getUserPositionStats(userId);
        this.logger.log('Final Stats:', JSON.stringify(stats, null, 2));
    }
    async demonstrateErrorHandling() {
        this.logger.log('=== Error Handling Demo ===');
        this.logger.log('1. Triggering non-existent order...');
        this.eventEmitter.emit(eventsType_1.EventsType.ORDER_TRIGGERED, {
            orderId: 'nonexistent',
            userId: 'user999',
            symbol: 'BTCUSDT',
            side: orders_entity_1.OrderSide.BUY,
            quantity: 1,
            triggerPrice: 50000,
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.logger.log('2. Closing non-existent position...');
        const result = this.positionService.closePosition('user999', 'BTCUSDT', 50000);
        if (!result) {
            this.logger.log('Position not found (expected)');
        }
        this.logger.log('Error handling demo completed');
    }
    async runAllExamples() {
        try {
            await this.demonstrateOrderTriggerFlow();
            await this.demonstratePositionManagement();
            await this.demonstratePositionClosure();
            await this.demonstrateErrorHandling();
            this.logger.log('=== All Examples Completed Successfully ===');
        }
        catch (error) {
            this.logger.error('Error running examples:', error);
        }
    }
};
exports.OrderTriggerExample = OrderTriggerExample;
exports.OrderTriggerExample = OrderTriggerExample = OrderTriggerExample_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        position_service_1.PositionService,
        event_emitter_1.EventEmitter2])
], OrderTriggerExample);
//# sourceMappingURL=order-trigger.example.js.map