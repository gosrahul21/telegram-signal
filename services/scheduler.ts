import { Bot } from "grammy";
import { instrumentMapping } from "../constants/symbols";
import { UpstoxInterval } from "../types/Duration";
import { calculateEMA } from "./signals";
import { aggregateToDayCandle, fetchCandleHistory, getIntradayCandles } from "./upstoxApi";
import * as  schedule from 'node-schedule'
import 'dotenv/config'
import userService from "./userService";

// Import additional dependencies
// For example: messaging service, database connection, EMA calculation functions, etc.

const PriceMapping: Record<string, any> = {};
const emaShortMapping: Record<string, any> = {};
const emaLongMapping: Record<string, any> = {};

// tested-ok
async function iterateInstruments(interval: UpstoxInterval, bot: Bot) {
    // Iterate through each instrument in the instrument mapping
    // Calculate the toDate as current date
    const toDate = new Date();

    // Calculate the fromDate based on the interval
    let fromDate = new Date(Date.now() - 360 * 24 * 60 * 60 * 1000);

    if (interval === UpstoxInterval.OneDay) {
        // For the daily interval, calculate fromDate as one year prior to the current date
        fromDate.setFullYear(toDate.getFullYear() - 1);
    } else {
        // For other intervals, calculate fromDate as 6 months prior to the current date
        fromDate.setMonth(toDate.getMonth() - 6);
    }

    // Format the dates to "yyyy:mm:dd" format
    const formattedToDate = formatDate(toDate);
    const formattedFromDate = formatDate(fromDate);
    for (const [instrument, symbol] of Object.entries(instrumentMapping)) {
        console.log({
            instrument,
            symbol,
            interval
        })
        let historicalCandles = await fetchCandleHistory(symbol as string, interval === UpstoxInterval.OneHour ? UpstoxInterval.ThirtyMinutes : interval, formattedToDate, formattedFromDate);
        const intradayCandles = await getIntradayCandles(symbol);
        if (interval === UpstoxInterval.OneHour) {
            historicalCandles = [
                ...intradayCandles,
                ...historicalCandles
            ]
        } else if (interval === UpstoxInterval.OneDay) {
            historicalCandles = [
                aggregateToDayCandle(intradayCandles),
                ...historicalCandles
            ]
        }
        console.log(aggregateToDayCandle(intradayCandles))
        // Calculate EMA for the instrument
        const emaShort = calculateEMA(historicalCandles, 9); // Short period EMA (e.g., 9 periods)
        const emaLong = calculateEMA(historicalCandles, 21); // Long period EMA (e.g., 26 periods)
        // Detect reversal based on EMA crossovers
        const reversalDetected = detectReversal(historicalCandles, emaShort, emaLong);

        if (interval === UpstoxInterval.OneDay) {
            const dayReport = {
                emaShort: emaShort[0],
                emaLong: emaLong[0],
                ...historicalCandles[0]
            }
            if (reversalDetected) {
                notifyUser(instrument, ({
                    ...reversalDetected,
                    ...dayReport,
                }), interval, bot);
            } else
                notifyUser(instrument, ({
                    ...dayReport,
                }), interval, bot);
        } else if (reversalDetected) {
            notifyUser(instrument, reversalDetected, interval, bot);
        }

        await new Promise((resolve) => setTimeout(() => resolve("one sec delay"), 1000));
    }
}

// Schedule tasks
export function scheduleTasks(bot: Bot) {
    // Schedule task every hour from 9:15 AM to 3:30 PM, excluding weekends
    schedule.scheduleJob('30 15 * * 1-5', () => {
        iterateInstruments(UpstoxInterval.OneHour, bot);
    });

    // Schedule daily report at 3 PM
    schedule.scheduleJob('30 15 * * 1-5', () => {
        iterateInstruments(UpstoxInterval.OneDay, bot)
    });
}

// tested-ok
// Function to format date to "yyyy:mm:dd" format
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to generate buy signals based on recent EMA values
export function detectReversal(
    prices: any,
    emaShort: Array<number>,
    emaLong: Array<number>,
) {
    // Check for recent EMA crossovers
    const mostRecentIndex = 0; // Since the most recent values are first

    // Check for 9/21 EMA crossover
    if (emaShort[mostRecentIndex] > emaLong[mostRecentIndex] &&
        emaShort[mostRecentIndex + 1] <= emaLong[mostRecentIndex + 1]) {
        return ({
            type: 'EMA crossover 9/21',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: '9 EMA crossed above 21 EMA, buy/long signal'
        });
    }
    else if (emaShort[mostRecentIndex] < emaLong[mostRecentIndex] &&
        emaShort[mostRecentIndex + 1] >= emaLong[mostRecentIndex + 1]) {
        return ({
            type: 'EMA crossover 9/21',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: '21 EMA crossed above 9 EMA, sell/short signal'
        });
    }
}


// Function to notify users of a given signal
export async function notifyUser(symbol: string, signal: any, duration: UpstoxInterval, bot: Bot) {
    // Fetch subscribed users from the user service
    const subscribedUsers = userService.getSubscribedUsers();

    // Format the signal object using the helper function
    const formattedSignal = formatSignal(signal);

    // Send notifications to each subscribed user
    for (const { chatId } of subscribedUsers) {
        if (signal) {
            await bot.api.sendMessage(
                chatId,
                `<b>Signal for ${symbol} - ${duration}</b>\n${formattedSignal}`,
                { parse_mode: "HTML" }
            );
        }
    }
}

function formatSignal(signal: any): string {
    // Initialize an array to hold formatted signal lines
    const formattedSignalLines: string[] = [];

    // Loop through each key-value pair in the signal object
    for (const [key, value] of Object.entries(signal)) {
        // Format the key and value as a line of text
        const line = `<b>${key}:</b> ${value}`;
        // Add the formatted line to the array
        formattedSignalLines.push(line);
    }

    // Join the formatted lines with newlines and return the resulting string
    return formattedSignalLines.join('\n');
}

// iterateInstruments(UpstoxInterval.OneHour)

// with the data provided, detect the reversal 
