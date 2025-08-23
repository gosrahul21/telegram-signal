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
var NotificationExampleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationExampleService = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const notification_gateway_1 = require("./notification.gateway");
let NotificationExampleService = NotificationExampleService_1 = class NotificationExampleService {
    constructor(notificationService, notificationGateway) {
        this.notificationService = notificationService;
        this.notificationGateway = notificationGateway;
        this.logger = new common_1.Logger(NotificationExampleService_1.name);
    }
    async sendRSISignal(userId, symbol, rsiValue, action) {
        const signalData = {
            symbol,
            type: action,
            price: await this.getCurrentPrice(symbol),
            rsi: rsiValue.toFixed(2),
            description: `RSI ${action === 'BUY' ? 'oversold' : 'overbought'} signal triggered`,
            confidence: this.calculateConfidence(rsiValue),
        };
        const telegramResult = await this.notificationService.sendSignalNotification(userId, signalData);
        const websocketResult = this.notificationService.sendWebSocketMessage(userId, {
            type: 'signal',
            data: signalData,
            timestamp: Date.now(),
        });
        this.notificationGateway.broadcastToSymbol(symbol, 'signal', signalData);
        this.logger.log(`RSI signal sent to user ${userId} for ${symbol}: Telegram=${telegramResult}, WebSocket=${websocketResult}`);
        return { telegram: telegramResult, websocket: websocketResult };
    }
    async sendPriceAlert(userId, symbol, currentPrice, targetPrice, condition) {
        const alertData = {
            symbol,
            condition,
            price: currentPrice.toFixed(2),
            message: `Price ${condition} target ${targetPrice}. Current price: ${currentPrice}`,
        };
        const telegramResult = await this.notificationService.sendAlertNotification(userId, alertData);
        const websocketResult = this.notificationService.sendWebSocketMessage(userId, {
            type: 'alert',
            data: alertData,
            timestamp: Date.now(),
        });
        this.logger.log(`Price alert sent to user ${userId} for ${symbol}: Telegram=${telegramResult}, WebSocket=${websocketResult}`);
        return { telegram: telegramResult, websocket: websocketResult };
    }
    async sendMonitoringStatus(userId, symbol, status, details) {
        const statusData = {
            symbol,
            status,
            price: await this.getCurrentPrice(symbol),
            details: JSON.stringify(details),
        };
        const telegramResult = await this.notificationService.sendStatusNotification(userId, statusData);
        const websocketResult = this.notificationService.sendWebSocketMessage(userId, {
            type: 'status',
            data: statusData,
            timestamp: Date.now(),
        });
        this.logger.log(`Status update sent to user ${userId} for ${symbol}: Telegram=${telegramResult}, WebSocket=${websocketResult}`);
        return { telegram: telegramResult, websocket: websocketResult };
    }
    async sendMultiChannelNotification(userId, message, type, data) {
        const payload = {
            userId,
            message,
            type,
            data,
        };
        const result = await this.notificationService.sendMultiChannelNotification(payload);
        this.logger.log(`Multi-channel notification sent to user ${userId}: Telegram=${result.telegram}, WebSocket=${result.websocket}`);
        return result;
    }
    async sendBulkSignalNotification(userIds, signalData) {
        const message = this.formatSignalMessage(signalData);
        const result = await this.notificationService.sendTelegramNotificationToMultiple(userIds, message);
        const websocketResult = this.notificationService.broadcastWebSocketMessage({
            type: 'signal',
            data: signalData,
            timestamp: Date.now(),
        });
        this.logger.log(`Bulk signal sent to ${userIds.length} users: Telegram success=${result.success.length}, failed=${result.failed.length}, WebSocket success=${websocketResult.success.length}, failed=${websocketResult.failed.length}`);
        return { telegram: result, websocket: websocketResult };
    }
    async sendSystemMaintenanceNotification(message, maintenanceTime) {
        const systemMessage = `🔧 SYSTEM MAINTENANCE 🔧\n\n${message}${maintenanceTime ? `\n\n⏰ Scheduled for: ${maintenanceTime}` : ''}`;
        const connectedUserIds = this.notificationService.getConnectedUserIds();
        if (connectedUserIds.length > 0) {
            const websocketResult = this.notificationService.broadcastWebSocketMessage({
                type: 'system',
                data: { message, maintenanceTime },
                timestamp: Date.now(),
            });
            this.logger.log(`System maintenance notification sent to ${connectedUserIds.length} connected users: success=${websocketResult.success.length}, failed=${websocketResult.failed.length}`);
            return websocketResult;
        }
        return { success: [], failed: [] };
    }
    getNotificationStats() {
        return {
            connectedUsers: this.notificationService.getConnectedUsersCount(),
            connectedUserIds: this.notificationService.getConnectedUserIds(),
            websocketConnections: this.notificationGateway.getConnectedUsersCount(),
        };
    }
    async getCurrentPrice(symbol) {
        return '45000.00';
    }
    calculateConfidence(rsiValue) {
        if (rsiValue <= 20 || rsiValue >= 80)
            return '95%';
        if (rsiValue <= 25 || rsiValue >= 75)
            return '85%';
        if (rsiValue <= 30 || rsiValue >= 70)
            return '75%';
        return '60%';
    }
    formatSignalMessage(signalData) {
        return `
🚨 <b>NEW SIGNAL ALERT</b> 🚨

📊 <b>Symbol:</b> ${signalData.symbol || 'N/A'}
📈 <b>Type:</b> ${signalData.type || 'N/A'}
💰 <b>Price:</b> ${signalData.price || 'N/A'}
📊 <b>RSI:</b> ${signalData.rsi || 'N/A'}
⏰ <b>Time:</b> ${new Date().toLocaleString()}

${signalData.description || ''}
    `.trim();
    }
};
exports.NotificationExampleService = NotificationExampleService;
exports.NotificationExampleService = NotificationExampleService = NotificationExampleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        notification_gateway_1.NotificationGateway])
], NotificationExampleService);
//# sourceMappingURL=notification.example.service.js.map