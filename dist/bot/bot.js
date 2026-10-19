"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBot = void 0;
const grammy_1 = require("grammy");
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const alertsHandler_1 = require("./commandHandlers/alertsHandler");
const dayStatusHandler_1 = require("./commandHandlers/dayStatusHandler");
const fourHourStatusHandler_1 = require("./commandHandlers/fourHourStatusHandler");
const hourStatusHandler_1 = require("./commandHandlers/hourStatusHandler");
const onSubscribe_1 = require("./commandHandlers/onSubscribe");
const unsubscribeHandler_1 = require("./commandHandlers/unsubscribeHandler");
const bbScheduler_1 = require("./scheduler/bbScheduler");
const emaCrossScheduler_1 = require("./scheduler/emaCrossScheduler");
const rsiScheduler_1 = require("./scheduler/rsiScheduler");
const initializeBot = () => {
    const bot = new grammy_1.Bot(process.env.BOT_TOKEN);
    // Core Commands
    bot.command("start", (ctx) => {
        ctx.reply("👋 Welcome to Crypto Signal Bot!\nUse /subscribe to start receiving signals, or /alerts to customize alert types and symbols.");
        console.log("start command received", ctx.match);
    });
    bot.command("subscribe", (ctx) => (0, onSubscribe_1.onSubscribe)(ctx));
    bot.command("unsubscribe", unsubscribeHandler_1.unSubscribe);
    // Preference Management Commands
    bot.command(["alerts", "settings"], alertsHandler_1.alertsCommandHandler);
    bot.command("enable", alertsHandler_1.enableCommandHandler);
    bot.command("disable", alertsHandler_1.disableCommandHandler);
    // On-demand Status Commands
    bot.command("hourstatus", hourStatusHandler_1.hourStatus);
    bot.command("quarterhrstatus", fourHourStatusHandler_1.fourHourStatus);
    bot.command("daystatus", dayStatusHandler_1.dayStatus);
    bot.command("ping", (ctx) => ctx.reply("Got another message!" + ctx.chat.id));
    // ============================================================================
    // INTERACTIVE INLINE KEYBOARD CALLBACK QUERIES
    // ============================================================================
    // Toggle Alert Type (EMA, RSI, BB)
    bot.callbackQuery(/^toggle_alert:(.+)$/, async (ctx) => {
        const alertType = ctx.match[1];
        const chatId = ctx.chat?.id;
        if (!chatId)
            return;
        const newState = await userRepository_1.default.toggleAlertType(chatId, alertType);
        await ctx.answerCallbackQuery({
            text: `${alertType} alerts ${newState ? "ENABLED ✅" : "DISABLED ❌"}`,
        });
        try {
            await ctx.editMessageText((0, alertsHandler_1.getAlertsMessage)(chatId, ctx.from?.username), {
                parse_mode: "HTML",
                reply_markup: (0, alertsHandler_1.getAlertsKeyboard)(chatId),
            });
        }
        catch {
            // Ignore identical markup edits
        }
    });
    // Toggle Monitored Symbol (BTCUSDT, SOLUSDT, etc.)
    bot.callbackQuery(/^toggle_sym:(.+)$/, async (ctx) => {
        const symbol = ctx.match[1];
        const chatId = ctx.chat?.id;
        if (!chatId)
            return;
        const newState = await userRepository_1.default.toggleSymbol(chatId, symbol);
        await ctx.answerCallbackQuery({
            text: `${symbol} alerts ${newState ? "ENABLED ✅" : "DISABLED ❌"}`,
        });
        try {
            await ctx.editMessageText((0, alertsHandler_1.getAlertsMessage)(chatId, ctx.from?.username), {
                parse_mode: "HTML",
                reply_markup: (0, alertsHandler_1.getAlertsKeyboard)(chatId),
            });
        }
        catch {
            // Ignore identical markup edits
        }
    });
    // Enable All
    bot.callbackQuery("alerts:enable_all", async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId)
            return;
        await userRepository_1.default.enableAll(chatId);
        await ctx.answerCallbackQuery({ text: "All alerts and symbols ENABLED ✅" });
        try {
            await ctx.editMessageText((0, alertsHandler_1.getAlertsMessage)(chatId, ctx.from?.username), {
                parse_mode: "HTML",
                reply_markup: (0, alertsHandler_1.getAlertsKeyboard)(chatId),
            });
        }
        catch { }
    });
    // Disable All
    bot.callbackQuery("alerts:disable_all", async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId)
            return;
        await userRepository_1.default.disableAll(chatId);
        await ctx.answerCallbackQuery({
            text: "All alerts and symbols DISABLED ❌",
        });
        try {
            await ctx.editMessageText((0, alertsHandler_1.getAlertsMessage)(chatId, ctx.from?.username), {
                parse_mode: "HTML",
                reply_markup: (0, alertsHandler_1.getAlertsKeyboard)(chatId),
            });
        }
        catch { }
    });
    bot.start();
    // Register command hints with Telegram
    bot.api.setMyCommands([
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
            description: "Subscribe to real-time crypto price updates (you can specify a pair like 'BTCUSDT')",
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
    ], {}, undefined);
    // Initialize all technical signal schedulers with staggered start to avoid rate limit spikes
    setTimeout(() => (0, emaCrossScheduler_1.emaCrossScheduler)(bot), 1000);
    setTimeout(() => (0, rsiScheduler_1.rsiScheduler)(bot), 5000);
    setTimeout(() => (0, bbScheduler_1.bbScheduler)(bot), 10000);
};
exports.initializeBot = initializeBot;
exports.default = exports.initializeBot;
