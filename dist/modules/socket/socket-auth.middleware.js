"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketAuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
let SocketAuthMiddleware = class SocketAuthMiddleware {
    use(socket, next) {
        try {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) {
                return next(new Error("Authentication error"));
            }
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            console.log(payload, process.env.JWT_SECRET);
            socket.data = { user: payload };
            next();
        }
        catch (err) {
            return next(new Error("Authentication error"));
        }
    }
};
exports.SocketAuthMiddleware = SocketAuthMiddleware;
exports.SocketAuthMiddleware = SocketAuthMiddleware = __decorate([
    (0, common_1.Injectable)()
], SocketAuthMiddleware);
//# sourceMappingURL=socket-auth.middleware.js.map