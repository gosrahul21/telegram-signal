"use strict";
exports.__esModule = true;
// Define the CandleDataModal function
function CandleDataModal(apiResponse) {
    // Initialize an array to store the transformed data
    var candleDataArray = [];
    // Check if the API response is valid and contains candle data
    if (apiResponse && apiResponse.data && apiResponse.data.candles) {
        // Iterate through each candle data point in the API response
        apiResponse.data.candles.forEach(function (candle) {
            // Extract the properties from each candle data point
            var timestamp = candle[0];
            var open = candle[1];
            var high = candle[2];
            var low = candle[3];
            var close = candle[4];
            var volume = candle[5];
            var openInterest = candle[6];
            // Create a CandleData object
            var candleData = {
                timestamp: timestamp,
                open: open,
                high: high,
                low: low,
                close: close,
                volume: volume,
                openInterest: openInterest
            };
            // Add the CandleData object to the array
            candleDataArray.push(candleData);
        });
    }
    // Return the array of transformed candle data
    return candleDataArray;
}
exports.CandleDataModal = CandleDataModal;
