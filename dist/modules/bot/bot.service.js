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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const grammy_1 = require("grammy");
const registration_token_service_1 = require("../auth/registration-token.service");
const user_service_1 = require("../user/user.service");
const alert_1 = require("../alert");
const monitoring_service_1 = require("../monitoring/services/monitoring.service");
const price_monitoring_service_1 = require("../monitoring/price-monitoring.service");
let BotService = class BotService {
    constructor(registrationTokenService, alertService, monitoringService, priceMonitoringService, userService) {
        this.registrationTokenService = registrationTokenService;
        this.alertService = alertService;
        this.monitoringService = monitoringService;
        this.priceMonitoringService = priceMonitoringService;
        this.userService = userService;
        this.bot = new grammy_1.Bot(process.env.BOT_TOKEN || '');
        this.setupCommands();
    }
    onModuleInit() {
        this.bot.start();
        console.log('TelegramBot started successfully!');
    }
    getBot() {
        if (!this.bot)
            throw new common_1.NotFoundException('Bot not found or not initialzed');
        return this.bot;
    }
    setupCommands() {
        this.bot.command('start', async (ctx) => {
            await this.handleStartCommand(ctx);
        });
        this.bot.command('help', async (ctx) => {
            await ctx.reply('Welcome to the Crypto Signals Bot! 🚀\n\n' +
                'Available commands:\n' +
                '/start - Start the bot and get registration link\n' +
                '/help - Show this help message\n' +
                '/subscribe - Subscribe to crypto signals\n' +
                '/unsubscribe - Unsubscribe from signals');
        });
        this.bot.command('subscribe', async (ctx) => {
            await this.handleSubscribeCommand(ctx);
        });
        this.bot.command('unsubscribe', async (ctx) => {
            await this.handleUnsubscribeCommand(ctx);
        });
        this.bot.command('status', async (ctx) => {
            await this.handleStatusCommand(ctx);
        });
    }
    async handleStatusCommand(ctx) {
        try {
            const telegramId = ctx.from.id;
            const user = await this.userService.findByTelegramId(telegramId);
            if (!user) {
                await ctx.reply('You need to register first! Use /start to begin registration.');
                return;
            }
            const userAlerts = await this.alertService.findByUserId(user._id.toString());
            const activeAlerts = userAlerts.filter(alert => alert.isActive);
            const monitoringStatus = await this.monitoringService.getMonitoringStatus();
            const allMonitorings = await this.monitoringService.getAllMonitorings();
            const symbols = [...new Set(activeAlerts.map(alert => alert.symbol))];
            const priceData = {};
            for (const symbol of symbols.slice(0, 5)) {
                try {
                    priceData[symbol] = await this.priceMonitoringService.getCurrentPrice(symbol);
                }
                catch (error) {
                    priceData[symbol] = 'N/A';
                }
            }
            let statusMessage = `📊 <b>Your Trading Status</b>\n\n`;
            statusMessage += `👤 <b>User:</b> ${user.username}\n`;
            statusMessage += `🔗 <b>Telegram:</b> Linked\n\n`;
            statusMessage += `🚨 <b>Active Alerts:</b> ${activeAlerts.length}\n`;
            statusMessage += `📈 <b>Total Alerts:</b> ${userAlerts.length}\n`;
            statusMessage += `⚙️ <b>Monitoring Status:</b> ${monitoringStatus.status}\n`;
            statusMessage += `🔄 <b>Active Monitors:</b> ${monitoringStatus.active}\n\n`;
            if (activeAlerts.length > 0) {
                statusMessage += `📋 <b>Your Active Alerts:</b>\n`;
                activeAlerts.slice(0, 5).forEach((alert, index) => {
                    statusMessage += `${index + 1}. ${alert.symbol} - ${alert.eventType} (${alert.timeframe})\n`;
                });
                if (activeAlerts.length > 5) {
                    statusMessage += `... and ${activeAlerts.length - 5} more\n`;
                }
                statusMessage += '\n';
            }
            if (symbols.length > 0) {
                statusMessage += `💰 <b>Current Prices:</b>\n`;
                symbols.slice(0, 5).forEach(symbol => {
                    const price = priceData[symbol];
                    statusMessage += `• ${symbol}: ${typeof price === 'number' ? `$${price.toFixed(2)}` : price}\n`;
                });
                if (symbols.length > 5) {
                    statusMessage += `... and ${symbols.length - 5} more symbols\n`;
                }
            }
            statusMessage += `\n⏰ <b>Last Updated:</b> ${new Date().toLocaleString()}\n`;
            statusMessage += `\n💡 Use /help to see available commands`;
            await ctx.reply(statusMessage);
        }
        catch (error) {
            console.error('Error in status command:', error);
            await ctx.reply('Sorry, there was an error getting your status. Please try again later.');
        }
    }
    async handleStartCommand(ctx) {
        try {
            const telegramId = ctx.from.id;
            const username = ctx.from.username || `user_${telegramId}`;
            const chatId = ctx.chat.id;
            const existingUser = await this.userService.findByTelegramId(telegramId);
            if (existingUser) {
                await ctx.reply(`Welcome back, ${existingUser.username}! 👋\n\n` +
                    'You are already registered and can use:\n' +
                    '/subscribe - Subscribe to crypto signals\n' +
                    '/unsubscribe - Unsubscribe from signals');
                return;
            }
            const registrationToken = this.registrationTokenService.generateRegistrationToken(telegramId, chatId);
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const registrationUrl = `${baseUrl}/link-telegram?token=${registrationToken}`;
            await ctx.reply(`Welcome to Crypto Signals Bot! 🚀\n\n` +
                `To complete your registration, please visit this link:\n\n` +
                `${registrationUrl}\n\n` +
                `⚠️ This link expires in 1 hour.\n` +
                `🔐 You'll need to create account with username and password.\n\n` +
                `After registration, you can:\n` +
                `• Subscribe to crypto signals\n` +
                `• Get real-time alerts\n` +
                `• Manage your preferences`);
        }
        catch (error) {
            console.error('Error in start command:', error);
            await ctx.reply('Sorry, there was an error processing your request. Please try again later.');
        }
    }
    async handleSubscribeCommand(ctx) {
        try {
            const telegramId = ctx.from.id;
            const user = await this.userService.findByTelegramId(telegramId);
            if (!user) {
                await ctx.reply('You need to register first! Use /start to begin registration.');
                return;
            }
            await ctx.reply('Subscription feature coming soon! 🚧\n\n' +
                'You can subscribe to:\n' +
                '• 1-hour signals\n' +
                '• 4-hour signals\n' +
                '• Daily signals\n\n' +
                'Stay tuned for updates!');
        }
        catch (error) {
            console.error('Error in subscribe command:', error);
            await ctx.reply('Sorry, there was an error. Please try again later.');
        }
    }
    async handleUnsubscribeCommand(ctx) {
        try {
            const telegramId = ctx.from.id;
            const user = await this.userService.findByTelegramId(telegramId);
            if (!user) {
                await ctx.reply('You need to register first! Use /start to begin registration.');
                return;
            }
            await ctx.reply('Unsubscribe feature coming soon! 🚧\n\n' +
                "You'll be able to manage your subscriptions easily.");
        }
        catch (error) {
            console.error('Error in unsubscribe command:', error);
            await ctx.reply('Sorry, there was an error. Please try again later.');
        }
    }
    async start() {
        await this.bot.start();
        console.log('Bot started successfully!');
    }
    async stop() {
        await this.bot.stop();
        console.log('Bot stopped successfully!');
    }
    async sendMessage(chatId, message, options) {
        try {
            await this.bot.api.sendMessage(chatId, message, {
                parse_mode: options?.parse_mode || 'HTML',
                disable_notification: options?.disable_notification || false,
            });
            return true;
        }
        catch (error) {
            console.error(`Failed to send message to chat ${chatId}:`, error);
            return false;
        }
    }
    async sendBulkMessage(chatIds, message, options) {
        let sent = 0;
        let failed = 0;
        const errors = [];
        for (const chatId of chatIds) {
            try {
                const success = await this.sendMessage(chatId, message, options);
                if (success) {
                    sent++;
                }
                else {
                    failed++;
                    errors.push(`Failed to send to chat ${chatId}`);
                }
            }
            catch (error) {
                failed++;
                errors.push(`Error sending to chat ${chatId}: ${error.message}`);
            }
        }
        return { sent, failed, errors };
    }
    async sendSignalMessage(chatId, signalData) {
        const { symbol, type, price, rsi, timeframe, message } = signalData;
        let emoji = '📊';
        if (type.toLowerCase().includes('buy'))
            emoji = '🟢';
        else if (type.toLowerCase().includes('sell'))
            emoji = '🔴';
        let formattedMessage = `${emoji} <b>Signal Alert - ${symbol}</b>\n\n`;
        formattedMessage += `🎯 <b>Type:</b> ${type}\n`;
        if (timeframe) {
            formattedMessage += `⏱️ <b>Timeframe:</b> ${timeframe}\n`;
        }
        if (price) {
            formattedMessage += `💰 <b>Price:</b> $${price}\n`;
        }
        if (rsi) {
            formattedMessage += `📈 <b>RSI:</b> ${rsi}\n`;
        }
        if (message) {
            formattedMessage += `\n📝 <b>Details:</b> ${message}\n`;
        }
        formattedMessage += `\n⏰ <b>Time:</b> ${new Date().toLocaleString()}\n\n`;
        formattedMessage += `⚠️ <i>This is an automated signal. Please do your own research before trading.</i>`;
        return await this.sendMessage(chatId, formattedMessage);
    }
    async sendAlertMessage(chatId, alertData) {
        const { symbol, eventType, price, rsi, timeframe, alertId } = alertData;
        let emoji = '🚨';
        if (eventType.includes('OVERBOUGHT'))
            emoji = '🔴';
        else if (eventType.includes('OVERSOLD'))
            emoji = '🟢';
        let formattedMessage = `${emoji} <b>Alert Triggered - ${symbol}</b>\n\n`;
        formattedMessage += `🎯 <b>Event:</b> ${eventType}\n`;
        if (timeframe) {
            formattedMessage += `⏱️ <b>Timeframe:</b> ${timeframe}\n`;
        }
        if (alertId) {
            formattedMessage += `🆔 <b>Alert ID:</b> ${alertId}\n`;
        }
        if (price) {
            formattedMessage += `💰 <b>Price:</b> $${price}\n`;
        }
        if (rsi) {
            formattedMessage += `📈 <b>RSI:</b> ${rsi}\n`;
        }
        formattedMessage += `\n⏰ <b>Time:</b> ${new Date().toLocaleString()}\n\n`;
        formattedMessage += `⚠️ <i>This is an automated alert. Please do your own research before trading.</i>`;
        return await this.sendMessage(chatId, formattedMessage);
    }
};
exports.BotService = BotService;
exports.BotService = BotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [registration_token_service_1.RegistrationTokenService,
        alert_1.AlertService,
        monitoring_service_1.MonitoringService,
        price_monitoring_service_1.PriceMonitoringService,
        user_service_1.UserService])
], BotService);
//# sourceMappingURL=bot.service.js.map