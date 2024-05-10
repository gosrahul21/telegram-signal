import { Duration } from "../types/Duration";
import axios from 'axios';

// Function to fetch candle data from the Coindcx API
export async function fetchCandleData(pair: string, interval: Duration) {
    try {
        const url = `https://public.coindcx.com/market_data/candles/?pair=${pair}&interval=${interval}`;
        const response: any = await axios.get(url);
        const data = await response.data;
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function fetchTickerPrice() {
    const url = `https://api.coindcx.com/exchange/ticker/`;
    const response: any = await axios.get(url);
    const data = await response.data;
    return data;
}
