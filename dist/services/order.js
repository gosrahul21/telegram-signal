"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const axios_1 = require("axios");
const config_1 = require("../utils/config");
const crypto = require("crypto");
const createOrder = async (side, quantity, price, SYMBOL) => {
    try {
        const payload = {
            symbol: SYMBOL,
            side: side,
            type: 'MARKET',
            timeInForce: 'GTC',
            quantity: quantity,
            price: price,
            timestamp: Date.now(),
        };
        const response = await axios_1.default.post(`${config_1.default?.BINANCE_API_URL}/api/v3/order`, null, {
            headers: {
                'X-MBX-APIKEY': config_1.default?.API_KEY,
            },
            params: {
                signature: generateSignature(getQueryString(payload)),
                ...payload,
            },
        });
        console.log(response.data);
        console.log(`Order placed: ${response.data.orderId}`);
        return response.data;
    }
    catch (error) {
        console.error('Error placing order:', error);
    }
};
exports.createOrder = createOrder;
function getQueryString(payload) {
    let queryString = '';
    Object.keys(payload).map((key) => {
        if (!queryString)
            queryString = `${key}=${payload[key]}`;
        else
            queryString += `&${key}=${payload[key]}`;
    });
    return queryString;
}
function generateSignature(queryString) {
    const signature = crypto
        .createHmac('sha256', config_1.default?.API_SECRET || '')
        .update(queryString)
        .digest('hex');
    console.log({ signature });
    return signature;
}
//# sourceMappingURL=order.js.map