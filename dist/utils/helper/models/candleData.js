"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandleDataModal = CandleDataModal;
function CandleDataModal(apiResponse) {
    const candleDataArray = [];
    if (apiResponse && apiResponse.data && apiResponse.data.candles) {
        apiResponse.data.candles.forEach((candle) => {
            const timestamp = candle[0];
            const open = candle[1];
            const high = candle[2];
            const low = candle[3];
            const close = candle[4];
            const volume = candle[5];
            const openInterest = candle[6];
            const candleData = {
                closeTime: timestamp,
                open,
                high,
                low,
                close,
                volume,
                openInterest
            };
            candleDataArray.push(candleData);
        });
    }
    return candleDataArray;
}
//# sourceMappingURL=candleData.js.map