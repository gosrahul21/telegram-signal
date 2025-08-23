"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const techincalIndicators_1 = require("../utils/helper/techincalIndicators");
const fs_1 = require("fs");
const openai_1 = require("openai");
const OPENAI_API_KEY = "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";
const client = new openai_1.default({
    apiKey: OPENAI_API_KEY,
});
async function getTechnicalAnalysis(data) {
    try {
        const prompt = `
    You are a financial analyst specializing in technical analysis.
    
    Given the following data across multiple timeframes:
    
    ${data}
    
    Provide a concise analysis with:
    - **Trend Direction**: Bullish, Bearish, or Sideways.
    - **Key Buy/Sell Signals**: Based on MACD, RSI, and EMAs.
    - **Optimal Entry & Exit**: Entry price, stop loss, and take profit.
    - **Risk Warnings**: Any divergences or trend reversals.
    
    Keep responses **brief, actionable, and data-driven**.
    `;
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a financial analyst specializing in technical analysis.",
                },
                { role: "user", content: prompt },
            ],
        });
        const analysis = completion.choices[0].message.content;
        return analysis;
    }
    catch (error) {
        console.error("Error fetching analysis from OpenAI:", error);
        throw error;
    }
}
const main = async (symbol) => {
    let prompt = [
        await (0, techincalIndicators_1.getIndicatorOnTimeFrame)(symbol, "1M"),
        await (0, techincalIndicators_1.getIndicatorOnTimeFrame)(symbol, "1w"),
        await (0, techincalIndicators_1.getIndicatorOnTimeFrame)(symbol, "1d"),
    ].join("\n\n");
    console.log(prompt);
    const finalPrompt = `
  You are a financial analyst specializing in technical analysis.
  
  Given the following data across multiple timeframes:
  
  ${prompt}
  
 provide technical analysis with overall market prediction
.
  `;
    fs_1.default.writeFileSync(`prompt_${symbol}.txt`, finalPrompt, "utf8");
};
main("SUIUSDT");
//# sourceMappingURL=openai.js.map