import { Duration } from "../types/Duration";


// Function to fetch candle data from the Coindcx API
export async function fetchCandleData(pair: string, interval: Duration) {
    const url = `https://public.coindcx.com/market_data/candles/?pair=${pair}&interval=${interval}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

export async function fetchTickerPrice() {
    const url = `https://api.coindcx.com/exchange/ticker/`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}