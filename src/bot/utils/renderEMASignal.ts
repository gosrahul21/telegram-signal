import { Bot } from "grammy";
import userRepository from "../../repositories/userRepository";
import { EMASignal } from "./emaSignal";

/**
 * Render EMA crossover signals to subscribed Telegram users
 */
export const renderEMASignal = async (
  pairName: string,
  signals: EMASignal | EMASignal[],
  bot: Bot,
  duration: string
): Promise<void> => {
  const signalArray = Array.isArray(signals) ? signals : [signals];
  // Filter subscribers who have both EMA alert type and this symbol enabled
  const subscribers: any[] = userRepository.getSubscribedUsersFor(pairName, "EMA");

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

    for (const { chatId } of subscribers) {
      try {
        await bot.api.sendMessage(chatId, message, { parse_mode: "HTML" });
      } catch (error) {
        console.error(`Failed to send EMA signal for ${pairName} to ${chatId}:`, error);
      }
    }
  }
};

export default renderEMASignal;
