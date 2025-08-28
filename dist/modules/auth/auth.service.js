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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const registration_token_service_1 = require("./registration-token.service");
const bcrypt = require("bcryptjs");
const user_1 = require("../user");
let AuthService = class AuthService {
    constructor(userService, jwtService, registrationTokenService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.registrationTokenService = registrationTokenService;
    }
    async validateUser(username, password) {
        const user = await this.userService.findByUsername(username);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = {
            username: user.username,
            sub: user._id,
            telegramId: user.telegramId,
            chatId: user.chatId,
        };
        return {
            access_token: this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET,
            }),
            user: {
                id: user._id,
                username: user.username,
                telegramId: user.telegramId,
                chatId: user.chatId,
            },
        };
    }
    async register(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userService.create({
            username,
            password: hashedPassword,
        });
        return this.login(user);
    }
    async completeRegistrationWithToken(token, username, password) {
        const tokenPayload = this.registrationTokenService.verifyRegistrationToken(token);
        const existingUser = await this.userService.findByTelegramId(tokenPayload.telegramId);
        if (existingUser) {
            throw new common_1.BadRequestException('User with this Telegram ID already exists');
        }
        const existingUsername = await this.userService.findByUsername(username);
        if (existingUsername) {
            throw new common_1.BadRequestException('Username already taken');
        }
        const user = await this.register(username, password);
        return {
            ...user,
            message: 'Registration completed successfully! Your account is now linked to Telegram.',
        };
    }
    async verifyToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async validateRegistrationToken(token) {
        try {
            const payload = this.registrationTokenService.verifyRegistrationToken(token);
            return {
                isValid: true,
                telegramId: payload.telegramId,
                chatId: payload.chatId,
            };
        }
        catch (error) {
            return {
                isValid: false,
                error: error.message,
            };
        }
    }
    async linkTelegramAccount(linkToken, userId) {
        try {
            const tokenPayload = this.registrationTokenService.verifyRegistrationToken(linkToken);
            const { telegramId, chatId } = tokenPayload;
            if (!telegramId || !chatId) {
                throw new common_1.BadRequestException('Invalid token payload: missing telegramId or chatId');
            }
            const updatedUser = await this.userService.linkTelegramAccount(userId, telegramId, chatId);
            return {
                success: true,
                message: 'Telegram account linked successfully',
                user: {
                    id: updatedUser._id,
                    username: updatedUser.username,
                    telegramId: updatedUser.telegramId,
                    chatId: updatedUser.chatId,
                    isVerified: updatedUser.isVerified,
                },
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_1.UserService,
        jwt_1.JwtService,
        registration_token_service_1.RegistrationTokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map