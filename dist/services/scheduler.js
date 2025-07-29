"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../constants/symbols");
const Duration_1 = require("../types/Duration");
const signals_1 = require("./signals");
const upstoxApi_1 = require("./upstoxApi");
const schedule = __importStar(require("node-schedule"));
require("dotenv/config");
const userService_1 = __importDefault(require("./userService"));
// Import additional dependencies
// For example: messaging service, database connection, EMA calculation functions, etc.
const PriceMapping = {};
const emaShortMapping = {};
const emaLongMapping = {};
// tested-ok
async function iterateInstruments(interval, bot) {
    // Iterate through each instrument in the instrument mapping
    // Calculate the toDate as current date
    const toDate = new Date();
    // Calculate the fromDate based on the interval
    let fromDate = new Date(Date.now() - 360 * 24 * 60 * 60 * 1000);
    if (interval === Duration_1.UpstoxInterval.OneDay) {
        // For the daily interval, calculate fromDate as one year prior to the current date
        fromDate.setFullYear(toDate.getFullYear() - 1);
    }
    else {
        // For other intervals, calculate fromDate as 6 months prior to the current date
        fromDate.setMonth(toDate.getMonth() - 6);
    }
    // Format the dates to "yyyy:mm:dd" format
    const formattedToDate = formatDate(toDate);
    const formattedFromDate = formatDate(fromDate);
    for (const [instrument, symbol] of Object.entries(symbols_1.instrumentMapping)) {
        console.log({
            instrument,
            symbol,
            interval,
        });
        let historicalCandles = await upstoxApi_1.fetchCandleHistory(symbol, interval === Duration_1.UpstoxInterval.OneHour
            ? Duration_1.UpstoxInterval.ThirtyMinutes
            : interval, formattedToDate, formattedFromDate);
        const intradayCandles = await upstoxApi_1.getIntradayCandles(symbol);
        if (interval === Duration_1.UpstoxInterval.OneHour) {
            historicalCandles = [...intradayCandles, ...historicalCandles];
        }
        else if (interval === Duration_1.UpstoxInterval.OneDay) {
            historicalCandles = [
                upstoxApi_1.aggregateToDayCandle(intradayCandles),
                ...historicalCandles,
            ];
        }
        console.log(upstoxApi_1.aggregateToDayCandle(intradayCandles));
        // Calculate EMA for the instrument
        const emaShort = signals_1.calculateEMA(historicalCandles, 9); // Short period EMA (e.g., 9 periods)
        const emaLong = signals_1.calculateEMA(historicalCandles, 21); // Long period EMA (e.g., 26 periods)
        // Detect reversal based on EMA crossovers
        const reversalDetected = detectReversal(historicalCandles, emaShort, emaLong);
        if (interval === Duration_1.UpstoxInterval.OneDay) {
            const dayReport = {
                emaShort: emaShort[0],
                emaLong: emaLong[0],
                ...historicalCandles[0],
            };
            if (reversalDetected) {
                notifyUser(instrument, {
                    ...reversalDetected,
                    ...dayReport,
                }, interval, bot);
            }
            else
                notifyUser(instrument, {
                    ...dayReport,
                }, interval, bot);
        }
        else if (reversalDetected) {
            notifyUser(instrument, reversalDetected, interval, bot);
        }
        await new Promise((resolve) => setTimeout(() => resolve("one sec delay"), 1000));
    }
}
// Schedule tasks
function scheduleTasks(bot) {
    // Schedule task every hour from 9:15 AM to 3:30 PM, excluding weekends
    const cronExpressions = [
        "15 9 * * 1-5",
        "15 10 * * 1-5",
        "15 11 * * 1-5",
        "15 12 * * 1-5",
        "15 13 * * 1-5",
        "15 14 * * 1-5",
        "15 15 * * 1-5",
    ];
    // Schedule the task for each cron expression
    cronExpressions.forEach((cronExpression) => {
        schedule.scheduleJob(cronExpression, () => {
            iterateInstruments(Duration_1.UpstoxInterval.OneHour, bot);
        });
    });
    // Schedule daily report at 3 PM
    schedule.scheduleJob("30 15 * * 1-5", () => {
        iterateInstruments(Duration_1.UpstoxInterval.OneDay, bot);
    });
}
exports.scheduleTasks = scheduleTasks;
// tested-ok
// Function to format date to "yyyy:mm:dd" format
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
// Function to generate buy signals based on recent EMA values
function detectReversal(prices, emaShort, emaLong) {
    // Check for recent EMA crossovers
    const mostRecentIndex = 0; // Since the most recent values are first
    // Check for 9/21 EMA crossover
    if (emaShort[mostRecentIndex] > emaLong[mostRecentIndex] &&
        emaShort[mostRecentIndex + 1] <= emaLong[mostRecentIndex + 1]) {
        return {
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "9 EMA crossed above 21 EMA, buy/long signal",
        };
    }
    else if (emaShort[mostRecentIndex] < emaLong[mostRecentIndex] &&
        emaShort[mostRecentIndex + 1] >= emaLong[mostRecentIndex + 1]) {
        return {
            type: "EMA crossover 9/21",
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: "21 EMA crossed above 9 EMA, sell/short signal",
        };
    }
}
exports.detectReversal = detectReversal;
// Function to notify users of a given signal
async function notifyUser(symbol, signal, duration, bot) {
    // Fetch subscribed users from the user service
    const subscribedUsers = userService_1.default.getSubscribedUsers();
    // Format the signal object using the helper function
    const formattedSignal = formatSignal(signal);
    // Send notifications to each subscribed user
    for (const { chatId } of subscribedUsers) {
        if (signal) {
            await bot.api.sendMessage(chatId, `<b>Signal for ${symbol} - ${duration}</b>\n${formattedSignal}`, { parse_mode: "HTML" });
        }
    }
}
exports.notifyUser = notifyUser;
function formatSignal(signal) {
    // Initialize an array to hold formatted signal lines
    const formattedSignalLines = [];
    // Loop through each key-value pair in the signal object
    for (const [key, value] of Object.entries(signal)) {
        // Format the key and value as a line of text
        const line = `<b>${key}:</b> ${value}`;
        // Add the formatted line to the array
        formattedSignalLines.push(line);
    }
    // Join the formatted lines with newlines and return the resulting string
    return formattedSignalLines.join("\n");
}
// iterateInstruments(UpstoxInterval.OneHour)
// with the data provided, detect the reversal
