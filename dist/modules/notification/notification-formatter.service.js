"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationFormatterService = void 0;
const common_1 = require("@nestjs/common");
const notification_entity_1 = require("./notification.entity");
let NotificationFormatterService = class NotificationFormatterService {
    formatAlertTriggeredForDatabase(event) {
        const { alert, triggerData } = event;
        return {
            type: notification_entity_1.NotificationType.ALERT_TRIGGERED,
            title: `Alert Triggered: ${alert.symbol}`,
            message: `Alert triggered for ${alert.symbol} - ${alert.eventType}`,
            data: {
                alertId: alert.uuid,
                symbol: alert.symbol,
                timeframe: alert.timeframe,
                eventType: alert.eventType,
                remainingCount: alert.count,
                triggerData,
                timestamp: event.timestamp,
            },
            priority: notification_entity_1.NotificationPriority.HIGH,
            tags: ['alert', 'triggered', alert.symbol, alert.eventType],
            isPersistent: true,
        };
    }
    formatAlertTriggeredForSocket(event) {
        const { alert, triggerData } = event;
        return {
            type: 'alert_triggered',
            data: {
                alertId: alert.uuid,
                symbol: alert.symbol,
                timeframe: alert.timeframe,
                eventType: alert.eventType,
                remainingCount: alert.count,
                triggerData,
                timestamp: event.timestamp,
            },
            message: `Alert triggered for ${alert.symbol} - ${alert.eventType}`,
            timestamp: event.timestamp,
        };
    }
    formatPriceTargetForDatabase(event) {
        return {
            type: notification_entity_1.NotificationType.PRICE_TARGET,
            title: `Price Target: ${event.symbol}`,
            message: `Price target ${event.condition} ${event.targetPrice} reached for ${event.symbol}`,
            data: {
                symbol: event.symbol,
                currentPrice: event.currentPrice,
                targetPrice: event.targetPrice,
                condition: event.condition,
                timestamp: event.timestamp,
            },
            priority: notification_entity_1.NotificationPriority.MEDIUM,
            tags: ['price', 'target', event.symbol, event.condition],
            isPersistent: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
    }
    formatPriceTargetForSocket(event) {
        return {
            type: 'price_target',
            data: {
                symbol: event.symbol,
                currentPrice: event.currentPrice,
                targetPrice: event.targetPrice,
                condition: event.condition,
                timestamp: event.timestamp,
            },
            message: `Price target ${event.condition} ${event.targetPrice} reached for ${event.symbol} (current: ${event.currentPrice})`,
            timestamp: event.timestamp,
        };
    }
    formatTechnicalIndicatorForDatabase(event) {
        return {
            type: notification_entity_1.NotificationType.TECHNICAL_INDICATOR,
            title: `${event.indicator.toUpperCase()}: ${event.symbol}`,
            message: `${event.indicator.toUpperCase()} ${event.condition} for ${event.symbol}: ${event.value}`,
            data: {
                symbol: event.symbol,
                indicator: event.indicator,
                value: event.value,
                condition: event.condition,
                timestamp: event.timestamp,
            },
            priority: notification_entity_1.NotificationPriority.MEDIUM,
            tags: ['technical', 'indicator', event.indicator, event.symbol],
            isPersistent: false,
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        };
    }
    formatTechnicalIndicatorForSocket(event) {
        return {
            type: 'technical_indicator',
            data: {
                symbol: event.symbol,
                indicator: event.indicator,
                value: event.value,
                condition: event.condition,
                timestamp: event.timestamp,
            },
            message: `${event.indicator.toUpperCase()} ${event.condition} for ${event.symbol}: ${event.value}`,
            timestamp: event.timestamp,
        };
    }
    formatOrderStatusForDatabase(event) {
        return {
            type: notification_entity_1.NotificationType.ORDER_STATUS,
            title: `Order Update: ${event.symbol}`,
            message: `Order ${event.orderId} status: ${event.status} for ${event.symbol}`,
            data: {
                orderId: event.orderId,
                symbol: event.symbol,
                status: event.status,
                details: event.details,
                timestamp: event.timestamp,
            },
            priority: notification_entity_1.NotificationPriority.HIGH,
            tags: ['order', 'status', event.symbol, event.status],
            isPersistent: true,
        };
    }
    formatOrderStatusForSocket(event) {
        return {
            type: 'order_status',
            data: {
                orderId: event.orderId,
                symbol: event.symbol,
                status: event.status,
                details: event.details,
                timestamp: event.timestamp,
            },
            message: `Order ${event.orderId} status: ${event.status} for ${event.symbol}`,
            timestamp: event.timestamp,
        };
    }
    formatMarketAlertForDatabase(event) {
        const priority = this.getPriorityFromSeverity(event.severity);
        return {
            type: notification_entity_1.NotificationType.MARKET_ALERT,
            title: `Market Alert: ${event.symbol}`,
            message: event.message,
            data: {
                symbol: event.symbol,
                alertType: event.alertType,
                message: event.message,
                severity: event.severity,
                data: event.data,
                timestamp: event.timestamp,
            },
            priority,
            tags: ['market', 'alert', event.symbol, event.severity],
            isPersistent: true,
        };
    }
    getPriorityFromSeverity(severity) {
        switch (severity.toLowerCase()) {
            case 'critical':
                return notification_entity_1.NotificationPriority.CRITICAL;
            case 'high':
                return notification_entity_1.NotificationPriority.HIGH;
            case 'medium':
                return notification_entity_1.NotificationPriority.MEDIUM;
            case 'low':
                return notification_entity_1.NotificationPriority.LOW;
            default:
                return notification_entity_1.NotificationPriority.MEDIUM;
        }
    }
    getNotificationTypeFromEvent(eventType) {
        const cleanType = eventType.replace('notification.', '');
        switch (cleanType) {
            case 'alert_triggered':
                return notification_entity_1.NotificationType.ALERT_TRIGGERED;
            case 'price_target':
                return notification_entity_1.NotificationType.PRICE_TARGET;
            case 'technical_indicator':
                return notification_entity_1.NotificationType.TECHNICAL_INDICATOR;
            case 'order_status':
                return notification_entity_1.NotificationType.ORDER_STATUS;
            case 'market_alert':
                return notification_entity_1.NotificationType.MARKET_ALERT;
            default:
                return notification_entity_1.NotificationType.GENERAL;
        }
    }
};
exports.NotificationFormatterService = NotificationFormatterService;
exports.NotificationFormatterService = NotificationFormatterService = __decorate([
    (0, common_1.Injectable)()
], NotificationFormatterService);
//# sourceMappingURL=notification-formatter.service.js.map