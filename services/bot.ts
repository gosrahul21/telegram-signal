import {
    Bot,
  } from "grammy";
import "dotenv/config";
import { dayStatus, fourHourStatus, hourStatus, onSubscribe, overBoughtSignal,  } from "./commandHandlers";

const bot = new Bot(process.env.BOT_TOKEN!);


bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("subscribe",onSubscribe)
bot.command("hourstatus",hourStatus)
bot.command("quarterhrstatus",fourHourStatus)
bot.command("daystatus",dayStatus)
bot.command('subscribeob',overBoughtSignal )

bot.on("message", (ctx) => ctx.reply("Got another message!"));

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
], {},undefined as any);

