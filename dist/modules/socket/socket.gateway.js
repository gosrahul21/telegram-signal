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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const socket_service_1 = require("./socket.service");
const socket_auth_middleware_1 = require("./socket-auth.middleware");
let SocketGateway = class SocketGateway {
    constructor(socketService, socketAuthMiddleware) {
        this.socketService = socketService;
        this.socketAuthMiddleware = socketAuthMiddleware;
    }
    handleConnection(client) {
        const userId = client.data.user.sub;
        console.log('handleConnection', client.data.user);
        if (userId) {
            this.socketService.registerClient(userId, client);
            console.log(`✅ User ${userId} connected`);
            client.emit('connected', {
                message: 'Successfully connected to monitoring service',
                userId,
                timestamp: new Date(),
            });
        }
    }
    handleDisconnect(client) {
        this.socketService.removeClient(client);
        console.log(`❌ Client disconnected`);
    }
    handlePing(msg, client) {
        return { event: 'pong', data: `Hello, got your ping: ${msg}` };
    }
    async handleGetConnectionInfo(client) {
        try {
            const userId = client.data.user.sub;
            if (!userId) {
                return { error: 'User not authenticated' };
            }
            const connectionInfo = {
                userId,
                connectionId: client.id,
                connected: this.socketService.isUserConnected(userId),
                totalConnections: this.socketService.getConnectionCount(),
                timestamp: new Date(),
            };
            client.emit('connection_info', connectionInfo);
            return connectionInfo;
        }
        catch (error) {
            console.error('Error getting connection info:', error);
            return { error: 'Failed to get connection info' };
        }
    }
    async handleGetActiveAlerts(client) {
        try {
            const userId = client.data.user.sub;
            if (!userId) {
                return { error: 'User not authenticated' };
            }
            const activeAlerts = {
                userId,
                alerts: [],
                count: 0,
                timestamp: new Date(),
                message: 'Active alerts retrieved successfully',
            };
            client.emit('active_alerts', activeAlerts);
            return activeAlerts;
        }
        catch (error) {
            console.error('Error getting active alerts:', error);
            return { error: 'Failed to get active alerts' };
        }
    }
    async handleGetMonitoringSummary(client) {
        try {
            const userId = client.data.user.sub;
            if (!userId) {
                return { error: 'User not authenticated' };
            }
            const monitoringSummary = {
                userId,
                totalAlerts: 0,
                activeAlerts: 0,
                monitoringSymbols: [],
                lastUpdate: new Date(),
                status: 'active',
                message: 'Monitoring summary retrieved successfully',
            };
            client.emit('monitoring_summary', monitoringSummary);
            return monitoringSummary;
        }
        catch (error) {
            console.error('Error getting monitoring summary:', error);
            return { error: 'Failed to get monitoring summary' };
        }
    }
    async handleTestAlert(data, client) {
        try {
            const userId = client.data.user.sub;
            if (!userId) {
                return { error: 'User not authenticated' };
            }
            const testAlert = {
                type: 'test_alert',
                data: {
                    alertId: 'test_' + Date.now(),
                    symbol: data.symbol || 'TEST',
                    eventType: data.eventType || 'test_event',
                    message: 'This is a test alert',
                    timestamp: new Date(),
                },
                message: 'Test alert sent successfully',
            };
            client.emit('test_alert', testAlert);
            return { success: true, message: 'Test alert sent' };
        }
        catch (error) {
            console.error('Error sending test alert:', error);
            return { error: 'Failed to send test alert' };
        }
    }
    async handleHeartbeat(client) {
        try {
            const userId = client.data.user.sub;
            if (!userId) {
                return { error: 'User not authenticated' };
            }
            const heartbeatResponse = {
                type: 'heartbeat_response',
                data: {
                    userId,
                    timestamp: new Date(),
                    serverTime: Date.now(),
                },
                message: 'Heartbeat received',
            };
            client.emit('heartbeat_response', heartbeatResponse);
            return { success: true, message: 'Heartbeat received' };
        }
        catch (error) {
            console.error('Error handling heartbeat:', error);
            return { error: 'Failed to handle heartbeat' };
        }
    }
    afterInit(server) {
        server.use(this.socketAuthMiddleware.use.bind(this.socketAuthMiddleware));
    }
};
exports.SocketGateway = SocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handlePing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_connection_info'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleGetConnectionInfo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_active_alerts'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleGetActiveAlerts", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_monitoring_summary'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleGetMonitoringSummary", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('test_alert'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTestAlert", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('heartbeat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleHeartbeat", null);
exports.SocketGateway = SocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [socket_service_1.SocketService,
        socket_auth_middleware_1.SocketAuthMiddleware])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map