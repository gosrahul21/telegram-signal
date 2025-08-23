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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const bot_service_1 = require("../../bot/bot.service");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(botService) {
        this.botService = botService;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.connectedUsers = new Map();
        this.bot = this.botService.getBot();
    }
    async sendTelegramNotification(userId, message) {
        try {
            await this.bot.api.sendMessage(userId, message, {
                parse_mode: 'HTML',
                link_preview_options: { is_disabled: true },
            });
            this.logger.log(`Telegram notification sent to user ${userId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send Telegram notification to user ${userId}:`, error);
            return false;
        }
    }
    async sendTelegramNotificationToMultiple(userIds, message) {
        const success = [];
        const failed = [];
        for (const userId of userIds) {
            try {
                await this.bot.api.sendMessage(userId, message, {
                    parse_mode: 'HTML',
                    link_preview_options: { is_disabled: true },
                });
                success.push(userId);
            }
            catch (error) {
                this.logger.error(`Failed to send Telegram notification to user ${userId}:`, error);
                failed.push(userId);
            }
        }
        this.logger.log(`Sent notifications to ${success.length} users, failed for ${failed.length} users`);
        return { success, failed };
    }
    async sendSignalNotification(userId, signalData) {
        const message = this.formatSignalMessage(signalData);
        return this.sendTelegramNotification(userId, message);
    }
    async sendAlertNotification(userId, alertData) {
        const message = this.formatAlertMessage(alertData);
        return this.sendTelegramNotification(userId, message);
    }
    async sendStatusNotification(userId, statusData) {
        const message = this.formatStatusMessage(statusData);
        return this.sendTelegramNotification(userId, message);
    }
    addWebSocketConnection(userId, connection) {
        this.connectedUsers.set(userId, connection);
        this.logger.log(`WebSocket connection added for user ${userId}`);
    }
    removeWebSocketConnection(userId) {
        this.connectedUsers.delete(userId);
        this.logger.log(`WebSocket connection removed for user ${userId}`);
    }
    sendWebSocketMessage(userId, message) {
        const connection = this.connectedUsers.get(userId);
        if (connection) {
            try {
                connection.send(JSON.stringify(message));
                this.logger.log(`WebSocket message sent to user ${userId}`);
                return true;
            }
            catch (error) {
                this.logger.error(`Failed to send WebSocket message to user ${userId}:`, error);
                this.removeWebSocketConnection(userId);
                return false;
            }
        }
        return false;
    }
    broadcastWebSocketMessage(message) {
        const success = [];
        const failed = [];
        for (const [userId, connection] of this.connectedUsers.entries()) {
            try {
                connection.send(JSON.stringify(message));
                success.push(userId);
            }
            catch (error) {
                this.logger.error(`Failed to send WebSocket message to user ${userId}:`, error);
                failed.push(userId);
                this.removeWebSocketConnection(userId);
            }
        }
        this.logger.log(`Broadcasted WebSocket message to ${success.length} users, failed for ${failed.length} users`);
        return { success, failed };
    }
    async sendMultiChannelNotification(payload) {
        const [telegramResult, websocketResult] = await Promise.allSettled([
            this.sendTelegramNotification(payload.userId, payload.message),
            this.sendWebSocketMessage(payload.userId, {
                type: payload.type || 'general',
                data: payload.data || payload.message,
                timestamp: Date.now(),
            })
        ]);
        return {
            telegram: telegramResult.status === 'fulfilled' ? telegramResult.value : false,
            websocket: websocketResult.status === 'fulfilled' ? websocketResult.value : false,
        };
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    getConnectedUserIds() {
        return Array.from(this.connectedUsers.keys());
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
    formatAlertMessage(alertData) {
        return `
⚠️ <b>ALERT</b> ⚠️

📊 <b>Symbol:</b> ${alertData.symbol || 'N/A'}
🔔 <b>Condition:</b> ${alertData.condition || 'N/A'}
💰 <b>Current Price:</b> ${alertData.price || 'N/A'}
⏰ <b>Time:</b> ${new Date().toLocaleString()}

${alertData.message || ''}
    `.trim();
    }
    formatStatusMessage(statusData) {
        return `
📊 <b>STATUS UPDATE</b> 📊

📈 <b>Symbol:</b> ${statusData.symbol || 'N/A'}
📊 <b>Status:</b> ${statusData.status || 'N/A'}
💰 <b>Price:</b> ${statusData.price || 'N/A'}
⏰ <b>Time:</b> ${new Date().toLocaleString()}

${statusData.details || ''}
    `.trim();
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bot_service_1.BotService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map