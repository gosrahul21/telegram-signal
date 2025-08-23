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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationTokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let RegistrationTokenService = class RegistrationTokenService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    generateRegistrationToken(telegramId, chatId) {
        const payload = {
            telegramId,
            chatId,
            type: 'registration',
        };
        return this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET') || 'your-secret-key',
            expiresIn: '5m',
        });
    }
    verifyRegistrationToken(token) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET') || 'your-secret-key',
            });
            if (payload.type !== 'registration') {
                throw new Error('Invalid token type');
            }
            return payload;
        }
        catch (error) {
            throw new Error('Invalid or expired registration token');
        }
    }
    isTokenExpired(token) {
        try {
            const payload = this.jwtService.decode(token);
            if (!payload || !payload.exp)
                return true;
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        }
        catch {
            return true;
        }
    }
};
exports.RegistrationTokenService = RegistrationTokenService;
exports.RegistrationTokenService = RegistrationTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], RegistrationTokenService);
//# sourceMappingURL=registration-token.service.js.map