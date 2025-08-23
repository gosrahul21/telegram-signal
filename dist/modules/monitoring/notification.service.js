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
exports.NotificationService = exports.NOTIFICATION_EVENTS = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
exports.NOTIFICATION_EVENTS = {
    ALERT_TRIGGERED: 'notification.alert_triggered',
    PRICE_TARGET: 'notification.price_target',
    TECHNICAL_INDICATOR: 'notification.technical_indicator',
    ORDER_STATUS: 'notification.order_status',
    MARKET_ALERT: 'notification.market_alert',
};
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async emitAlertTriggered(alert, triggerData) {
        try {
            const event = {
                alert,
                triggerData,
                timestamp: new Date(),
                notificationType: 'alert_triggered',
            };
            this.eventEmitter.emit(exports.NOTIFICATION_EVENTS.ALERT_TRIGGERED, event);
            this.logger.log(`Alert triggered notification emitted for ${alert.symbol} - ${alert.type}`);
            this.emitTechnicalIndicatorNotification(alert.symbol, alert.type, triggerData, 'triggered');
        }
        catch (error) {
            this.logger.error(`Error emitting alert triggered notification:`, error);
        }
    }
    async emitPriceTargetNotification(symbol, currentPrice, targetPrice, condition) {
        try {
            const event = {
                symbol,
                currentPrice,
                targetPrice,
                condition,
                timestamp: new Date(),
                notificationType: 'price_target',
            };
            this.eventEmitter.emit(exports.NOTIFICATION_EVENTS.PRICE_TARGET, event);
            this.logger.log(`Price target notification emitted for ${symbol}: ${condition} ${targetPrice} (current: ${currentPrice})`);
        }
        catch (error) {
            this.logger.error(`Error emitting price target notification:`, error);
        }
    }
    async emitTechnicalIndicatorNotification(symbol, indicator, data, condition) {
        try {
            let value;
            switch (indicator) {
                case 'rsi':
                    value = data.rsiData?.rsi || data.rsi || 0;
                    break;
                case 'ema_crossover':
                    value = data.emaData?.fastEMA || 0;
                    break;
                case 'macd':
                    value = data.macdData?.macd || 0;
                    break;
                case 'bollinger_bands':
                    value = data.bbData?.upperBand || data.currentPrice || 0;
                    break;
                default:
                    value = data.currentPrice || 0;
            }
            const event = {
                symbol,
                indicator,
                value,
                condition,
                timestamp: new Date(),
                notificationType: 'technical_indicator',
            };
            this.eventEmitter.emit(exports.NOTIFICATION_EVENTS.TECHNICAL_INDICATOR, event);
            this.logger.log(`Technical indicator notification emitted for ${symbol} - ${indicator}: ${condition}`);
        }
        catch (error) {
            this.logger.error(`Error emitting technical indicator notification:`, error);
        }
    }
    async emitOrderStatusNotification(orderId, symbol, status, details) {
        try {
            const event = {
                orderId,
                symbol,
                status,
                details,
                timestamp: new Date(),
                notificationType: 'order_status',
            };
            this.eventEmitter.emit(exports.NOTIFICATION_EVENTS.ORDER_STATUS, event);
            this.logger.log(`Order status notification emitted for ${symbol} - ${status}`);
        }
        catch (error) {
            this.logger.error(`Error emitting order status notification:`, error);
        }
    }
    async emitMarketAlertNotification(symbol, alertType, message, severity, data) {
        try {
            const event = {
                symbol,
                alertType,
                message,
                severity,
                data,
                timestamp: new Date(),
                notificationType: 'market_alert',
            };
            this.eventEmitter.emit(exports.NOTIFICATION_EVENTS.MARKET_ALERT, event);
            this.logger.log(`Market alert notification emitted for ${symbol} - ${alertType} (${severity}): ${message}`);
        }
        catch (error) {
            this.logger.error(`Error emitting market alert notification:`, error);
        }
    }
    async emitCustomNotification(eventName, data) {
        try {
            const event = {
                ...data,
                timestamp: new Date(),
            };
            this.eventEmitter.emit(eventName, event);
            this.logger.log(`Custom notification emitted: ${eventName}`);
        }
        catch (error) {
            this.logger.error(`Error emitting custom notification:`, error);
        }
    }
    async emitBatchNotifications(notifications) {
        try {
            for (const notification of notifications) {
                switch (notification.type) {
                    case 'alert_triggered':
                        await this.emitAlertTriggered(notification.data.alert, notification.data.triggerData);
                        break;
                    case 'price_target':
                        await this.emitPriceTargetNotification(notification.data.symbol, notification.data.currentPrice, notification.data.targetPrice, notification.data.condition);
                        break;
                    case 'technical_indicator':
                        await this.emitTechnicalIndicatorNotification(notification.data.symbol, notification.data.indicator, notification.data.data, notification.data.condition);
                        break;
                    case 'order_status':
                        await this.emitOrderStatusNotification(notification.data.orderId, notification.data.symbol, notification.data.status, notification.data.details);
                        break;
                    case 'market_alert':
                        await this.emitMarketAlertNotification(notification.data.symbol, notification.data.alertType, notification.data.message, notification.data.severity, notification.data.data);
                        break;
                    default:
                        await this.emitCustomNotification(notification.type, notification.data);
                }
            }
            this.logger.log(`Batch notifications emitted: ${notifications.length} notifications`);
        }
        catch (error) {
            this.logger.error(`Error emitting batch notifications:`, error);
        }
    }
    getNotificationStats() {
        return {
            totalNotifications: 0,
            notificationTypes: {},
            lastNotification: null,
        };
    }
    clearNotificationHistory() {
        this.logger.log('Notification history cleared');
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], NotificationService);
//# sourceMappingURL=notification.service.js.map