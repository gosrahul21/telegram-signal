// Import the CandleData interface
export interface CandleData {
    timestamp: string;  // The start time of the candle's timeframe in ISO format
    open: number;       // The opening price of the asset for the given timeframe
    high: number;       // The highest price at which the asset traded during the timeframe
    low: number;        // The lowest price at which the asset traded during the timeframe
    close: number;      // The closing price of the asset for the given timeframe
    volume: number;     // The total amount of the asset that was traded during the timeframe
    openInterest: number; // The total number of outstanding derivative contracts (e.g., options, futures)
}

// Define the CandleDataModal function
export function CandleDataModal(apiResponse: any): CandleData[] {
    // Initialize an array to store the transformed data
    const candleDataArray: CandleData[] = [];

    // Check if the API response is valid and contains candle data
    if (apiResponse && apiResponse.data && apiResponse.data.candles) {
        // Iterate through each candle data point in the API response
        apiResponse.data.candles.forEach((candle: any[]) => {
            // Extract the properties from each candle data point
            const timestamp: string = candle[0];
            const open: number = candle[1];
            const high: number = candle[2];
            const low: number = candle[3];
            const close: number = candle[4];
            const volume: number = candle[5];
            const openInterest: number = candle[6];

            // Create a CandleData object
            const candleData: CandleData = {
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

