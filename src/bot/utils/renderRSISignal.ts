// ============================================================================
// SIGNAL RENDERING
// ============================================================================

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
      const rsiInfo = signal.rsi ? `\nRSI: ${signal.rsi.toFixed(2)}` : "";
      const subscribedUsers: any = await userRepository.getSubscribedUsers();
      // Broadcast to all subscribed users
      for (const subscribedUser of subscribedUsers) {
        try {
          await bot.api.sendMessage(
            subscribedUser.chatId,
            `<b>RSI Signal for ${pairName} - ${duration}</b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}${rsiInfo}\nDetails: ${signal.details}`,
            { parse_mode: "HTML" }
          );
        } catch (error) {
          console.error(`Failed to send RSI signal to ${subscribedUser.chatId}:`, error);
        }
      }
    }
  };
  