import { Bot } from "grammy";
import userRepository from "../../repositories/userRepository";

export interface RSIStatus {
  type:
    | "Extreme Overbought"
    | "Overbought"
    | "Neutral"
    | "Oversold"
    | "Extreme Oversold";
  rsi: number;
  signal: "Strong Sell" | "Sell" | "Hold" | "Buy" | "Strong Buy";
  details: string;
  price: number;
  time: string | number;
}

export interface RSISignal {
  type: string;
  time: number | string;
  price: number;
  rsi?: number;
  details: string;
  candleId?: string | number;
}

import { logger } from "../../logger";

/**
 * Render RSI status to Telegram subscribers who have enabled RSI and this symbol
 */
export const renderRSIStatus = async (
  pairName: string,
  rsiStatus: RSIStatus,
  bot: Bot,
  duration: string
): Promise<number> => {
  // If in-memory subscriber cache is empty, refresh from DB first
  if (userRepository.getSubscribedUsers().length === 0) {
    await userRepository.fetchSubscribedUsers();
  }

  // Only broadcast to users who have enabled both RSI alerts and this symbol
  const subscribers: any[] = userRepository.getSubscribedUsersFor(pairName, "RSI");
  let sentCount = 0;

  const formattedTime =
    typeof rsiStatus.time === "number"
      ? new Date(rsiStatus.time).toLocaleString()
      : String(rsiStatus.time);

  const message = `
<b>RSI Signal for ${pairName} - ${duration}</b>
📊 <b>Status:</b> ${rsiStatus.type}
💰 <b>Price:</b> ${rsiStatus.price}
📈 <b>RSI:</b> ${rsiStatus.rsi !== undefined ? rsiStatus.rsi.toFixed(2) : "N/A"}
🎯 <b>Signal:</b> ${rsiStatus.signal || rsiStatus.type}
⏰ <b>Time:</b> ${formattedTime}
📝 <b>Details:</b> ${rsiStatus.details}
  `.trim();

  if (subscribers.length === 0) {
    logger(
      `[RSI Alert] Signal ${rsiStatus.type} detected for ${pairName} [${duration}] but 0 subscribers were eligible. (Total subscribers in memory: ${userRepository.getSubscribedUsers().length})`,
      "yellow"
    );
  }

  for (const subscribedUser of subscribers) {
    try {
      await bot.api.sendMessage(subscribedUser.chatId, message, {
        parse_mode: "HTML",
      });
      sentCount++;
      logger(
        `[RSI Alert Sent] Successfully delivered ${rsiStatus.type} for ${pairName} [${duration}] to chat ${subscribedUser.chatId}`,
        "green"
      );
    } catch (error) {
      console.error(
        `Failed to send RSI status to ${subscribedUser.chatId}:`,
        error
      );
    }
  }

  return sentCount;
};

/**
 * Render RSI signals to Telegram
 */
export const renderRSISignal = async (
  pairName: string,
  signals: RSISignal | RSISignal[],
  bot: Bot,
  duration: string
): Promise<number> => {
  const signalArray = Array.isArray(signals) ? signals : [signals];
  let totalSent = 0;
  for (const signal of signalArray) {
    try {
      const sent = await renderRSIStatus(pairName, signal as any, bot, duration);
      totalSent += sent;
    } catch (error) {
      console.error(`Failed to send RSI signal to ${pairName}:`, error);
    }
  }
  return totalSent;
};

export default renderRSISignal;
