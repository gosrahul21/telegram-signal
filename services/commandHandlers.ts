import { Bot, Context } from "grammy";
import { keyPairsMapping } from "../utils/constants";
import { generateSignal, getTrendStatus, priceAwayFromAverage } from "./signals";
import userService from "./userService";


const subscribed: string[] = [];
const fallbackKeyPairs = [
  'BTCUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'ETHUSDT',
];
const markets = [
  'BTCUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'ETHUSDT',
];

export const renderSignal = async (pairName: string, signals: any, bot: Bot, duration: string) => {
  // retrieve subscribed users 
  const subscribedUsers = userService.getSubscribedUsers();
  subscribedUsers.map(async ({ chatId }: any) => {
    for (const signal of signals) {
      await bot.api.sendMessage(
        chatId,
        `<b>Signal for ${pairName} - ${duration} </b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}\nDetails: ${signal.details}`,
        { parse_mode: "HTML" }
      );
    }
  })
}

// subcribe to the notification
export const onSubscribe = async (ctx: any) => {
  const telegramId = ctx.from.id;
  const chatId = ctx.chat.id;
  // Create a user object
  const user: any = {
    telegramId, // The user's Telegram ID
    username: ctx.from.username || ctx.from.first_name + " " + ctx.from.last_name,
    chatId, // The user's chat ID
    // subscriptions: pairName ? [pairName] : fallbackKeyPairs // List of subscriptions (individual or fallback pairs)
  };
  // Add the user to the database using userService
  try {
    await userService.addUser(user);
    ctx.reply(`Subscribed successfully`);
  } catch (error) {
    ctx.reply(`Error adding user ${telegramId} to the database:`, error);
  }
}

export const hourStatus = async (ctx: any) => {
  const keyName = ctx.match;
  const pariName = (keyPairsMapping as any)[keyName];
  const duration = '1h';
  if (!pariName) {
    return fallbackKeyPairs.forEach((fallbackPair) => {
      getStatus(ctx, fallbackPair, '1h');
    });
  }
  await getStatus(ctx, keyName, duration);
}

export const fourHourStatus = async (ctx: any) => {
  const keyName = ctx.match;
  const pairName = keyPairsMapping[keyName];

  // If pairName is not found in keyPairsMapping, use fallback key pairs
  if (!pairName) {
    fallbackKeyPairs.forEach((fallbackPair: string) => {
      getStatus(ctx, fallbackPair, '4h');
    });
    return;
  }

  // If pairName is found, proceed with getting the status
  await getStatus(ctx, keyName, '4h');
};

// Function to get the daily status
export const dayStatus = async (ctx: any) => {
  const keyName = ctx.match;
  const pairName = keyPairsMapping[keyName];

  // If pairName is not found in keyPairsMapping, use fallback key pairs
  if (!pairName) {
    fallbackKeyPairs.forEach((fallbackPair) => {
      getStatus(ctx, fallbackPair, '1d');
    });
    return;
  }

  // If pairName is found, proceed with getting the status
  await getStatus(ctx, keyName, '1d');
};

export const getStatus = async (ctx: any, keyName: string, duration: '1h' | '4h' | '1d') => {
  const pariName = (keyPairsMapping as any)[keyName];
  const signal = await getTrendStatus(pariName, duration);
  renderSignal(pariName, signal, ctx, duration);
}

export const overBoughtSignal = async (ctx: any) => {
  const keyName = ctx.match;
  const pairName = keyPairsMapping[keyName];
  const signal = await priceAwayFromAverage(keyName, pairName, '1d');
  renderSignal(keyName, signal, ctx, '1d');
  setInterval(async () => {
    const signal = await priceAwayFromAverage(keyName, pairName, '1d');
    renderSignal(keyName, signal, ctx, '1d');
  }, 5 * 60 * 1000)
}

export const cryptoScheduler = async (bot: Bot) => {

  setInterval(async () => {
    fallbackKeyPairs.forEach(async (keyPair) => {
      const signalOneHr = await generateSignal(keyPair, '1h');
      renderSignal(keyPair, signalOneHr, bot, '1h');
    })
  }, 60 * 60 * 1000);

  setInterval(async () => {
    fallbackKeyPairs.forEach((async (keyPair) => {
      const signalFourHr = await generateSignal(keyPair, '4h');
      renderSignal(keyPair, signalFourHr, bot, '4h');
    }))
  }, 4 * 60 * 60 * 1000);

  setInterval(async () => {
    fallbackKeyPairs.forEach(async (keyPair) => {
      const signalDaily = await generateSignal(keyPair, '1d');
      renderSignal(keyPair, signalDaily, bot, '1d');
    })
  }, 24 * 60 * 60 * 1000);

};
