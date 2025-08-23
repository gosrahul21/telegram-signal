"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBot = void 0;
const grammy_1 = require("grammy");
const hourStatusHandler_1 = require("./commandHandlers/hourStatusHandler");
const fourHourStatusHandler_1 = require("./commandHandlers/fourHourStatusHandler");
const dayStatusHandler_1 = require("./commandHandlers/dayStatusHandler");
const rsiScheduler_1 = require("./scheduler/rsiScheduler");
const initializeBot = () => {
    const bot = new grammy_1.Bot(process.env.BOT_TOKEN);
    bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
    bot.command("hourstatus", hourStatusHandler_1.hourStatus);
    bot.command("quarterhrstatus", fourHourStatusHandler_1.fourHourStatus);
    bot.command("daystatus", dayStatusHandler_1.dayStatus);
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
    (0, rsiScheduler_1.rsiScheduler)(bot);
};
exports.initializeBot = initializeBot;
//# sourceMappingURL=bot.js.map