import { Bot } from "grammy";
import { logger } from "../../logger";
import userRepository from "../../repositories/userRepository";
import { EMASignal } from "./emaSignal";

/**
 * Render EMA crossover signals to subscribed Telegram users.
 * Returns the count of successfully sent Telegram notifications.
 */
export const renderEMASignal = async (
  pairName: string,
  signals: EMASignal | EMASignal[],
  bot: Bot,
  duration: string
): Promise<number> => {
  // If in-memory subscriber cache is empty, refresh from DB first
  if (userRepository.getSubscribedUsers().length === 0) {
    await userRepository.fetchSubscribedUsers();
  }

  const signalArray = Array.isArray(signals) ? signals : [signals];
  // Filter subscribers who have both EMA alert type and this symbol enabled
  const subscribers: any[] = userRepository.getSubscribedUsersFor(pairName, "EMA");
  let sentCount = 0;

  for (const signal of signalArray) {
    const formattedTime =
      typeof signal.time === "number"
        ? new Date(signal.time).toLocaleString()
        : String(signal.time);

    const message = `
<b>EMA Signal for ${pairName} - ${duration}</b>
🎯 <b>Type:</b> ${signal.type}
💰 <b>Price:</b> ${signal.price}
⏰ <b>Time:</b> ${formattedTime}
📝 <b>Details:</b> ${signal.details}
    `.trim();

    if (subscribers.length === 0) {
      logger(
        `[EMA Alert] Signal ${signal.type} detected for ${pairName} [${duration}] but 0 subscribers were eligible. (Total subscribers in memory: ${userRepository.getSubscribedUsers().length})`,
        "yellow"
      );
    }

    for (const { chatId } of subscribers) {
      try {
        await bot.api.sendMessage(chatId, message, { parse_mode: "HTML" });
        sentCount++;
        logger(
          `[EMA Alert Sent] Successfully delivered ${signal.type} for ${pairName} [${duration}] to chat ${chatId}`,
          "green"
        );
      } catch (error) {
        console.error(`Failed to send EMA signal for ${pairName} to ${chatId}:`, error);
      }
    }
  }

  return sentCount;
};

export default renderEMASignal;
