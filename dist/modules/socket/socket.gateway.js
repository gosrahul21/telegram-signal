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
        }
    }
    handleDisconnect(client) {
        this.socketService.removeClient(client);
        console.log(`❌ Client disconnected`);
    }
    handlePing(msg, client) {
        return { event: 'pong', data: `Hello, got your ping: ${msg}` };
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
exports.SocketGateway = SocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [socket_service_1.SocketService,
        socket_auth_middleware_1.SocketAuthMiddleware])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map