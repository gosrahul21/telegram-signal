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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_user_dto_1 = require("./dto/create-user.dto");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    create(createUserData) {
        return this.userService.create(createUserData);
    }
    findAll() {
        return this.userService.findAll();
    }
    getProfile(req) {
        return this.userService.findById(req.user.id);
    }
    findOne(id) {
        return this.userService.findById(id);
    }
    update(id, updateData) {
        return this.userService.update(id, updateData);
    }
    updateTelegramData(id, updateData) {
        return this.userService.linkTelegramAccount(id, updateData.telegramId, updateData.chatId);
    }
    remove(id) {
        return this.userService.remove(id);
    }
    verifyUser(id) {
        return this.userService.verifyUser(id);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new user',
        description: 'Create a new user account with username and password',
    }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'User created successfully',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                username: { type: 'string', example: 'john_doe' },
                telegramId: { type: 'number', example: 123456789 },
                chatId: { type: 'number', example: 123456789 },
                isVerified: { type: 'boolean', example: false },
                lastLogin: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-01T00:00:00.000Z',
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-01T00:00:00.000Z',
                },
                updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-01T00:00:00.000Z',
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid input data or user already exists',
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'User not authenticated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users',
        description: 'Retrieve a list of all users (admin only)',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of users retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
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
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'User not authenticated' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user profile',
        description: 'Retrieve the profile of the currently authenticated user',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                username: { type: 'string', example: 'john_doe' },
                telegramId: { type: 'number', example: 123456789 },
                chatId: { type: 'number', example: 123456789 },
                isVerified: { type: 'boolean', example: true },
                lastLogin: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-01T00:00:00.000Z',
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-01T00:00:00.000Z',
                },
                updatedAt: {
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
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
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
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'User not authenticated' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user',
        description: 'Update user information by ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiBody)({
        description: 'User update data',
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string', example: 'new_username' },
                password: { type: 'string', example: 'newpassword123' },
                isVerified: { type: 'boolean', example: true },
            },
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User updated successfully',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                username: { type: 'string', example: 'new_username' },
                telegramId: { type: 'number', example: 123456789 },
                chatId: { type: 'number', example: 123456789 },
                isVerified: { type: 'boolean', example: true },
                lastLogin: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-01T00:00:00.000Z',
                },
                updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-01T00:00:00.000Z',
                },
            },
        },
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'User not authenticated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateTelegramData", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete user',
        description: 'Delete a user account by ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'User deleted successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'User not authenticated' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify user account',
        description: 'Mark a user account as verified',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User verified successfully',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
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
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'User not authenticated' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "verifyUser", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map