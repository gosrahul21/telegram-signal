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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const login_dto_1 = require("./dto/login.dto");
const complete_registration_dto_1 = require("./dto/complete-registration.dto");
const register_dto_1 = require("./dto/register.dto");
const local_auth_guard_1 = require("./guards/local-auth.guard");
const link_telegram_dto_1 = require("../user/dto/link-telegram.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }
    async linkTelegramAccount(linkTelegramDto, req) {
        try {
            const { linkToken } = linkTelegramDto;
            const userId = req.user.id;
            if (!userId) {
                throw new common_1.UnauthorizedException('User not authenticated');
            }
            return await this.authService.linkTelegramAccount(linkToken, userId);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to link telegram account');
        }
    }
    async register(registerDto) {
        return this.authService.register(registerDto.username, registerDto.password);
    }
    async completeRegistration(token, completeRegistrationDto) {
        return this.authService.completeRegistrationWithToken(token, completeRegistrationDto.username, completeRegistrationDto.password);
    }
    getProfile(req) {
        return req.user;
    }
    async loginLocal(req) {
        return this.authService.login(req.user);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: 'User login',
        description: 'Authenticate user with username and password to receive JWT token',
    }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'john_doe' },
                        telegramId: { type: 'number', example: 123456789 },
                        chatId: { type: 'number', example: 123456789 },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Invalid credentials' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('link-telegram'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Link Telegram account',
        description: 'Link a Telegram account to an existing user using a registration token',
    }),
    (0, swagger_1.ApiBody)({ type: link_telegram_dto_1.LinkTelegramDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Telegram account linked successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: {
                    type: 'string',
                    example: 'Telegram account linked successfully',
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'john_doe' },
                        telegramId: { type: 'number', example: 123456789 },
                        chatId: { type: 'number', example: 123456789 },
                        isVerified: { type: 'boolean', example: true },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'User not authenticated or invalid token',
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid link token or token expired' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [link_telegram_dto_1.LinkTelegramDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "linkTelegramAccount", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: 'User registration',
        description: 'Register a new user with username, password, and Telegram information',
    }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'User registered successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User registered successfully' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'john_doe' },
                        telegramId: { type: 'number', example: 123456789 },
                        chatId: { type: 'number', example: 123456789 },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid input data or user already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('complete-registration/:token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete registration with token',
        description: 'Complete user registration using a valid registration token',
    }),
    (0, swagger_1.ApiParam)({
        name: 'token',
        description: 'Registration token received from Telegram bot',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    (0, swagger_1.ApiBody)({ type: complete_registration_dto_1.CompleteRegistrationDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Registration completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: {
                    type: 'string',
                    example: 'Registration completed successfully',
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'john_doe' },
                        telegramId: { type: 'number', example: 123456789 },
                        chatId: { type: 'number', example: 123456789 },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid token or token expired' }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, complete_registration_dto_1.CompleteRegistrationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeRegistration", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user profile',
        description: 'Retrieve the current authenticated user profile',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                username: { type: 'string', example: 'john_doe' },
                telegramId: { type: 'number', example: 123456789 },
                chatId: { type: 'number', example: 123456789 },
                isVerified: { type: 'boolean', example: true },
                lastLogin: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-01T00:00:00.000Z',
                },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'User not authenticated' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.Post)('login-local'),
    (0, swagger_1.ApiOperation)({
        summary: 'Local authentication login',
        description: 'Alternative login method using local strategy',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Local login successful',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'john_doe' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Invalid credentials' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginLocal", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map