"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// create order
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const crypto = __importStar(require("crypto"));
exports.createOrder = async (side, quantity, price, SYMBOL) => {
    try {
        const payload = {
            symbol: SYMBOL,
            side: side,
            type: "MARKET",
            timeInForce: "GTC",
            quantity: quantity,
            price: price,
            timestamp: Date.now(),
        };
        const response = await axios_1.default.post(`${config_1.default ? .BINANCE_API_URL : }/api/v3/order`, null, {
            headers: {
                "X-MBX-APIKEY": config_1.default ? .API_KEY : ,
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
        console.error("Error placing order:", error);
    }
};
// generate query string
function getQueryString(payload) {
    let queryString = "";
    Object.keys(payload).map((key) => {
        if (!queryString)
            queryString = `${key}=${payload[key]}`;
        else
            queryString += `&${key}=${payload[key]}`;
    });
    return queryString;
}
// Function to generate the request signature
function generateSignature(queryString) {
    // generate queryString from payload
    const signature = crypto
        .createHmac("sha256", config_1.default ? .API_SECRET : )
        .update(queryString)
        .digest("hex");
    console.log({ signature });
    return signature;
}
