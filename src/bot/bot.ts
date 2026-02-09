import {
  Bot,
} from "grammy";

import { onSubscribe } from "./commandHandlers/onSubscribe";
import { hourStatus } from "./commandHandlers/hourStatusHandler";
import { fourHourStatus } from "./commandHandlers/fourHourStatusHandler";
import { dayStatus } from "./commandHandlers/dayStatusHandler";
import { unSubscribe } from "./commandHandlers/unsubscribeHandler";
import { rsiScheduler } from "./scheduler/rsiScheduler";

export const initializeBot = () => {
  const bot = new Bot(process.env.BOT_TOKEN!);

  bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
  bot.command("subscribe", (ctx)=> onSubscribe(ctx))
  bot.command("hourstatus", hourStatus)
  bot.command("quarterhrstatus", fourHourStatus)
  bot.command("daystatus", dayStatus)
  bot.command("unsubscribe", unSubscribe)
  // bot.command("rsi", getRSIStatus)
  // bot.command('subscribeob', overBoughtSignal)

  bot.command("ping", (ctx) => ctx.reply("Got another message!"+ctx.chat.id));

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
  ], {}, undefined as any);

  // in this context, we have bot info
  rsiScheduler(bot);

}