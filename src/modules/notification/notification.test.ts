import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { BotService } from '../../bot/bot.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let gateway: NotificationGateway;
  let botService: BotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        NotificationGateway,
        {
          provide: BotService,
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

    service = module.get<NotificationService>(NotificationService);
    gateway = module.get<NotificationGateway>(NotificationGateway);
    botService = module.get<BotService>(BotService);
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
        type: 'general' as const,
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
  let gateway: NotificationGateway;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        {
          provide: NotificationService,
          useValue: {
            addWebSocketConnection: jest.fn(),
            removeWebSocketConnection: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle authentication', () => {
    const mockClient = {
      data: {},
      emit: jest.fn(),
    } as any;

    const data = { userId: '123456789' };

    gateway.handleAuthenticate(mockClient, data);

    expect(mockClient.data.userId).toBe(data.userId);
    expect(notificationService.addWebSocketConnection).toHaveBeenCalledWith(
      data.userId,
      mockClient,
    );
    expect(mockClient.emit).toHaveBeenCalledWith(
      'authenticated',
      expect.any(Object),
    );
  });

  it('should handle subscription', () => {
    const mockClient = {
      data: { userId: '123456789' },
      emit: jest.fn(),
      join: jest.fn(),
    } as any;

    const data = { symbol: 'BTCUSDT', type: 'signal' };

    gateway.handleSubscribe(mockClient, data);

    expect(mockClient.join).toHaveBeenCalledWith('BTCUSDT_signal');
    expect(mockClient.emit).toHaveBeenCalledWith(
      'subscribed',
      expect.any(Object),
    );
  });

  it('should handle unsubscription', () => {
    const mockClient = {
      data: { userId: '123456789' },
      emit: jest.fn(),
      leave: jest.fn(),
    } as any;

    const data = { symbol: 'BTCUSDT', type: 'signal' };

    gateway.handleUnsubscribe(mockClient, data);

    expect(mockClient.leave).toHaveBeenCalledWith('BTCUSDT_signal');
    expect(mockClient.emit).toHaveBeenCalledWith(
      'unsubscribed',
      expect.any(Object),
    );
  });
});
