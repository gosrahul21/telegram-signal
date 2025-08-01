"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBot = void 0;
const grammy_1 = require("grammy");
const onSubscribe_1 = require("./commandHandlers/onSubscribe");
const hourStatusHandler_1 = require("./commandHandlers/hourStatusHandler");
const fourHourStatusHandler_1 = require("./commandHandlers/fourHourStatusHandler");
const dayStatusHandler_1 = require("./commandHandlers/dayStatusHandler");
const unsubscribeHandler_1 = require("./commandHandlers/unsubscribeHandler");
const rsiScheduler_1 = require("./scheduler/rsiScheduler");
const initializeBot = () => {
    const bot = new grammy_1.Bot(process.env.BOT_TOKEN);
    bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
    bot.command("subscribe", (ctx) => (0, onSubscribe_1.onSubscribe)(ctx));
    bot.command("hourstatus", hourStatusHandler_1.hourStatus);
    bot.command("quarterhrstatus", fourHourStatusHandler_1.fourHourStatus);
    bot.command("daystatus", dayStatusHandler_1.dayStatus);
    bot.command("unsubscribe", unsubscribeHandler_1.unSubscribe);
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
    (0, rsiScheduler_1.rsiScheduler)(bot);
};
exports.initializeBot = initializeBot;
