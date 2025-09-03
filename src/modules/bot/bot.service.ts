import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { RegistrationTokenService } from '@/modules/auth/registration-token.service';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Bot;

  constructor(
    private registrationTokenService: RegistrationTokenService,
    private userService: UserService,
  ) {
    this.bot = new Bot(process.env.BOT_TOKEN || '');
    this.setupCommands();
  }

  onModuleInit() {
    this.bot.start();
    console.log('TelegramBot started successfully!');
  }

  public getBot() {
    if (!this.bot)
      throw new NotFoundException('Bot not found or not initialzed');
    return this.bot;
  }

  private setupCommands() {
    // Start command - handles user registration
    this.bot.command('start', async (ctx) => {
      await this.handleStartCommand(ctx);
    });

    // Help command
    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        'Welcome to the Crypto Signals Bot! 🚀\n\n' +
          'Available commands:\n' +
          '/start - Start the bot and get registration link\n' +
          '/help - Show this help message\n' +
          '/subscribe - Subscribe to crypto signals\n' +
          '/unsubscribe - Unsubscribe from signals',
      );
    });

    // Subscribe command
    this.bot.command('subscribe', async (ctx) => {
      await this.handleSubscribeCommand(ctx);
    });

    // Unsubscribe command
    this.bot.command('unsubscribe', async (ctx) => {
      await this.handleUnsubscribeCommand(ctx);
    });
  }

  private async handleStartCommand(ctx: any) {
    try {
      const telegramId = ctx.from.id;
      const username = ctx.from.username || `user_${telegramId}`;
      const chatId = ctx.chat.id;

      // Check if user already exists
      const existingUser = await this.userService.findByTelegramId(telegramId);

      if (existingUser) {
        await ctx.reply(
          `Welcome back, ${existingUser.username}! 👋\n\n` +
            'You are already registered and can use:\n' +
            '/subscribe - Subscribe to crypto signals\n' +
            '/unsubscribe - Unsubscribe from signals',
        );
        return;
      }

      // Generate registration token
      const registrationToken =
        this.registrationTokenService.generateRegistrationToken(
          telegramId,
          chatId,
        );

      // Create registration URL (you'll need to set this in your environment)
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const registrationUrl = `${baseUrl}/link-telegram?token=${registrationToken}`;

      await ctx.reply(
        `Welcome to Crypto Signals Bot! 🚀\n\n` +
          `To complete your registration, please visit this link:\n\n` +
          `${registrationUrl}\n\n` +
          `⚠️ This link expires in 1 hour.\n` +
          `🔐 You'll need to choose a username and password.\n\n` +
          `After registration, you can:\n` +
          `• Subscribe to crypto signals\n` +
          `• Get real-time alerts\n` +
          `• Manage your preferences`,
      );
    } catch (error) {
      console.error('Error in start command:', error);
      await ctx.reply(
        'Sorry, there was an error processing your request. Please try again later.',
      );
    }
  }

  private async handleSubscribeCommand(ctx: any) {
    try {
      const telegramId = ctx.from.id;
      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        await ctx.reply(
          'You need to register first! Use /start to begin registration.',
        );
        return;
      }

      await ctx.reply(
        'Subscription feature coming soon! 🚧\n\n' +
          'You can subscribe to:\n' +
          '• 1-hour signals\n' +
          '• 4-hour signals\n' +
          '• Daily signals\n\n' +
          'Stay tuned for updates!',
      );
    } catch (error) {
      console.error('Error in subscribe command:', error);
      await ctx.reply('Sorry, there was an error. Please try again later.');
    }
  }

  private async handleUnsubscribeCommand(ctx: any) {
    try {
      const telegramId = ctx.from.id;
      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        await ctx.reply(
          'You need to register first! Use /start to begin registration.',
        );
        return;
      }

      await ctx.reply(
        'Unsubscribe feature coming soon! 🚧\n\n' +
          "You'll be able to manage your subscriptions easily.",
      );
    } catch (error) {
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

  /**
   * Send a message to a specific chat ID
   */
  async sendMessage(
    chatId: string,
    message: string,
    options?: {
      parse_mode?: 'HTML' | 'Markdown';
      disable_web_page_preview?: boolean;
      disable_notification?: boolean;
    },
  ): Promise<boolean> {
    try {
      await this.bot.api.sendMessage(chatId, message, {
        parse_mode: options?.parse_mode || 'HTML',
        // disable_web_page_preview: options?.disable_web_page_preview || true,
        disable_notification: options?.disable_notification || false,
      });
      return true;
    } catch (error) {
      console.error(`Failed to send message to chat ${chatId}:`, error);
      return false;
    }
  }

  /**
   * Send a message to multiple chat IDs
   */
  async sendBulkMessage(
    chatIds: string[],
    message: string,
    options?: {
      parse_mode?: 'HTML' | 'Markdown';
      disable_web_page_preview?: boolean;
      disable_notification?: boolean;
    },
  ): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const chatId of chatIds) {
      try {
        const success = await this.sendMessage(chatId, message, options);
        if (success) {
          sent++;
        } else {
          failed++;
          errors.push(`Failed to send to chat ${chatId}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error sending to chat ${chatId}: ${error.message}`);
      }
    }

    return { sent, failed, errors };
  }

  /**
   * Send a formatted signal message
   */
  async sendSignalMessage(
    chatId: string,
    signalData: {
      symbol: string;
      type: string;
      price?: number;
      rsi?: number;
      timeframe?: string;
      message?: string;
    },
  ): Promise<boolean> {
    const { symbol, type, price, rsi, timeframe, message } = signalData;

    let emoji = '📊';
    if (type.toLowerCase().includes('buy')) emoji = '🟢';
    else if (type.toLowerCase().includes('sell')) emoji = '🔴';

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

  /**
   * Send a formatted alert message
   */
  async sendAlertMessage(
    chatId: string,
    alertData: {
      symbol: string;
      eventType: string;
      price?: number;
      rsi?: number;
      timeframe?: string;
      alertId?: string;
    },
  ): Promise<boolean> {
    const { symbol, eventType, price, rsi, timeframe, alertId } = alertData;

    let emoji = '🚨';
    if (eventType.includes('OVERBOUGHT')) emoji = '🔴';
    else if (eventType.includes('OVERSOLD')) emoji = '🟢';

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
}
