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
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(NotificationGateway_1.name);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const userId = this.getUserIdFromSocket(client);
        if (userId) {
            this.notificationService.removeWebSocketConnection(userId);
        }
    }
    handleAuthenticate(client, data) {
        const { userId } = data;
        client.data.userId = userId;
        this.notificationService.addWebSocketConnection(userId, client);
        this.logger.log(`User ${userId} authenticated via WebSocket`);
        client.emit('authenticated', {
            message: 'Successfully authenticated',
            userId,
            timestamp: Date.now()
        });
    }
    handleSubscribe(client, data) {
        const userId = this.getUserIdFromSocket(client);
        if (!userId) {
            client.emit('error', { message: 'User not authenticated' });
            return;
        }
        const roomName = `${data.symbol}_${data.type}`;
        client.join(roomName);
        this.logger.log(`User ${userId} subscribed to ${roomName}`);
        client.emit('subscribed', {
            symbol: data.symbol,
            type: data.type,
            room: roomName,
            timestamp: Date.now()
        });
    }
    handleUnsubscribe(client, data) {
        const userId = this.getUserIdFromSocket(client);
        if (!userId) {
            client.emit('error', { message: 'User not authenticated' });
            return;
        }
        const roomName = `${data.symbol}_${data.type}`;
        client.leave(roomName);
        this.logger.log(`User ${userId} unsubscribed from ${roomName}`);
        client.emit('unsubscribed', {
            symbol: data.symbol,
            type: data.type,
            room: roomName,
            timestamp: Date.now()
        });
    }
    handlePing(client) {
        client.emit('pong', { timestamp: Date.now() });
    }
    broadcastToSymbol(symbol, type, message) {
        const roomName = `${symbol}_${type}`;
        this.server.to(roomName).emit('signal', {
            ...message,
            symbol,
            type,
            timestamp: Date.now()
        });
        this.logger.log(`Broadcasted ${type} signal for ${symbol} to room ${roomName}`);
    }
    sendToUser(userId, event, data) {
        const client = this.findClientByUserId(userId);
        if (client) {
            client.emit(event, {
                ...data,
                timestamp: Date.now()
            });
        }
    }
    getUserIdFromSocket(client) {
        return client.data?.userId || null;
    }
    findClientByUserId(userId) {
        const clients = Array.from(this.server.sockets.sockets.values());
        return clients.find(client => client.data?.userId === userId) || null;
    }
    getConnectedUsersCount() {
        return this.server.sockets.sockets.size;
    }
    getConnectedUserIds() {
        const clients = Array.from(this.server.sockets.sockets.values());
        return clients
            .map(client => client.data?.userId)
            .filter(userId => userId !== undefined);
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('authenticate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleAuthenticate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handlePing", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map