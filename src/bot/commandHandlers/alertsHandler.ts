import { CommandContext, Context, InlineKeyboard } from "grammy";
import config from "../../config";
import userRepository, { DEFAULT_ALERT_TYPES } from "../../repositories/userRepository";

/**
 * Constructs the interactive inline keyboard for alert types and symbols
 */
export const getAlertsKeyboard = (chatId: number): InlineKeyboard => {
  const prefs = userRepository.getUserPreferences(chatId);
  const kb = new InlineKeyboard();

  // Row 1: Alert Types
  const alertDefinitions = [
    { id: "EMA", label: "EMA Cross" },
    { id: "RSI", label: "RSI" },
    { id: "BB", label: "Bollinger" },
  ];

  for (const { id, label } of alertDefinitions) {
    const isEnabled = prefs.alertTypes.some(
      (t) => t.toUpperCase() === id.toUpperCase()
    );
    kb.text(`${isEnabled ? "✅" : "❌"} ${label}`, `toggle_alert:${id}`);
  }
  kb.row();

  // Symbol Rows (2 per row)
  const symbols: string[] = config.BINANCE_KEY_PAIRS;
  symbols.forEach((symbol, index) => {
    const isEnabled = prefs.subscribedPairs.some(
      (p) => p.toUpperCase() === symbol.toUpperCase()
    );
    kb.text(`${isEnabled ? "✅" : "❌"} ${symbol}`, `toggle_sym:${symbol}`);
    if (index % 2 === 1) kb.row();
  });
  if (symbols.length % 2 !== 0) kb.row();

  // Bottom action buttons
  kb.text("🔔 Enable All", "alerts:enable_all").text(
    "🔕 Disable All",
    "alerts:disable_all"
  );

  return kb;
};

/**
 * Formats the text summary of active user preferences
 */
export const getAlertsMessage = (chatId: number, username?: string): string => {
  const prefs = userRepository.getUserPreferences(chatId);
  const displayUser = username ? `@${username}` : "Subscriber";

  const alertTypesStr =
    prefs.alertTypes.length > 0 ? prefs.alertTypes.join(", ") : "None (Muted)";
  const symbolsStr =
    prefs.subscribedPairs.length > 0
      ? prefs.subscribedPairs.join(", ")
      : "None (Muted)";

  return `
🔔 <b>Alert Settings for ${displayUser}</b>

📊 <b>Active Alert Types:</b>
👉 ${alertTypesStr}

🪙 <b>Active Symbols:</b>
👉 ${symbolsStr}

<i>Tap buttons below to toggle alert types and symbols ON/OFF instantly:</i>
  `.trim();
};

/**
 * Handler for /alerts and /settings commands
 */
export const alertsCommandHandler = async (ctx: CommandContext<Context>) => {
  const chatId = ctx.chat.id;
  const username = ctx.from?.username || ctx.from?.first_name || "User";

  // Ensure user is registered in repository
  await userRepository.addUser({
    chatId,
    telegramId: ctx.from?.id || chatId,
    username,
  });

  const message = getAlertsMessage(chatId, username);
  const keyboard = getAlertsKeyboard(chatId);

  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
};

/**
 * Handler for /enable <type|symbol>
 */
export const enableCommandHandler = async (ctx: CommandContext<Context>) => {
  const chatId = ctx.chat.id;
  const target = ctx.match?.trim().toUpperCase();

  if (!target) {
    return ctx.reply(
      "Please specify an alert type (EMA, RSI, BB) or symbol (e.g. BTCUSDT, SOLUSDT) to enable.\nExample: <code>/enable RSI</code> or <code>/enable BTCUSDT</code> or <code>/enable all</code>",
      { parse_mode: "HTML" }
    );
  }

  if (target === "ALL") {
    await userRepository.enableAll(chatId);
    return ctx.reply("✅ All alert types and symbols have been enabled!");
  }

  if (DEFAULT_ALERT_TYPES.includes(target)) {
    await userRepository.setAlertType(chatId, target, true);
    return ctx.reply(`✅ <b>${target}</b> alerts have been enabled!`, {
      parse_mode: "HTML",
    });
  }

  // Symbol check
  const availablePairs: string[] = config.BINANCE_KEY_PAIRS.map((p: string) =>
    p.toUpperCase()
  );
  if (availablePairs.includes(target)) {
    await userRepository.setSymbol(chatId, target, true);
    return ctx.reply(`✅ Alerts for <b>${target}</b> have been enabled!`, {
      parse_mode: "HTML",
    });
  }

  return ctx.reply(
    `Unknown option '<b>${target}</b>'. Available alert types: ${DEFAULT_ALERT_TYPES.join(
      ", "
    )}. Available symbols: ${config.BINANCE_KEY_PAIRS.join(", ")}`,
    { parse_mode: "HTML" }
  );
};

/**
 * Handler for /disable <type|symbol>
 */
export const disableCommandHandler = async (ctx: CommandContext<Context>) => {
  const chatId = ctx.chat.id;
  const target = ctx.match?.trim().toUpperCase();

  if (!target) {
    return ctx.reply(
      "Please specify an alert type (EMA, RSI, BB) or symbol (e.g. BTCUSDT, SOLUSDT) to disable.\nExample: <code>/disable RSI</code> or <code>/disable BTCUSDT</code> or <code>/disable all</code>",
      { parse_mode: "HTML" }
    );
  }

  if (target === "ALL") {
    await userRepository.disableAll(chatId);
    return ctx.reply("❌ All alert types and symbols have been disabled (muted).");
  }

  if (DEFAULT_ALERT_TYPES.includes(target)) {
    await userRepository.setAlertType(chatId, target, false);
    return ctx.reply(`❌ <b>${target}</b> alerts have been disabled!`, {
      parse_mode: "HTML",
    });
  }

  const availablePairs: string[] = config.BINANCE_KEY_PAIRS.map((p: string) =>
    p.toUpperCase()
  );
  if (availablePairs.includes(target)) {
    await userRepository.setSymbol(chatId, target, false);
    return ctx.reply(`❌ Alerts for <b>${target}</b> have been disabled!`, {
      parse_mode: "HTML",
    });
  }

  return ctx.reply(
    `Unknown option '<b>${target}</b>'. Available alert types: ${DEFAULT_ALERT_TYPES.join(
      ", "
    )}. Available symbols: ${config.BINANCE_KEY_PAIRS.join(", ")}`,
    { parse_mode: "HTML" }
  );
};
