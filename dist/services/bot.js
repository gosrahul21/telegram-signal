"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const commandHandlers_1 = require("./commandHandlers");
exports.subscriberId = [];
exports.initializeBot = () => {
    const bot = new grammy_1.Bot(process.env.BOT_TOKEN);
    bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
    bot.command("subscribe", (ctx) => { exports.subscriberId.push(ctx.chat.id); ctx.reply("subscribed successfully with other " + exports.subscriberId.length + "users"); });
    bot.command("hourstatus", commandHandlers_1.hourStatus);
    bot.command("quarterhrstatus", commandHandlers_1.fourHourStatus);
    bot.command("daystatus", commandHandlers_1.dayStatus);
    bot.command("unsubscribe", (ctx) => {
        exports.subscriberId = exports.subscriberId.filter((id) => id !== ctx.chat.id);
        ctx.reply("Unsubscribed from all updates.");
    });
    // bot.command("rsi", getRSIStatus)
    // bot.command('subscribeob', overBoughtSignal)
    bot.command("ping", (ctx) => ctx.reply("Got another message!" + ctx.chat.id));
    bot.start();
    bot.api.setMyCommands([
        {
            command: "start",
            description: "Start the application and display a welcome message",
        },
        {
            command: "subscribe",
            description: "Subscribe to real-time crypto price updates (you can specify a pair like 'BTCUSDT')",
        },
        {
            command: "hourstatus",
            description: "Get hourly price updates for a specified cryptocurrency pair (e.g., 'BTCUSDT')",
        },
        {
            command: "quarterhrstatus",
            description: "Get 4-hour price updates for a specified cryptocurrency pair (e.g., 'BTCUSDT')",
        },
        {
            command: "daystatus",
            description: "Get daily price updates for a specified cryptocurrency pair (e.g., 'BTCUSDT')",
        },
    ], {}, undefined);
    // in this context, we have bot info
    // cryptoScheduler(bot);
    commandHandlers_1.rsiOverboughtScheduler(bot);
};
