"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Define the CandleDataModal function
function CandleDataModal(apiResponse) {
    // Initialize an array to store the transformed data
    const candleDataArray = [];
    // Check if the API response is valid and contains candle data
    if (apiResponse && apiResponse.data && apiResponse.data.candles) {
        // Iterate through each candle data point in the API response
        apiResponse.data.candles.forEach((candle) => {
            // Extract the properties from each candle data point
            const timestamp = candle[0];
            const open = candle[1];
            const high = candle[2];
            const low = candle[3];
            const close = candle[4];
            const volume = candle[5];
            const openInterest = candle[6];
            // Create a CandleData object
            const candleData = {
                timestamp,
                open,
                high,
                low,
                close,
                volume,
                openInterest
            };
            // Add the CandleData object to the array
            candleDataArray.push(candleData);
        });
    }
    // Return the array of transformed candle data
    return candleDataArray;
}
exports.CandleDataModal = CandleDataModal;
