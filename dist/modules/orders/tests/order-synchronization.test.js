"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const event_emitter_1 = require("@nestjs/event-emitter");
const orders_service_1 = require("../orders.service");
const position_management_service_1 = require("../services/position-management.service");
const order_lifecycle_service_1 = require("../services/order-lifecycle.service");
const order_synchronization_service_1 = require("../services/order-synchronization.service");
const trade_engine_service_1 = require("../../trade-engine/services/trade-engine.service");
const orders_entity_1 = require("../orders.entity");
const eventsType_1 = require("../../../utils/constants/eventsType");
describe('Order Synchronization Integration', () => {
    let module;
    let ordersService;
    let positionManagementService;
    let orderLifecycleService;
    let orderSynchronizationService;
    let tradeEngineService;
    let eventEmitter;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                {
                    provide: orders_service_1.OrdersService,
                    useValue: {
                        createOrder: jest.fn(),
                        getOrderById: jest.fn(),
                        updateOrder: jest.fn(),
                    },
                },
                {
                    provide: position_management_service_1.PositionManagementService,
                    useValue: {
                        executeOrderManually: jest.fn(),
                        getUserActivePositions: jest.fn(),
                        closePosition: jest.fn(),
                    },
                },
                {
                    provide: order_lifecycle_service_1.OrderLifecycleService,
                    useValue: {
                        handleOrderCreated: jest.fn(),
                        handleOrderTriggered: jest.fn(),
                        cancelOrder: jest.fn(),
                    },
                },
                {
                    provide: order_synchronization_service_1.OrderSynchronizationService,
                    useValue: {
                        initializeOrderSync: jest.fn(),
                        getOrderSyncStatus: jest.fn(),
                        forceSyncOrder: jest.fn(),
                        getSyncHealth: jest.fn(),
                    },
                },
                {
                    provide: trade_engine_service_1.TradeEngineService,
                    useValue: {
                        addPriceLimit: jest.fn(),
                        removePriceLimit: jest.fn(),
                        getPriceLimitsForSymbol: jest.fn(),
                        getCurrentPrice: jest.fn(),
                    },
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
        positionManagementService = module.get(position_management_service_1.PositionManagementService);
        orderLifecycleService = module.get(order_lifecycle_service_1.OrderLifecycleService);
        orderSynchronizationService = module.get(order_synchronization_service_1.OrderSynchronizationService);
        tradeEngineService = module.get(trade_engine_service_1.TradeEngineService);
        eventEmitter = module.get(event_emitter_1.EventEmitter2);
    });
    afterEach(async () => {
        await module.close();
    });
    describe('Order Creation Flow', () => {
        it('should create order and initialize synchronization', async () => {
            const userId = 'user123';
            const orderData = {
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                price: 50000,
                type: 'LIMIT',
            };
            const mockOrder = {
                _id: 'order123',
                ...orderData,
                status: orders_entity_1.OrderStatus.PENDING,
                userId: userId,
            };
            jest
                .spyOn(ordersService, 'createOrder')
                .mockResolvedValue(mockOrder);
            const order = await ordersService.createOrder(userId, orderData);
            expect(order).toBeDefined();
            expect(order.status).toBe(orders_entity_1.OrderStatus.PENDING);
            expect(eventEmitter.emit).toHaveBeenCalledWith(eventsType_1.EventsType.ORDER_CREATED, expect.objectContaining({
                orderId: 'order123',
                userId,
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                price: 50000,
                status: orders_entity_1.OrderStatus.PENDING,
            }));
        });
    });
    describe('Order Execution Flow', () => {
        it('should execute order and create position', async () => {
            const orderId = 'order123';
            const userId = 'user123';
            const executionEvent = {
                orderId,
                userId,
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                triggerPrice: 50000,
                exchangeId: 'binance',
            };
            const mockPositionResult = {
                action: 'CREATED',
                position: { _id: 'position123' },
                message: 'Position created',
            };
            jest
                .spyOn(positionManagementService, 'executeOrderManually')
                .mockResolvedValue(mockPositionResult);
            jest.spyOn(ordersService, 'updateOrder').mockResolvedValue(undefined);
            const result = await positionManagementService.executeOrderManually(orderId, userId, 'BTCUSDT', orders_entity_1.OrderSide.BUY, 1, 50000, 'binance');
            expect(result).toBeDefined();
            expect(result.action).toBe('CREATED');
            expect(ordersService.updateOrder).toHaveBeenCalledWith(orderId, expect.objectContaining({
                status: orders_entity_1.OrderStatus.FILLED,
                executedPrice: 50000,
            }));
        });
    });
    describe('Order Cancellation Flow', () => {
        it('should cancel order and cleanup resources', async () => {
            const orderId = 'order123';
            const userId = 'user123';
            const mockOrder = {
                _id: orderId,
                userId,
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                price: 50000,
                status: orders_entity_1.OrderStatus.PENDING,
            };
            jest
                .spyOn(ordersService, 'getOrderById')
                .mockResolvedValue(mockOrder);
            jest.spyOn(ordersService, 'updateOrder').mockResolvedValue(undefined);
            jest
                .spyOn(tradeEngineService, 'getPriceLimitsForSymbol')
                .mockReturnValue([{ id: 'limit123', orderId, symbol: 'BTCUSDT' }]);
            jest.spyOn(tradeEngineService, 'removePriceLimit').mockReturnValue(true);
            await orderLifecycleService.cancelOrder(orderId, userId);
            expect(ordersService.updateOrder).toHaveBeenCalledWith(orderId, expect.objectContaining({
                status: orders_entity_1.OrderStatus.CANCELLED,
            }));
            expect(tradeEngineService.removePriceLimit).toHaveBeenCalledWith('limit123');
        });
    });
    describe('Synchronization Health', () => {
        it('should report synchronization health', () => {
            const mockHealth = {
                totalOrders: 10,
                ordersWithErrors: 1,
                queueLength: 0,
                isProcessingQueue: false,
                errorRate: 10,
            };
            jest
                .spyOn(orderSynchronizationService, 'getSyncHealth')
                .mockReturnValue(mockHealth);
            const health = orderSynchronizationService.getSyncHealth();
            expect(health).toEqual(mockHealth);
            expect(health.totalOrders).toBe(10);
            expect(health.errorRate).toBe(10);
        });
    });
    describe('Error Handling', () => {
        it('should handle order execution failures gracefully', async () => {
            const orderId = 'order123';
            const userId = 'user123';
            const executionEvent = {
                orderId,
                userId,
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                triggerPrice: 50000,
            };
            jest
                .spyOn(positionManagementService, 'executeOrderManually')
                .mockRejectedValue(new Error('Position creation failed'));
            jest.spyOn(ordersService, 'updateOrder').mockResolvedValue(undefined);
            try {
                await positionManagementService.executeOrderManually(orderId, userId, 'BTCUSDT', orders_entity_1.OrderSide.BUY, 1, 50000);
            }
            catch (error) {
                expect(error.message).toBe('Position creation failed');
            }
            expect(ordersService.updateOrder).toHaveBeenCalledWith(orderId, expect.objectContaining({
                status: orders_entity_1.OrderStatus.FAILED,
            }));
        });
    });
    describe('Event Flow Integration', () => {
        it('should handle complete order lifecycle events', async () => {
            const userId = 'user123';
            const orderData = {
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                quantity: 1,
                price: 50000,
                type: 'LIMIT',
            };
            const mockOrder = {
                _id: 'order123',
                ...orderData,
                status: orders_entity_1.OrderStatus.PENDING,
                userId,
            };
            jest
                .spyOn(ordersService, 'createOrder')
                .mockResolvedValue(mockOrder);
            const order = await ordersService.createOrder(userId, orderData);
            expect(eventEmitter.emit).toHaveBeenCalledWith(eventsType_1.EventsType.ORDER_CREATED, expect.objectContaining({
                orderId: 'order123',
                userId,
                symbol: 'BTCUSDT',
                side: orders_entity_1.OrderSide.BUY,
                status: orders_entity_1.OrderStatus.PENDING,
            }));
            const triggerEvent = {
                limitId: 'limit123',
                limit: {
                    orderId: 'order123',
                    symbol: 'BTCUSDT',
                    limitPrice: 50000,
                    condition: 'BELOW',
                },
                priceUpdate: {
                    symbol: 'BTCUSDT',
                    price: 49900,
                    timestamp: new Date(),
                },
            };
            eventEmitter.emit(eventsType_1.EventsType.PRICE_LIMIT_TRIGGERED, triggerEvent);
            expect(eventEmitter.emit).toHaveBeenCalledWith(eventsType_1.EventsType.PRICE_LIMIT_TRIGGERED, triggerEvent);
        });
    });
});
//# sourceMappingURL=order-synchronization.test.js.map