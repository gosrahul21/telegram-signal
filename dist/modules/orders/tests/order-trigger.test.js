"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const event_emitter_1 = require("@nestjs/event-emitter");
const mongoose_1 = require("@nestjs/mongoose");
const orders_service_1 = require("../orders.service");
const position_service_1 = require("../services/position.service");
const orders_entity_1 = require("../orders.entity");
const eventsType_1 = require("../../../utils/constants/eventsType");
describe('Order Trigger Integration', () => {
    let module;
    let ordersService;
    let positionService;
    let eventEmitter;
    let mockOrderModel;
    beforeEach(async () => {
        const mockOrder = {
            _id: 'order123',
            uuid: 'order-uuid-123',
            userId: 'user123',
            symbol: 'BTCUSDT',
            side: orders_entity_1.OrderSide.BUY,
            quantity: 1,
            price: 50000,
            status: orders_entity_1.OrderStatus.PENDING,
            save: jest.fn(),
            toObject: jest.fn(() => ({
                _id: 'order123',
                uuid: 'order-uuid-123',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                price: 50000,
                status: orders_entity_1.OrderStatus.FILLED,
                executedPrice: 49900,
                executedAt: new Date(),
            })),
        };
        mockOrderModel = {
            findOne: jest.fn().mockResolvedValue(mockOrder),
            create: jest.fn(),
            save: jest.fn(),
        };
        module = await testing_1.Test.createTestingModule({
            providers: [
                orders_service_1.OrdersService,
                position_service_1.PositionService,
                {
                    provide: (0, mongoose_1.getModelToken)('Order'),
                    useValue: mockOrderModel,
                },
                {
                    provide: event_emitter_1.EventEmitter2,
                    useValue: {
                        emit: jest.fn(),
                    },
                },
            ],
        }).compile();
        ordersService = module.get(orders_service_1.OrdersService);
        positionService = module.get(position_service_1.PositionService);
        eventEmitter = module.get(event_emitter_1.EventEmitter2);
    });
    afterEach(async () => {
        await module.close();
    });
    describe('Order Trigger Flow', () => {
        it('should handle order trigger and update order status', async () => {
            const triggerEvent = {
                orderId: 'order123',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                triggerPrice: 49900,
            };
            const mockOrder = {
                _id: 'order123',
                uuid: 'order-uuid-123',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                price: 50000,
                status: orders_entity_1.OrderStatus.PENDING,
                save: jest.fn().mockResolvedValue({}),
                toObject: jest.fn(() => ({
                    _id: 'order123',
                    uuid: 'order-uuid-123',
                    userId: 'user123',
                    symbol: 'BTCUSDT',
                    side: orders_entity_1.OrderSide.BUY,
                    quantity: 1,
                    price: 50000,
                    status: orders_entity_1.OrderStatus.FILLED,
                    executedPrice: 49900,
                    executedAt: new Date(),
                })),
            };
            mockOrderModel.findOne.mockResolvedValue(mockOrder);
            await ordersService.handleOrderTriggered(triggerEvent);
            expect(mockOrder.status).toBe(orders_entity_1.OrderStatus.FILLED);
            expect(mockOrder.executedPrice).toBe(49900);
            expect(mockOrder.save).toHaveBeenCalled();
            expect(eventEmitter.emit).toHaveBeenCalledWith(eventsType_1.EventsType.ORDER_EXECUTED, expect.objectContaining({
                orderId: 'order123',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                executedPrice: 49900,
            }));
        });
        it('should handle order not found gracefully', async () => {
            const triggerEvent = {
                orderId: 'nonexistent',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                triggerPrice: 49900,
            };
            mockOrderModel.findOne.mockResolvedValue(null);
            await ordersService.handleOrderTriggered(triggerEvent);
            expect(eventEmitter.emit).toHaveBeenCalledWith(eventsType_1.EventsType.ORDER_FAILED, expect.objectContaining({
                orderId: 'nonexistent',
                userId: 'user123',
                symbol: 'BTCUSDT',
                error: expect.any(String),
            }));
        });
        it('should handle position creation when order is executed', async () => {
            const executionEvent = {
                orderId: 'order123',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                executedPrice: 49900,
                executedAt: new Date(),
            };
            await positionService.handleOrderExecuted(executionEvent);
            const position = positionService.getPosition('user123', 'BTCUSDT');
            expect(position).toBeDefined();
            expect(position?.side).toBe(orders_entity_1.OrderSide.BUY);
            expect(position?.quantity).toBe(1);
            expect(position?.averagePrice).toBe(49900);
            expect(eventEmitter.emit).toHaveBeenCalledWith(eventsType_1.EventsType.POSITION_CREATED, expect.objectContaining({
                position: expect.objectContaining({
                    symbol: 'BTCUSDT',
                    side: orders_entity_1.OrderSide.BUY,
                    quantity: 1,
                    averagePrice: 49900,
                }),
                orderId: 'order123',
            }));
        });
        it('should handle position increase when same side order is executed', async () => {
            const firstExecution = {
                orderId: 'order1',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                executedPrice: 50000,
                executedAt: new Date(),
            };
            await positionService.handleOrderExecuted(firstExecution);
            const secondExecution = {
                orderId: 'order2',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 0.5,
                executedPrice: 51000,
                executedAt: new Date(),
            };
            await positionService.handleOrderExecuted(secondExecution);
            const position = positionService.getPosition('user123', 'BTCUSDT');
            expect(position?.quantity).toBe(1.5);
            expect(position?.averagePrice).toBe(50333.33);
            expect(eventEmitter.emit).toHaveBeenCalledWith(eventsType_1.EventsType.POSITION_UPDATED, expect.objectContaining({
                position: expect.objectContaining({
                    quantity: 1.5,
                    averagePrice: 50333.33,
                }),
                action: 'INCREASED',
            }));
        });
        it('should handle position reduction when opposite side order is executed', async () => {
            const firstExecution = {
                orderId: 'order1',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                executedPrice: 50000,
                executedAt: new Date(),
            };
            await positionService.handleOrderExecuted(firstExecution);
            const secondExecution = {
                orderId: 'order2',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.SELL,
                quantity: 0.3,
                executedPrice: 52000,
                executedAt: new Date(),
            };
            await positionService.handleOrderExecuted(secondExecution);
            const position = positionService.getPosition('user123', 'BTCUSDT');
            expect(position?.quantity).toBe(0.7);
            expect(position?.realizedPnl).toBe(600);
            expect(eventEmitter.emit).toHaveBeenCalledWith(eventsType_1.EventsType.POSITION_UPDATED, expect.objectContaining({
                action: 'REDUCED',
                realizedPnl: 600,
            }));
        });
        it('should handle position closure when opposite side order closes position', async () => {
            const firstExecution = {
                orderId: 'order1',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                executedPrice: 50000,
                executedAt: new Date(),
            };
            await positionService.handleOrderExecuted(firstExecution);
            const secondExecution = {
                orderId: 'order2',
                userId: 'user123',
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.SELL,
                quantity: 1,
                executedPrice: 52000,
                executedAt: new Date(),
            };
            await positionService.handleOrderExecuted(secondExecution);
            const position = positionService.getPosition('user123', 'BTCUSDT');
            expect(position?.quantity).toBe(0);
            expect(position?.realizedPnl).toBe(2000);
            expect(eventEmitter.emit).toHaveBeenCalledWith(eventsType_1.EventsType.POSITION_CLOSED, expect.objectContaining({
                realizedPnl: 2000,
            }));
        });
    });
});
//# sourceMappingURL=order-trigger.test.js.map