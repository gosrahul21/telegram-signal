require("dotenv").config(); // Load environment variables
import { getIndicatorOnTimeFrame } from "../utils/helper/techincalIndicators";
import fs from "fs";
// const { Configuration, OpenAIApi } = require("openai");
import OpenAI from "openai";
// Set up OpenAI configuration
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
const OPENAI_API_KEY =
  "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";

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});
async function getTechnicalAnalysis(data: string) {
  try {
    // Construct the prompt
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

    // Send the prompt to OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Use 'gpt-3.5-turbo' if GPT-4 is not available
      messages: [
        {
          role: "system",
          content:
            "You are a financial analyst specializing in technical analysis.",
        },
        { role: "user", content: prompt },
      ],
      //   max_tokens: 500, // Adjust based on the desired response length
    });

    // Extract and return the response
    const analysis = completion.choices[0].message.content;
    // Save response to a file

    return analysis;
  } catch (error) {
    console.error("Error fetching analysis from OpenAI:", error);
    throw error;
  }
}

const main = async (symbol: string) => {
  let prompt = [
    await getIndicatorOnTimeFrame(symbol, "1M"),
    await getIndicatorOnTimeFrame(symbol, "1w"),
    await getIndicatorOnTimeFrame(symbol, "1d"),
  ].join("\n\n");
  console.log(prompt);

  const finalPrompt = `
  You are a financial analyst specializing in technical analysis.
  
  Given the following data across multiple timeframes:
  
  ${prompt}
  
 provide technical analysis with overall market prediction
.
  `;

  //   console.log(finalPrompt);
  fs.writeFileSync(`prompt_${symbol}.txt`, finalPrompt as any, "utf8");
  // Call the function and log the result
  //   getTechnicalAnalysis(prompt)
  //     .then((analysis) => {
  //       fs.writeFileSync("technical_analysis.txt", analysis as any, "utf8");
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
};

main("SUIUSDT");
