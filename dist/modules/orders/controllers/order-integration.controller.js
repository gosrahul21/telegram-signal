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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderIntegrationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const order_lifecycle_service_1 = require("../services/order-lifecycle.service");
const order_synchronization_service_1 = require("../services/order-synchronization.service");
const order_performance_service_1 = require("../services/order-performance.service");
const position_management_service_1 = require("../services/position-management.service");
const trade_engine_service_1 = require("../../trade-engine/services/trade-engine.service");
let OrderIntegrationController = class OrderIntegrationController {
    constructor(orderLifecycleService, orderSynchronizationService, orderPerformanceService, positionManagementService, tradeEngineService) {
        this.orderLifecycleService = orderLifecycleService;
        this.orderSynchronizationService = orderSynchronizationService;
        this.orderPerformanceService = orderPerformanceService;
        this.positionManagementService = positionManagementService;
        this.tradeEngineService = tradeEngineService;
    }
    async getSystemHealth() {
        const syncHealth = this.orderSynchronizationService.getSyncHealth();
        const performanceMetrics = this.orderPerformanceService.getPerformanceMetrics();
        const tradeEngineStatus = this.tradeEngineService.getConnectionStatus();
        const performanceHealthScore = this.orderPerformanceService.getPerformanceHealthScore();
        return {
            success: true,
            data: {
                synchronization: syncHealth,
                performance: performanceMetrics,
                tradeEngine: tradeEngineStatus,
                healthScore: performanceHealthScore,
                timestamp: new Date(),
            },
        };
    }
    async getOrderExecutionStatus(orderId) {
        const executionStatus = this.orderLifecycleService.getOrderExecutionStatus(orderId);
        const syncStatus = this.orderSynchronizationService.getOrderSyncStatus(orderId);
        return {
            success: true,
            data: {
                execution: executionStatus,
                synchronization: syncStatus,
                timestamp: new Date(),
            },
        };
    }
    async forceSyncOrder(orderId) {
        try {
            await this.orderSynchronizationService.forceSyncOrder(orderId);
            return {
                success: true,
                message: `Order ${orderId} synchronization initiated`,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Error forcing sync for order ${orderId}: ${error.message}`,
                timestamp: new Date(),
            };
        }
    }
    async getPerformanceMetrics() {
        const metrics = this.orderPerformanceService.getPerformanceMetrics();
        const errorBreakdown = this.orderPerformanceService.getErrorBreakdown();
        const counterBreakdown = this.orderPerformanceService.getCounterBreakdown();
        const recommendations = this.orderPerformanceService.getPerformanceRecommendations();
        return {
            success: true,
            data: {
                metrics,
                errorBreakdown: Object.fromEntries(errorBreakdown),
                counterBreakdown: Object.fromEntries(counterBreakdown),
                recommendations,
                timestamp: new Date(),
            },
        };
    }
    async getAllSyncStates() {
        const syncStates = this.orderSynchronizationService.getAllSyncStates();
        return {
            success: true,
            data: {
                syncStates,
                count: syncStates.length,
                timestamp: new Date(),
            },
        };
    }
    async cleanupCompletedOrders() {
        try {
            await this.orderLifecycleService.cleanupCompletedOrders();
            await this.orderSynchronizationService.cleanupCompletedOrders();
            return {
                success: true,
                message: 'Completed orders cleaned up successfully',
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Error cleaning up orders: ${error.message}`,
                timestamp: new Date(),
            };
        }
    }
    async resetPerformanceMetrics() {
        try {
            this.orderPerformanceService.resetMetrics();
            return {
                success: true,
                message: 'Performance metrics reset successfully',
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Error resetting performance metrics: ${error.message}`,
                timestamp: new Date(),
            };
        }
    }
    async getSystemDiagnostics() {
        const syncHealth = this.orderSynchronizationService.getSyncHealth();
        const performanceMetrics = this.orderPerformanceService.getPerformanceMetrics();
        const tradeEngineStatus = this.tradeEngineService.getConnectionStatus();
        const performanceHealthScore = this.orderPerformanceService.getPerformanceHealthScore();
        const recommendations = this.orderPerformanceService.getPerformanceRecommendations();
        const overallHealth = this.calculateOverallHealth(syncHealth, performanceMetrics, tradeEngineStatus, performanceHealthScore);
        return {
            success: true,
            data: {
                overallHealth,
                synchronization: {
                    ...syncHealth,
                    status: syncHealth.errorRate < 5 ? 'HEALTHY' : 'DEGRADED',
                },
                performance: {
                    ...performanceMetrics,
                    healthScore: performanceHealthScore,
                    status: performanceHealthScore > 80
                        ? 'HEALTHY'
                        : performanceHealthScore > 60
                            ? 'DEGRADED'
                            : 'CRITICAL',
                },
                tradeEngine: {
                    ...tradeEngineStatus,
                    status: tradeEngineStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED',
                },
                recommendations,
                timestamp: new Date(),
            },
        };
    }
    async updatePerformanceThresholds(thresholds) {
        try {
            return {
                success: true,
                message: 'Performance thresholds updated successfully',
                data: thresholds,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Error updating performance thresholds: ${error.message}`,
                timestamp: new Date(),
            };
        }
    }
    async getOrderFlowStats(timeRange = '1h') {
        const performanceMetrics = this.orderPerformanceService.getPerformanceMetrics();
        const counterBreakdown = this.orderPerformanceService.getCounterBreakdown();
        const flowStats = {
            totalOrders: performanceMetrics.totalOrders,
            ordersPerSecond: performanceMetrics.ordersPerSecond,
            successRate: 100 - performanceMetrics.errorRate,
            averageExecutionTime: performanceMetrics.averageExecutionTime,
            breakdown: {
                created: counterBreakdown.get('orders_created') || 0,
                executed: counterBreakdown.get('orders_executed') || 0,
                failed: counterBreakdown.get('orders_failed') || 0,
                cancelled: counterBreakdown.get('orders_cancelled') || 0,
                retries: counterBreakdown.get('order_retries') || 0,
            },
            positions: {
                updated: counterBreakdown.get('positions_updated') || 0,
            },
            priceUpdates: counterBreakdown.get('price_updates') || 0,
        };
        return {
            success: true,
            data: {
                timeRange,
                flowStats,
                timestamp: new Date(),
            },
        };
    }
    calculateOverallHealth(syncHealth, performanceMetrics, tradeEngineStatus, performanceHealthScore) {
        let healthScore = 100;
        if (syncHealth.errorRate > 0) {
            healthScore -= syncHealth.errorRate * 2;
        }
        healthScore = Math.min(healthScore, performanceHealthScore);
        if (!tradeEngineStatus.isConnected) {
            healthScore -= 20;
        }
        if (healthScore >= 90)
            return 'EXCELLENT';
        if (healthScore >= 80)
            return 'GOOD';
        if (healthScore >= 60)
            return 'FAIR';
        if (healthScore >= 40)
            return 'POOR';
        return 'CRITICAL';
    }
};
exports.OrderIntegrationController = OrderIntegrationController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('execution-status/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "getOrderExecutionStatus", null);
__decorate([
    (0, common_1.Post)('force-sync/:orderId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "forceSyncOrder", null);
__decorate([
    (0, common_1.Get)('performance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('sync-states'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "getAllSyncStates", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "cleanupCompletedOrders", null);
__decorate([
    (0, common_1.Post)('reset-performance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "resetPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('diagnostics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "getSystemDiagnostics", null);
__decorate([
    (0, common_1.Put)('performance-thresholds'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "updatePerformanceThresholds", null);
__decorate([
    (0, common_1.Get)('flow-stats'),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderIntegrationController.prototype, "getOrderFlowStats", null);
exports.OrderIntegrationController = OrderIntegrationController = __decorate([
    (0, common_1.Controller)('order-integration'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof order_lifecycle_service_1.OrderLifecycleService !== "undefined" && order_lifecycle_service_1.OrderLifecycleService) === "function" ? _a : Object, typeof (_b = typeof order_synchronization_service_1.OrderSynchronizationService !== "undefined" && order_synchronization_service_1.OrderSynchronizationService) === "function" ? _b : Object, typeof (_c = typeof order_performance_service_1.OrderPerformanceService !== "undefined" && order_performance_service_1.OrderPerformanceService) === "function" ? _c : Object, typeof (_d = typeof position_management_service_1.PositionManagementService !== "undefined" && position_management_service_1.PositionManagementService) === "function" ? _d : Object, trade_engine_service_1.TradeEngineService])
], OrderIntegrationController);
//# sourceMappingURL=order-integration.controller.js.map