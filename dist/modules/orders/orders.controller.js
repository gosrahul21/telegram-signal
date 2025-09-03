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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const query_order_dto_1 = require("./dto/query-order.dto");
const bulk_order_dto_1 = require("./dto/bulk-order.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async createOrder(req, createOrderDto) {
        const userId = req.user.id;
        const order = await this.ordersService.createOrder(userId, createOrderDto);
        return {
            success: true,
            message: 'Order created successfully',
            data: order,
        };
    }
    async getOrders(req, queryDto) {
        const userId = req.user.id;
        const result = await this.ordersService.getOrders(userId, queryDto);
        return {
            success: true,
            data: result,
        };
    }
    async getOrderById(req, id) {
        const userId = req.user.id;
        const order = await this.ordersService.getOrderById(userId, id);
        return {
            success: true,
            data: order,
        };
    }
    async updateOrder(req, id, updateOrderDto) {
        const userId = req.user.id;
        const order = await this.ordersService.updateOrder(userId, id, updateOrderDto);
        return {
            success: true,
            message: 'Order updated successfully',
            data: order,
        };
    }
    async cancelOrder(req, id, body) {
        const userId = req.user.id;
        const order = await this.ordersService.cancelOrder(userId, id, body.reason);
        return {
            success: true,
            message: 'Order canceled successfully',
            data: order,
        };
    }
    async deleteOrder(req, id) {
        const userId = req.user.id;
        await this.ordersService.deleteOrder(userId, id);
        return {
            success: true,
            message: 'Order deleted successfully',
        };
    }
    async getOrderStats(req) {
        const userId = req.user.id;
        const stats = await this.ordersService.getOrderStats(userId);
        return {
            success: true,
            data: stats,
        };
    }
    async getActiveOrders(req) {
        const userId = req.user.id;
        const orders = await this.ordersService.getActiveOrders(userId);
        return {
            success: true,
            data: orders,
        };
    }
    async getOrdersBySymbol(req, symbol) {
        const userId = req.user.id;
        const orders = await this.ordersService.getOrdersBySymbol(userId, symbol);
        return {
            success: true,
            data: orders,
        };
    }
    async getOrdersBySignal(signalId) {
        const orders = await this.ordersService.getOrdersBySignal(signalId);
        return {
            success: true,
            data: orders,
        };
    }
    async bulkCreateOrders(req, bulkCreateDto) {
        const userId = req.user.id;
        const result = await this.ordersService.bulkCreateOrders(userId, bulkCreateDto);
        return {
            success: true,
            message: `Bulk orders created: ${result.created.length} successful, ${result.failed.length} failed`,
            data: result,
        };
    }
    async bulkUpdateOrders(req, bulkUpdateDto) {
        const userId = req.user.id;
        const result = await this.ordersService.bulkUpdateOrders(userId, bulkUpdateDto);
        return {
            success: true,
            message: `Bulk orders updated: ${result.updated} successful, ${result.failed.length} failed`,
            data: result,
        };
    }
    async bulkCancelOrders(req, bulkCancelDto) {
        const userId = req.user.id;
        const result = await this.ordersService.bulkCancelOrders(userId, bulkCancelDto);
        return {
            success: true,
            message: `Bulk orders canceled: ${result.canceled} successful, ${result.failed.length} failed`,
            data: result,
        };
    }
    async updateOrderExecution(req, id, executionDto) {
        const userId = req.user.id;
        const order = await this.ordersService.updateOrderExecution(userId, {
            ...executionDto,
            orderId: id,
        });
        return {
            success: true,
            message: 'Order execution updated successfully',
            data: order,
        };
    }
    async calculateOrderPnL(req, id, body) {
        const userId = req.user.id;
        const pnl = await this.ordersService.calculateOrderPnL(userId, id, body.currentPrice);
        return {
            success: true,
            data: pnl,
        };
    }
    async getOrdersForRetry() {
        const orders = await this.ordersService.getOrdersForRetry();
        return {
            success: true,
            data: orders,
        };
    }
    async cleanupExpiredOrders() {
        const result = await this.ordersService.cleanupExpiredOrders();
        return {
            success: true,
            message: `Cleaned up ${result.deletedCount} expired orders`,
            data: result,
        };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_order_dto_1.QueryOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deleteOrder", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderStats", null);
__decorate([
    (0, common_1.Get)('active/list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getActiveOrders", null);
__decorate([
    (0, common_1.Get)('symbol/:symbol'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrdersBySymbol", null);
__decorate([
    (0, common_1.Get)('signal/:signalId'),
    __param(0, (0, common_1.Param)('signalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrdersBySignal", null);
__decorate([
    (0, common_1.Post)('bulk/create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bulk_order_dto_1.BulkCreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "bulkCreateOrders", null);
__decorate([
    (0, common_1.Patch)('bulk/update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bulk_order_dto_1.BulkUpdateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "bulkUpdateOrders", null);
__decorate([
    (0, common_1.Patch)('bulk/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bulk_order_dto_1.BulkCancelOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "bulkCancelOrders", null);
__decorate([
    (0, common_1.Patch)(':id/execution'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateOrderExecution", null);
__decorate([
    (0, common_1.Post)(':id/pnl'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "calculateOrderPnL", null);
__decorate([
    (0, common_1.Get)('admin/retry/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrdersForRetry", null);
__decorate([
    (0, common_1.Post)('admin/cleanup/expired'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cleanupExpiredOrders", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map