import "dotenv/config";
import { Bot } from "grammy";
import { renderBBSignal } from "../bot/utils/renderBBSignal";
import { renderEMASignal } from "../bot/utils/renderEMASignal";
import { renderRSISignal } from "../bot/utils/renderRSISignal";
import connectToDatabase from "../models/connection";
import userRepository from "../repositories/userRepository";

async function main() {
  const alertType = (process.argv[2] || "bb").toLowerCase();
  const pair = (process.argv[3] || "BTCUSDT").toUpperCase();

  console.log(`Connecting to MongoDB and loading subscribers...`);
  await connectToDatabase();
  await userRepository.fetchSubscribedUsers();

  const bot = new Bot(process.env.BOT_TOKEN!);
  let sent = 0;

  if (alertType === "bb") {
    console.log(`Sending mock Bollinger Bands (BB Lower) alert for ${pair}...`);
    sent = await renderBBSignal(
      pair,
      [
        {
          type: "bb_lower",
          keyName: pair,
          price: 67450.25,
          upper: 69200.0,
          middle: 68350.5,
          lower: 67500.0,
          candleId: Date.now(),
          candleTime: Date.now(),
          details: `TEST EVENT: Price ($67,450.25) reached Lower Band ($67,500.00) [Oversold / Support Test]`,
        },
      ],
      bot,
      "15m"
    );
  } else if (alertType === "rsi") {
    console.log(`Sending mock RSI alert for ${pair}...`);
    sent = await renderRSISignal(
      pair,
      [
        {
          type: "RSI Oversold",
          time: Date.now(),
          price: 67450.25,
          rsi: 24.5,
          details: `TEST EVENT: RSI is at 24.50 (Oversold)`,
        },
      ],
      bot,
      "15m"
    );
  } else if (alertType === "ema") {
    console.log(`Sending mock EMA Cross alert for ${pair}...`);
    sent = await renderEMASignal(
      pair,
      [
        {
          type: "EMA crossover 20/50",
          time: Date.now(),
          price: 67450.25,
          details: `TEST EVENT: 20 EMA crossed above 50 EMA`,
        },
      ],
      bot,
      "15m"
    );
  } else {
    console.log(`Unknown alert type: ${alertType}. Choose from 'bb', 'rsi', or 'ema'.`);
    process.exit(1);
  }

  console.log(`Successfully sent ${sent} notification(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error sending mock alert:", err);
  process.exit(1);
});
