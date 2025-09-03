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
let BotService = class BotService {
    constructor(registrationTokenService, userService) {
        this.registrationTokenService = registrationTokenService;
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
                `🔐 You'll need to choose a username and password.\n\n` +
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
        user_service_1.UserService])
], BotService);
//# sourceMappingURL=bot.service.js.map