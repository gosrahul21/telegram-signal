// ============================================================================
// SIGNAL RENDERING
// ============================================================================

import { Bot } from "grammy";
// import userRepository from "../../repositories/userRepository";

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
  time: string;
}

export interface RSISignal {
  type: string;
  time: number;
  price: number;
  rsi?: number;
  details: string;
}
/**
 * Render RSI status to Telegram
 */
export const renderRSIStatus = async (
  pairName: string,
  rsiStatus: RSIStatus,
  bot: Bot,
  duration: string
): Promise<void> => {
  // const subscribedUsers: any = userRepository.getSubscribedUsers();
  const subscribedUsers: any = [];

  const message = `
<b>RSI Signal for ${pairName} - ${duration}</b>
📊 <b>Status:</b> ${rsiStatus.type}
💰 <b>Price:</b> ${rsiStatus.price}
📈 <b>RSI:</b> ${rsiStatus.rsi.toFixed(2)}
🎯 <b>Signal:</b> ${rsiStatus.signal}
⏰ <b>Time:</b> ${new Date(rsiStatus.time).toLocaleString()}
📝 <b>Details:</b> ${rsiStatus.details}
  `.trim();

  // Broadcast to all subscribed users
  for (const subscribedUser of subscribedUsers) {
    try {
      await bot.api.sendMessage(subscribedUser.chatId, message, {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error(
        `Failed to send RSI status to ${subscribedUser.chatId}:`,
        error
      );
    }
  }
};

/**
 * Render RSI signals to Telegram
 */
export const renderRSISignal = async (
  pairName: string,
  signals: RSISignal | RSISignal[],
  bot: Bot,
  duration: string
): Promise<void> => {
  const signalArray = Array.isArray(signals) ? signals : [signals];
  for (const signal of signalArray) {
    // Broadcast to all subscribed users
    try {
      await renderRSIStatus(pairName, signal as any, bot, duration);
    } catch (error) {
      console.error(`Failed to send RSI signal to ${pairName}:`, error);
    }
  }
};
