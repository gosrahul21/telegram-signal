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
var BotNotificationListenerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotNotificationListenerService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const eventsType_1 = require("../../utils/constants/eventsType");
const bot_service_1 = require("./bot.service");
const user_service_1 = require("../user/user.service");
const alert_1 = require("../alert");
const notification_entity_1 = require("../notification/notification.entity");
let BotNotificationListenerService = BotNotificationListenerService_1 = class BotNotificationListenerService {
    constructor(botService, userService) {
        this.botService = botService;
        this.userService = userService;
        this.logger = new common_1.Logger(BotNotificationListenerService_1.name);
    }
    async handleNotificationCreated(payload) {
        const userId = payload.userId.toString();
        this.logger.log(`Bot received notification for user ${userId}`);
        try {
            const user = await this.userService.findById(userId);
            if (!user || !user.telegramId) {
                this.logger.warn(`User ${userId} not found or no telegramId`);
                return;
            }
            const message = this.formatNotificationMessage(payload);
            await this.botService.sendMessage(user.telegramId.toString(), message);
            this.logger.log(`Telegram notification sent to user ${userId} (telegramId: ${user.telegramId})`);
        }
        catch (error) {
            this.logger.error(`Failed to send Telegram notification to user ${userId}:`, error);
        }
    }
    formatNotificationMessage(payload) {
        const { title, message, type, priority, symbol, data } = payload;
        switch (type) {
            case notification_entity_1.NotificationType.ALERT_TRIGGERED:
                return this.formatAlertMessage(payload);
            case notification_entity_1.NotificationType.ORDER_STATUS:
                return this.formatOrderUpdateMessage(payload);
            case notification_entity_1.NotificationType.PRICE_TARGET:
                return this.formatPriceTargetMessage(payload);
            case notification_entity_1.NotificationType.TECHNICAL_INDICATOR:
                return this.formatTechnicalIndicatorMessage(payload);
            case notification_entity_1.NotificationType.MARKET_ALERT:
                return this.formatMarketAlertMessage(payload);
            default:
                return this.formatGeneralNotificationMessage(payload);
        }
    }
    formatGeneralNotificationMessage(payload) {
        const { title, message, type, priority, symbol, data } = payload;
        let emoji = '📢';
        if (priority === 'high')
            emoji = '🚨';
        else if (priority === 'medium')
            emoji = '⚠️';
        else if (priority === 'low')
            emoji = 'ℹ️';
        let formattedMessage = `${emoji} <b>${title}</b>\n\n`;
        formattedMessage += `${message}\n\n`;
        if (symbol) {
            formattedMessage += `📊 <b>Symbol:</b> ${symbol}\n`;
        }
        if (data && data.price) {
            formattedMessage += `💰 <b>Price:</b> $${data.price}\n`;
        }
        if (data && data.rsi) {
            formattedMessage += `📈 <b>RSI:</b> ${data.rsi}\n`;
        }
        formattedMessage += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
        return formattedMessage;
    }
    formatAlertMessage(payload) {
        const { symbol, eventType, timeframe, alertId, data } = payload;
        const alertData = data;
        const { monitoring, triggerData } = alertData;
        let emoji = '🚨';
        let signal = 'ALERT';
        if ([
            alert_1.MonitorEventType.BOLLINGER_BANDS_HIGH,
            alert_1.MonitorEventType.RSI_CROSSOVER_HIGH,
            alert_1.MonitorEventType.MACD_CROSSOVER_HIGH,
        ].includes(eventType)) {
            emoji = '🔴';
            signal = 'SELL SIGNAL';
        }
        else if ([
            alert_1.MonitorEventType.BOLLINGER_BANDS_LOW,
            alert_1.MonitorEventType.RSI_LOW,
            alert_1.MonitorEventType.MACD_CROSSOVER_LOW,
        ].includes(eventType)) {
            emoji = '🟢';
            signal = 'BUY SIGNAL';
        }
        else if (eventType.includes('BREAKOUT')) {
            emoji = '🚀';
            signal = 'BREAKOUT';
        }
        else if (eventType.includes('REVERSAL')) {
            emoji = '🔄';
            signal = 'REVERSAL';
        }
        let message = `${emoji} <b>${signal} - ${symbol}</b>\n\n`;
        message += `🎯 <b>Alert Type:</b> ${eventType}\n`;
        message += `⏱️ <b>Timeframe:</b> ${timeframe || 'N/A'}\n`;
        if (alertId) {
            message += `🆔 <b>Alert ID:</b> ${alertId}\n`;
        }
        message += `\n`;
        if (triggerData.currentPrice) {
            message += `💰 <b>Current Price:</b> $${triggerData.currentPrice}\n`;
        }
        if (triggerData.rsiData?.rsi) {
            message += `📈 <b>RSI:</b> ${triggerData.rsiData.rsi.toFixed(2)}\n`;
        }
        if (triggerData.bbData) {
            message += `📊 <b>Bollinger Bands:</b>\n`;
            message += `   • Upper: $${triggerData.bbData.upperBand.toFixed(2)}\n`;
            message += `   • Middle: $${triggerData.bbData.middleBand.toFixed(2)}\n`;
            message += `   • Lower: $${triggerData.bbData.lowerBand.toFixed(2)}\n`;
        }
        if (triggerData.emaData) {
            message += `📈 <b>EMA Crossover:</b>\n`;
            message += `   • Fast EMA: $${triggerData.emaData.fastEMA.toFixed(2)}\n`;
            message += `   • Slow EMA: $${triggerData.emaData.slowEMA.toFixed(2)}\n`;
            if (triggerData.emaData.crossover) {
                message += `   • Crossover: ${triggerData.emaData.crossover}\n`;
            }
        }
        if (triggerData.macdData) {
            message += `📊 <b>MACD:</b>\n`;
            message += `   • MACD: ${triggerData.macdData.macd.toFixed(4)}\n`;
            message += `   • Signal: ${triggerData.macdData.signal.toFixed(4)}\n`;
            message += `   • Histogram: ${triggerData.macdData.histogram.toFixed(4)}\n`;
        }
        message += `\n⏰ <b>Time:</b> ${new Date().toLocaleString()}\n\n`;
        message += `⚠️ <i>This is an automated alert. Please do your own research before trading.</i>`;
        return message;
    }
    formatOrderUpdateMessage(payload) {
        const { symbol, alertId, data } = payload;
        const orderData = data;
        const { orderId } = orderData;
        let emoji = '📋';
        let status = 'updated';
        let side = 'unknown';
        let quantity = 'N/A';
        let price = 'N/A';
        if (data && typeof data === 'object') {
            status = data.status || status;
            side = data.side || side;
            quantity = data.quantity || quantity;
            price = data.price || price;
        }
        if (status === 'filled')
            emoji = '✅';
        else if (status === 'cancelled')
            emoji = '❌';
        else if (status === 'pending')
            emoji = '⏳';
        else if (status === 'partially_filled')
            emoji = '🔄';
        let message = `${emoji} <b>Order Update - ${symbol}</b>\n\n`;
        if (orderId) {
            message += `🆔 <b>Order ID:</b> ${orderId}\n`;
        }
        if (alertId) {
            message += `🔔 <b>Alert ID:</b> ${alertId}\n`;
        }
        message += `📊 <b>Status:</b> ${status.toUpperCase()}\n`;
        message += `📈 <b>Side:</b> ${side.toUpperCase()}\n`;
        message += `📦 <b>Quantity:</b> ${quantity}\n`;
        message += `💰 <b>Price:</b> $${price}\n`;
        message += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
        return message;
    }
    formatOrderAlertMessage(payload) {
        const { symbol, eventType, timeframe, alertId } = payload;
        let emoji = '📋';
        let alertType = 'ORDER ALERT';
        if (eventType.includes('FILLED')) {
            emoji = '✅';
            alertType = 'ORDER FILLED';
        }
        else if (eventType.includes('CANCELLED')) {
            emoji = '❌';
            alertType = 'ORDER CANCELLED';
        }
        else if (eventType.includes('PARTIAL')) {
            emoji = '🔄';
            alertType = 'PARTIAL FILL';
        }
        let message = `${emoji} <b>${alertType} - ${symbol}</b>\n\n`;
        message += `🎯 <b>Event:</b> ${eventType}\n`;
        message += `⏱️ <b>Timeframe:</b> ${timeframe || 'N/A'}\n`;
        if (alertId) {
            message += `🆔 <b>Alert ID:</b> ${alertId}\n`;
        }
        message += `\n`;
        if (payload.price) {
            message += `💰 <b>Price:</b> $${payload.price}\n`;
        }
        if (payload.quantity) {
            message += `📦 <b>Quantity:</b> ${payload.quantity}\n`;
        }
        message += `\n⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
        return message;
    }
    formatPriceTargetMessage(payload) {
        const { symbol, data } = payload;
        let emoji = '🎯';
        if (data && data.direction === 'above')
            emoji = '📈';
        else if (data && data.direction === 'below')
            emoji = '📉';
        let message = `${emoji} <b>Price Target - ${symbol}</b>\n\n`;
        message += `🎯 <b>Target:</b> $${data?.targetPrice || 'N/A'}\n`;
        message += `📊 <b>Current:</b> $${data?.currentPrice || 'N/A'}\n`;
        message += `📈 <b>Direction:</b> ${data?.direction?.toUpperCase() || 'N/A'}\n`;
        message += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
        return message;
    }
    formatTechnicalIndicatorMessage(payload) {
        const { symbol, data } = payload;
        let emoji = '📊';
        if (data && data.signal === 'BUY')
            emoji = '🟢';
        else if (data && data.signal === 'SELL')
            emoji = '🔴';
        let message = `${emoji} <b>Technical Signal - ${symbol}</b>\n\n`;
        message += `📊 <b>Indicator:</b> ${data?.indicator || 'N/A'}\n`;
        message += `🎯 <b>Signal:</b> ${data?.signal || 'N/A'}\n`;
        message += `💰 <b>Price:</b> $${data?.price || 'N/A'}\n`;
        if (data?.value) {
            message += `📈 <b>Value:</b> ${data.value}\n`;
        }
        message += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
        return message;
    }
    formatMarketAlertMessage(payload) {
        const { title, message: alertMessage, data } = payload;
        let emoji = '🌍';
        if (data && data.severity === 'high')
            emoji = '🚨';
        else if (data && data.severity === 'medium')
            emoji = '⚠️';
        let formattedMessage = `${emoji} <b>Market Alert</b>\n\n`;
        formattedMessage += `<b>${title}</b>\n\n`;
        formattedMessage += `${alertMessage}\n\n`;
        if (data && data.affectedSymbols) {
            formattedMessage += `📊 <b>Affected:</b> ${data.affectedSymbols.join(', ')}\n`;
        }
        formattedMessage += `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
        return formattedMessage;
    }
    async sendCustomMessage(userId, message) {
        try {
            const user = await this.userService.findById(userId);
            if (!user || !user.telegramId) {
                this.logger.warn(`User ${userId} not found or no telegramId`);
                return false;
            }
            await this.botService.sendMessage(user.telegramId.toString(), message);
            this.logger.log(`Custom Telegram message sent to user ${userId} (telegramId: ${user.telegramId})`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send custom Telegram message to user ${userId}:`, error);
            return false;
        }
    }
    async sendBulkMessages(userIds, message) {
        let sent = 0;
        let failed = 0;
        const errors = [];
        for (const userId of userIds) {
            try {
                const success = await this.sendCustomMessage(userId, message);
                if (success) {
                    sent++;
                }
                else {
                    failed++;
                    errors.push(`Failed to send to user ${userId}`);
                }
            }
            catch (error) {
                failed++;
                errors.push(`Error sending to user ${userId}: ${error.message}`);
            }
        }
        this.logger.log(`Bulk Telegram messages: ${sent} sent, ${failed} failed`);
        return { sent, failed, errors };
    }
};
exports.BotNotificationListenerService = BotNotificationListenerService;
__decorate([
    (0, event_emitter_1.OnEvent)(eventsType_1.EventsType.NOTIFICATION_CREATED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotNotificationListenerService.prototype, "handleNotificationCreated", null);
exports.BotNotificationListenerService = BotNotificationListenerService = BotNotificationListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bot_service_1.BotService,
        user_service_1.UserService])
], BotNotificationListenerService);
//# sourceMappingURL=bot-consumer.service.js.map