import { Bot } from "grammy";
import userRepository from "../../repositories/userRepository";
import { BBSignal } from "./bollingerBandsSignal";

/**
 * Render Bollinger Bands signal to Telegram subscribers
 */
export const renderBBSignal = async (
  pairName: string,
  signals: BBSignal | BBSignal[],
  bot: Bot,
  duration: string
): Promise<void> => {
  const subscribedUsers = userRepository.getSubscribedUsersFor(pairName, "BB");
  const signalArray = Array.isArray(signals) ? signals : [signals];

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

    for (const subscribedUser of subscribedUsers) {
      try {
        await bot.api.sendMessage(subscribedUser.chatId, message, {
          parse_mode: "HTML",
        });
      } catch (error) {
        console.error(
          `Failed to send BB signal for ${pairName} to ${subscribedUser.chatId}:`,
          error
        );
      }
    }
  }
};

export default renderBBSignal;
