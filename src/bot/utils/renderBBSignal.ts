import { Bot } from "grammy";
import { logger } from "../../logger";
import userRepository from "../../repositories/userRepository";
import { BBSignal } from "./bollingerBandsSignal";

/**
 * Render Bollinger Bands signal to Telegram subscribers.
 * Returns the count of successfully sent Telegram notifications.
 */
export const renderBBSignal = async (
  pairName: string,
  signals: BBSignal | BBSignal[],
  bot: Bot,
  duration: string
): Promise<number> => {
  // If in-memory subscriber cache is empty, refresh from DB first
  if (userRepository.getSubscribedUsers().length === 0) {
    await userRepository.fetchSubscribedUsers();
  }

  const subscribedUsers = userRepository.getSubscribedUsersFor(pairName, "BB");
  const signalArray = Array.isArray(signals) ? signals : [signals];
  let sentCount = 0;

  for (const signal of signalArray) {
    const isUpper = signal.type === "bb_upper";
    const signalLabel = isUpper
      ? "🔴 BB Upper Hit (Overbought / Resistance)"
      : "🟢 BB Lower Hit (Oversold / Support)";

    const formattedTime =
      typeof signal.candleTime === "number"
        ? new Date(signal.candleTime).toLocaleString()
        : String(signal.candleTime);

    const message = `
<b>Bollinger Bands Alert: ${pairName} [${duration}]</b>
🎯 <b>Signal:</b> ${signalLabel}
💰 <b>Price:</b> ${signal.price}
📈 <b>Upper Band:</b> ${signal.upper.toFixed(2)}
⚖️ <b>Middle (20 SMA):</b> ${signal.middle.toFixed(2)}
📉 <b>Lower Band:</b> ${signal.lower.toFixed(2)}
⏰ <b>Time:</b> ${formattedTime}
📝 <b>Details:</b> ${signal.details}
    `.trim();

    if (subscribedUsers.length === 0) {
      logger(
        `[BB Alert] Detected ${signal.type} for ${pairName} [${duration}] but 0 subscribers were eligible. (Total subscribers in memory: ${userRepository.getSubscribedUsers().length})`,
        "yellow"
      );
    }

    for (const subscribedUser of subscribedUsers) {
      try {
        await bot.api.sendMessage(subscribedUser.chatId, message, {
          parse_mode: "HTML",
        });
        sentCount++;
        logger(
          `[BB Alert Sent] Successfully delivered ${signal.type} for ${pairName} [${duration}] to chat ${subscribedUser.chatId}`,
          "green"
        );
      } catch (error) {
        console.error(
          `Failed to send BB signal for ${pairName} to ${subscribedUser.chatId}:`,
          error
        );
      }
    }
  }

  return sentCount;
};

export default renderBBSignal;
