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
exports.PositionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const position_service_1 = require("../services/position.service");
const orders_entity_1 = require("../orders.entity");
let PositionController = class PositionController {
    constructor(positionService) {
        this.positionService = positionService;
    }
    async getActivePositions(req) {
        const userId = req.user.userId;
        const positions = this.positionService.getUserPositions(userId);
        return {
            success: true,
            data: positions,
            count: positions.length,
        };
    }
    async getPositionBySymbol(symbol, req) {
        const userId = req.user.userId;
        const position = this.positionService.getPosition(userId, symbol);
        if (!position) {
            return {
                success: false,
                message: 'Position not found',
            };
        }
        return {
            success: true,
            data: position,
        };
    }
    async getPositionStats(req) {
        const userId = req.user.userId;
        const stats = this.positionService.getUserPositionStats(userId);
        return {
            success: true,
            data: stats,
        };
    }
    async updatePositionPrice(body, req) {
        const userId = req.user.userId;
        const { symbol, currentPrice } = body;
        const position = this.positionService.updatePositionPrice(userId, symbol, currentPrice);
        if (!position) {
            return {
                success: false,
                message: 'Position not found or already closed',
            };
        }
        return {
            success: true,
            data: position,
            message: 'Position price updated successfully',
        };
    }
    async closePosition(body, req) {
        const userId = req.user.userId;
        const { symbol, closePrice } = body;
        const position = this.positionService.closePosition(userId, symbol, closePrice);
        if (!position) {
            return {
                success: false,
                message: 'Position not found or already closed',
            };
        }
        return {
            success: true,
            data: position,
            message: 'Position closed successfully',
        };
    }
    async getAllPositions(req) {
        const positions = this.positionService.getAllPositions();
        return {
            success: true,
            data: positions,
            count: positions.length,
        };
    }
    async getPositionsBySide(side, req) {
        const userId = req.user.userId;
        const positions = this.positionService.getUserPositions(userId);
        const sidePositions = positions.filter((p) => p.side === side);
        return {
            success: true,
            data: sidePositions,
            count: sidePositions.length,
        };
    }
};
exports.PositionController = PositionController;
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "getActivePositions", null);
__decorate([
    (0, common_1.Get)('symbol/:symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "getPositionBySymbol", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "getPositionStats", null);
__decorate([
    (0, common_1.Put)('update-price'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "updatePositionPrice", null);
__decorate([
    (0, common_1.Put)('close'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "closePosition", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "getAllPositions", null);
__decorate([
    (0, common_1.Get)('side/:side'),
    __param(0, (0, common_1.Param)('side')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PositionController.prototype, "getPositionsBySide", null);
exports.PositionController = PositionController = __decorate([
    (0, common_1.Controller)('positions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [position_service_1.PositionService])
], PositionController);
//# sourceMappingURL=position.controller.js.map