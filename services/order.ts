// create order 
import config from '../config'
import * as crypto from 'crypto';
export const  createOrder = (side:string , quantity: string, price: string, SYMBOL: string) =>{
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

        const response = await axios.post(
            `${config?.BINANCE_API_URL}/api/v3/order`,
            null,
            {
                headers: {
                    'X-MBX-APIKEY': config?.API_KEY,
                },
                params: {
                    signature: generateSignature(getQueryString(payload)),
                    ...payload,
                },
            }
        );
        console.log(response.data);

        console.log(`Order placed: ${response.data.orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error placing order:', error);
    }
}


// generate query string 
function getQueryString(payload: Record<string, any>) {
    let queryString = '';
    Object.keys(payload).map((key) => {
        if (!queryString)
            queryString = `${key}=${payload[key]}`;
        else
            queryString += `&${key}=${payload[key]}`
    })
    return queryString;
}

// Function to generate the request signature
function generateSignature(queryString: string) {
    // generate queryString from payload
    const signature = crypto
        .createHmac('sha256', config?.API_SECRET!)
        .update(queryString)
        .digest('hex');
    console.log({ signature });
    return signature;
}


// generate hmac signature 
// this need to be central


// delete order 


// close position 


// update stoploss, stopprofit// update order 





