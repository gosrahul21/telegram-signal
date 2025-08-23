import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { RegistrationTokenService } from '../modules/auth/registration-token.service';
import { UserService } from '../modules/user/user.service';

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
}
