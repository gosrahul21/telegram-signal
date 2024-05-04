

// Function to fetch candle data from the Coindcx API
export async function fetchCandleData(pair: string, interval: '1h' | '4h'|'6h'|'8h'| '1d') {
    const url = `https://public.coindcx.com/market_data/candles/?pair=${pair}&interval=${interval}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

