import {
    Bot,
    Context,
    GrammyError,
    HttpError,
    InlineKeyboard,
    NextFunction,
  } from "grammy";
  import "dotenv/config";
import { onSubscribe } from "./commandHandlers";

  
  const bot = new Bot(process.env.BOT_TOKEN!);
  

  bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
  bot.command("subscribe",onSubscribe)


bot.on("message", (ctx) => ctx.reply("Got another message!"));
// bot.api.sendMessage(process.env.CHAT_ID,"HELLO RAHUL")

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start the bot.
bot.start();
  

  


