"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const common_1 = require("@nestjs/common");
let SocketService = class SocketService {
    constructor() {
        this.clients = new Map();
    }
    sendHeartbeat(client) {
        this.heartbeatInterval = setInterval(() => {
            for (const client of this.clients.values()) {
                console.log('Sending heartbeat to client', client.id);
                client.emit('heartbeat', { message: 'Heartbeat' });
            }
        }, 2000);
    }
    stopHeartbeat() {
        clearInterval(this.heartbeatInterval);
    }
    registerClient(userId, client) {
        this.clients.set(userId, client);
        this.sendHeartbeat(client);
    }
    removeClient(client) {
        for (const [userId, sock] of this.clients.entries()) {
            if (sock.id === client.id) {
                this.clients.delete(userId);
                break;
            }
        }
        if (this.clients.size === 0) {
            this.stopHeartbeat();
        }
    }
    emitToUser(userId, event, data) {
        const client = this.clients.get(userId);
        if (client) {
            client.emit(event, data);
            return true;
        }
        return false;
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, common_1.Injectable)()
], SocketService);
//# sourceMappingURL=socket.service.js.map