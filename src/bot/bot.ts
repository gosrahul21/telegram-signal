import { Bot } from "grammy";
import userRepository from "../repositories/userRepository";
import {
  alertsCommandHandler,
  disableCommandHandler,
  enableCommandHandler,
  getAlertsKeyboard,
  getAlertsMessage,
} from "./commandHandlers/alertsHandler";
import { dayStatus } from "./commandHandlers/dayStatusHandler";
import { fourHourStatus } from "./commandHandlers/fourHourStatusHandler";
import { hourStatus } from "./commandHandlers/hourStatusHandler";
import { onSubscribe } from "./commandHandlers/onSubscribe";
import { unSubscribe } from "./commandHandlers/unsubscribeHandler";
import { bbScheduler } from "./scheduler/bbScheduler";
import { emaCrossScheduler } from "./scheduler/emaCrossScheduler";
import { rsiScheduler } from "./scheduler/rsiScheduler";

export const initializeBot = () => {
  const bot = new Bot(process.env.BOT_TOKEN!);

  // Core Commands
  bot.command("start", (ctx) => {
    ctx.reply(
      "👋 Welcome to Crypto Signal Bot!\nUse /subscribe to start receiving signals, or /alerts to customize alert types and symbols."
    );
    console.log("start command received", ctx.match);
  });
  bot.command("subscribe", (ctx) => onSubscribe(ctx));
  bot.command("unsubscribe", unSubscribe);

  // Preference Management Commands
  bot.command(["alerts", "settings"], alertsCommandHandler);
  bot.command("enable", enableCommandHandler);
  bot.command("disable", disableCommandHandler);

  // On-demand Status Commands
  bot.command("hourstatus", hourStatus);
  bot.command("quarterhrstatus", fourHourStatus);
  bot.command("daystatus", dayStatus);
  bot.command("ping", (ctx) => ctx.reply("Got another message!" + ctx.chat.id));

  // ============================================================================
  // INTERACTIVE INLINE KEYBOARD CALLBACK QUERIES
  // ============================================================================

  // Toggle Alert Type (EMA, RSI, BB)
  bot.callbackQuery(/^toggle_alert:(.+)$/, async (ctx) => {
    const alertType = ctx.match[1];
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const newState = await userRepository.toggleAlertType(chatId, alertType);
    await ctx.answerCallbackQuery({
      text: `${alertType} alerts ${newState ? "ENABLED ✅" : "DISABLED ❌"}`,
    });

    try {
      await ctx.editMessageText(getAlertsMessage(chatId, ctx.from?.username), {
        parse_mode: "HTML",
        reply_markup: getAlertsKeyboard(chatId),
      });
    } catch {
      // Ignore identical markup edits
    }
  });

  // Toggle Monitored Symbol (BTCUSDT, SOLUSDT, etc.)
  bot.callbackQuery(/^toggle_sym:(.+)$/, async (ctx) => {
    const symbol = ctx.match[1];
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const newState = await userRepository.toggleSymbol(chatId, symbol);
    await ctx.answerCallbackQuery({
      text: `${symbol} alerts ${newState ? "ENABLED ✅" : "DISABLED ❌"}`,
    });

    try {
      await ctx.editMessageText(getAlertsMessage(chatId, ctx.from?.username), {
        parse_mode: "HTML",
        reply_markup: getAlertsKeyboard(chatId),
      });
    } catch {
      // Ignore identical markup edits
    }
  });

  // Enable All
  bot.callbackQuery("alerts:enable_all", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    await userRepository.enableAll(chatId);
    await ctx.answerCallbackQuery({ text: "All alerts and symbols ENABLED ✅" });

    try {
      await ctx.editMessageText(getAlertsMessage(chatId, ctx.from?.username), {
        parse_mode: "HTML",
        reply_markup: getAlertsKeyboard(chatId),
      });
    } catch {}
  });

  // Disable All
  bot.callbackQuery("alerts:disable_all", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    await userRepository.disableAll(chatId);
    await ctx.answerCallbackQuery({
      text: "All alerts and symbols DISABLED ❌",
    });

    try {
      await ctx.editMessageText(getAlertsMessage(chatId, ctx.from?.username), {
        parse_mode: "HTML",
        reply_markup: getAlertsKeyboard(chatId),
      });
    } catch {}
  });

  bot.start();

  // Register command hints with Telegram
  bot.api.setMyCommands(
    [
      {
        command: "start",
        description: "Start the application and display a welcome message",
      },
      {
        command: "alerts",
        description: "Configure and toggle alert types (EMA, RSI, BB) & symbols",
      },
      {
        command: "subscribe",
        description:
          "Subscribe to real-time crypto price updates (you can specify a pair like 'BTCUSDT')",
      },
      {
        command: "unsubscribe",
        description: "Unsubscribe and stop receiving alerts",
      },
      {
        command: "enable",
        description: "Enable an alert type or symbol (e.g. /enable RSI, /enable BTCUSDT)",
      },
      {
        command: "disable",
        description: "Disable an alert type or symbol (e.g. /disable BB, /disable SOLUSDT)",
      },
      {
        command: "hourstatus",
        description: "Get 1-hour timeframe price status",
      },
      {
        command: "quarterhrstatus",
        description: "Get 4-hour timeframe price status",
      },
      {
        command: "daystatus",
        description: "Get daily timeframe price status",
      },
    ],
    {},
    undefined as any
  );

  // Initialize all technical signal schedulers
  emaCrossScheduler(bot);
  rsiScheduler(bot);
  bbScheduler(bot);
};

export default initializeBot;
