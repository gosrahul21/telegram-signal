"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const notification_service_1 = require("./notification.service");
const notification_gateway_1 = require("./notification.gateway");
const bot_service_1 = require("../../bot/bot.service");
describe('NotificationService', () => {
    let service;
    let gateway;
    let botService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                notification_service_1.NotificationService,
                notification_gateway_1.NotificationGateway,
                {
                    provide: bot_service_1.BotService,
                    useValue: {
                        getBot: jest.fn().mockReturnValue({
                            api: {
                                sendMessage: jest.fn().mockResolvedValue(true),
                            },
                        }),
                    },
                },
            ],
        }).compile();
        service = module.get(notification_service_1.NotificationService);
        gateway = module.get(notification_gateway_1.NotificationGateway);
        botService = module.get(bot_service_1.BotService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('Telegram Notifications', () => {
        it('should send telegram notification successfully', async () => {
            const userId = '123456789';
            const message = 'Test message';
            const result = await service.sendTelegramNotification(userId, message);
            expect(result).toBe(true);
        });
        it('should send signal notification with formatted message', async () => {
            const userId = '123456789';
            const signalData = {
                symbol: 'BTCUSDT',
                type: 'BUY',
                price: '45000',
                rsi: '30',
                description: 'RSI oversold signal',
            };
            const result = await service.sendSignalNotification(userId, signalData);
            expect(result).toBe(true);
        });
    });
    describe('WebSocket Operations', () => {
        it('should add and remove WebSocket connections', () => {
            const userId = '123456789';
            const mockConnection = { send: jest.fn() };
            service.addWebSocketConnection(userId, mockConnection);
            expect(service.getConnectedUsersCount()).toBe(1);
            service.removeWebSocketConnection(userId);
            expect(service.getConnectedUsersCount()).toBe(0);
        });
        it('should send WebSocket message to connected user', () => {
            const userId = '123456789';
            const mockConnection = { send: jest.fn() };
            const message = {
                type: 'test',
                data: 'test data',
                timestamp: Date.now(),
            };
            service.addWebSocketConnection(userId, mockConnection);
            const result = service.sendWebSocketMessage(userId, message);
            expect(result).toBe(true);
            expect(mockConnection.send).toHaveBeenCalledWith(JSON.stringify(message));
        });
        it('should return false for non-connected user', () => {
            const userId = '123456789';
            const message = {
                type: 'test',
                data: 'test data',
                timestamp: Date.now(),
            };
            const result = service.sendWebSocketMessage(userId, message);
            expect(result).toBe(false);
        });
    });
    describe('Multi-channel Notifications', () => {
        it('should send notification through both channels', async () => {
            const userId = '123456789';
            const mockConnection = { send: jest.fn() };
            const payload = {
                userId,
                message: 'Test message',
                type: 'general',
                data: { test: 'data' },
            };
            service.addWebSocketConnection(userId, mockConnection);
            const result = await service.sendMultiChannelNotification(payload);
            expect(result.telegram).toBe(true);
            expect(result.websocket).toBe(true);
        });
    });
    describe('Connection Management', () => {
        it('should track connected users correctly', () => {
            const userIds = ['123456789', '987654321'];
            const mockConnection = { send: jest.fn() };
            userIds.forEach((userId) => {
                service.addWebSocketConnection(userId, mockConnection);
            });
            expect(service.getConnectedUsersCount()).toBe(2);
            expect(service.getConnectedUserIds()).toEqual(userIds);
        });
    });
});
describe('NotificationGateway', () => {
    let gateway;
    let notificationService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                notification_gateway_1.NotificationGateway,
                {
                    provide: notification_service_1.NotificationService,
                    useValue: {
                        addWebSocketConnection: jest.fn(),
                        removeWebSocketConnection: jest.fn(),
                    },
                },
            ],
        }).compile();
        gateway = module.get(notification_gateway_1.NotificationGateway);
        notificationService = module.get(notification_service_1.NotificationService);
    });
    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
    it('should handle authentication', () => {
        const mockClient = {
            data: {},
            emit: jest.fn(),
        };
        const data = { userId: '123456789' };
        gateway.handleAuthenticate(mockClient, data);
        expect(mockClient.data.userId).toBe(data.userId);
        expect(notificationService.addWebSocketConnection).toHaveBeenCalledWith(data.userId, mockClient);
        expect(mockClient.emit).toHaveBeenCalledWith('authenticated', expect.any(Object));
    });
    it('should handle subscription', () => {
        const mockClient = {
            data: { userId: '123456789' },
            emit: jest.fn(),
            join: jest.fn(),
        };
        const data = { symbol: 'BTCUSDT', type: 'signal' };
        gateway.handleSubscribe(mockClient, data);
        expect(mockClient.join).toHaveBeenCalledWith('BTCUSDT_signal');
        expect(mockClient.emit).toHaveBeenCalledWith('subscribed', expect.any(Object));
    });
    it('should handle unsubscription', () => {
        const mockClient = {
            data: { userId: '123456789' },
            emit: jest.fn(),
            leave: jest.fn(),
        };
        const data = { symbol: 'BTCUSDT', type: 'signal' };
        gateway.handleUnsubscribe(mockClient, data);
        expect(mockClient.leave).toHaveBeenCalledWith('BTCUSDT_signal');
        expect(mockClient.emit).toHaveBeenCalledWith('unsubscribed', expect.any(Object));
    });
});
//# sourceMappingURL=notification.test.js.map