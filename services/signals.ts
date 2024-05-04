import { fetchCandleData } from "./priceApi";
const ema = require('exponential-moving-average');

interface CandleData {
    open: number;
    high: number;
    low: number;
    volume: number;
    close: number;
    time: number; // Time as a timestamp in milliseconds
}

function calculateEMA(candlePrices: CandleData[], duration: number){
    const arr = candlePrices.map((candle:any)=>candle.close);
    return ema(arr, duration)
};


const symbol= [
    "B-LQTY_USDT",
    "B-ENA_USDT",
    "B-TNSR_USDT",
    "B-SAGA_USDT",
    "B-LINK_USDT",
    "B-XLM_USDT",
    "B-ADA_USDT",
    "B-XMR_USDT",
    "B-LEVER_USDT",
    "B-RDNT_USDT",
    "B-BOND_USDT",
    "B-BTC_USDT",
    "B-DASH_USDT",
    "B-W_USDT",
    "B-TAO_USDT",
    "B-ETH_USDT",
    "B-RLC_USDT",
    "B-XRP_USDT",
    "B-ETC_USDT",
    "B-ZEC_USDT",
    "B-ATOM_USDT",
    "B-ALGO_USDT",
    "B-ZIL_USDT",
    "B-KNC_USDT",
    "B-ONT_USDT",
    "B-IOTA_USDT",
    "B-VET_USDT",
    "B-THETA_USDT",
    "B-DOGE_USDT",
    "B-CVX_USDT",
    "B-WAVES_USDT",
    "B-TLM_USDT",
    "B-SXP_USDT",
    "B-KAVA_USDT",
    "B-BAND_USDT",
    "B-MKR_USDT",
    "B-SNX_USDT",
    "B-RSR_USDT",
    "B-MATIC_USDT",
    "B-CHZ_USDT",
    "B-SAND_USDT",
    "B-ANKR_USDT",
    "B-LIT_USDT",
    "B-UNFI_USDT",
    "B-REEF_USDT",
    "B-RVN_USDT",
    "B-ZRX_USDT",
    "B-COMP_USDT",
    "B-OMG_USDT",
    "B-DOT_USDT",
    "B-DEFI_USDT",
    "B-YFI_USDT",
    "B-SOL_USDT",
    "B-AAVE_USDT",
    "B-FIL_USDT",
    "B-SFP_USDT",
    "B-XEM_USDT",
    "B-NEO_USDT",
    "B-QTUM_USDT",
    "B-IOST_USDT",
    "B-BAL_USDT",
    "B-TRB_USDT",
    "B-RUNE_USDT",
    "B-SUSHI_USDT",
    "B-EGLD_USDT",
    "B-COTI_USDT",
    "B-CHR_USDT",
    "B-ICX_USDT",
    "B-STORJ_USDT",
    "B-HOOK_USDT",
    "B-PERP_USDT",
    "B-AVAX_USDT",
    "B-FTM_USDT",
    "B-TRU_USDT",
    "B-ENJ_USDT",
    "B-FLM_USDT",
    "B-REN_USDT",
    "B-NEAR_USDT",
    "B-MANA_USDT",
    "B-ALICE_USDT",
    "B-ICP_USDT",
    "B-BCH_USDT",
    "B-OCEAN_USDT",
    "B-BEL_USDT",
    "B-AXS_USDT",
    "B-GRT_USDT",
    "B-1INCH_USDT",
    "B-HBAR_USDT",
    "B-APT_USDT",
    "B-LTC_USDT",
    "B-TRX_USDT",
    "B-DYDX_USDT",
    "B-1000XEC_USDT",
    "B-GALA_USDT",
    "B-CELO_USDT",
    "B-AR_USDT",
    "B-DENT_USDT",
    "B-CELR_USDT",
    "B-KLAY_USDT",
    "B-ARPA_USDT",
    "B-GMT_USDT",
    "B-APE_USDT",
    "B-WOO_USDT",
    "B-LDO_USDT",
    "B-GTC_USDT",
    "B-BTCDOM_USDT",
    "B-AUDIO_USDT",
    "B-SEI_USDT",
    "B-C98_USDT",
    "B-DUSK_USDT",
    "B-API3_USDT",
    "B-QNT_USDT",
    "B-FXS_USDT",
    "B-HFT_USDT",
    "B-MASK_USDT",
    "B-ATA_USDT",
    "B-JASMY_USDT",
    "B-GAL_USDT",
    "B-OP_USDT",
    "B-INJ_USDT",
    "B-STG_USDT",
    "B-SPELL_USDT",
    "B-1000LUNC_USDT",
    "B-MAGIC_USDT",
    "B-T_USDT",
    "B-RNDR_USDT",
    "B-GMX_USDT",
    "B-STX_USDT",
    "B-BNX_USDT",
    "B-SSV_USDT",
    "B-CKB_USDT",
    "B-TON_USDT",
    "B-AXL_USDT",
    "B-MYRO_USDT",
    "B-LINA_USDT",
    "B-LPT_USDT",
    "B-PEOPLE_USDT",
    "B-AMB_USDT",
    "B-STMX_USDT",
    "B-CTSI_USDT",
    "B-GLM_USDT",
    "B-PORTAL_USDT",
    "B-SNT_USDT",
    "B-KSM_USDT",
    "B-ALPHA_USDT",
    "B-SKL_USDT",
    "B-IOTX_USDT",
    "B-ROSE_USDT",
    "B-FLOW_USDT",
    "B-LUNA2_USDT",
    "B-HIGH_USDT",
    "B-METIS_USDT",
    "B-ETHFI_USDT",
    "B-ZEN_USDT",
    "B-BAKE_USDT",
    "B-ENS_USDT",
    "B-IMX_USDT",
    "B-BLZ_USDT",
    "B-LRC_USDT",
    "B-AEVO_USDT",
    "B-VANRY_USDT",
    "B-BOME_USDT",
    "B-DAR_USDT",
    "B-MINA_USDT",
    "B-ASTR_USDT",
    "B-AGIX_USDT",
    "B-PHB_USDT",
    "B-CFX_USDT",
    "B-ACH_USDT",
    "B-USDC_USDT",
    "B-ID_USDT",
    "B-ARB_USDT",
    "B-JOE_USDT",
    "B-XVS_USDT",
    "B-BLUR_USDT",
    "B-EDU_USDT",
    "B-IDEX_USDT",
    "B-SUI_USDT",
    "B-1000PEPE_USDT",
    "B-1000FLOKI_USDT",
    "B-UMA_USDT",
    "B-RAD_USDT",
    "B-KEY_USDT",
    "B-COMBO_USDT",
    "B-NMR_USDT",
    "B-MAV_USDT",
    "B-MDT_USDT",
    "B-XVG_USDT",
    "B-WLD_USDT",
    "B-PENDLE_USDT",
    "B-EOS_USDT",
    "B-ARKM_USDT",
    "B-CRV_USDT",
    "B-AGLD_USDT",
    "B-YGG_USDT",
    "B-FET_USDT",
    "B-DODOX_USDT",
    "B-BNT_USDT",
    "B-OXT_USDT",
    "B-OMNI_USDT",
    "B-CYBER_USDT",
    "B-HIFI_USDT",
    "B-ARK_USDT",
    "B-FRONT_USDT",
    "B-GLMR_USDT",
    "B-BICO_USDT",
    "B-LOOM_USDT",
    "B-BIGTIME_USDT",
    "B-ORBS_USDT",
    "B-STPT_USDT",
    "B-UNI_USDT",
    "B-WAXP_USDT",
    "B-BSV_USDT",
    "B-RIF_USDT",
    "B-POLYX_USDT",
    "B-GAS_USDT",
    "B-POWR_USDT",
    "B-SLP_USDT",
    "B-TIA_USDT",
    "B-CAKE_USDT",
    "B-MEME_USDT",
    "B-TWT_USDT",
    "B-TOKEN_USDT",
    "B-ORDI_USDT",
    "B-STEEM_USDT",
    "B-BADGER_USDT",
    "B-ILV_USDT",
    "B-NTRN_USDT",
    "B-MBL_USDT",
    "B-KAS_USDT",
    "B-BEAMX_USDT",
    "B-1000BONK_USDT",
    "B-PYTH_USDT",
    "B-SUPER_USDT",
    "B-USTC_USDT",
    "B-ONG_USDT",
    "B-ETHW_USDT",
    "B-JTO_USDT",
    "B-1000SATS_USDT",
    "B-AUCTION_USDT",
    "B-1000RATS_USDT",
    "B-ACE_USDT",
    "B-MOVR_USDT",
    "B-NFP_USDT",
    "B-AI_USDT",
    "B-XAI_USDT",
    "B-WIF_USDT",
    "B-MANTA_USDT",
    "B-ONDO_USDT",
    "B-LSK_USDT",
    "B-ALT_USDT",
    "B-JUP_USDT",
    "B-ZETA_USDT",
    "B-RONIN_USDT",
    "B-DYM_USDT",
    "B-OM_USDT",
    "B-PIXEL_USDT",
    "B-STRK_USDT",
    "B-MAVIA_USDT",
    "B-XTZ_USDT",
    "B-BNB_USDT",
    "B-BAT_USDT",
    "B-ONE_USDT",
    "B-HOT_USDT",
    "B-MTL_USDT",
    "B-OGN_USDT",
    "B-NKN_USDT",
    "B-1000SHIB_USDT"
    ];

// Function to generate buy signals based on recent EMA values
function generateCrossSignals(prices:any, ema9: Array<number>, ema21:Array<number>, ema20:Array<number>, ema50:Array<number>) {
    // Array to hold buy signals
    const signals = [];

    // Check for recent EMA crossovers
    const mostRecentIndex = 0; // Since the most recent values are first

    // Check for 9/21 EMA crossover
    if (ema9[mostRecentIndex] > ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] <= ema21[mostRecentIndex + 1]) {
            const signal = {
                type: 'EMA crossover 9/21',
                time: prices[mostRecentIndex].time,
                price: prices[mostRecentIndex].close,
                details: '9 EMA crossed above 21 EMA, buy/long signal'
            };
        signals.push(signal);
    }
    else if(ema9[mostRecentIndex] < ema21[mostRecentIndex] &&
        ema9[mostRecentIndex + 1] >= ema21[mostRecentIndex + 1]){
            signals.push({
                type: 'EMA crossover 9/21',
                time: prices[mostRecentIndex].time,
                price: prices[mostRecentIndex].close,
                details: '21 EMA crossed above 9 EMA, sell/short signal'
            }); 
        }
    else {
        signals.push({
            type: 'EMA crossover 9/21',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `${ema9[mostRecentIndex] < ema21[mostRecentIndex]?'downtren':"uptrend"}`
        }); 
    }
    

    // Check for 20/50 EMA crossover
    if (ema20[mostRecentIndex] > ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] <= ema50[mostRecentIndex + 1]) {
        signals.push({
            type: 'EMA crossover 20/50',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: '20 EMA crossed above 50 EMA'
        });
        
    }
    else if(ema20[mostRecentIndex] < ema50[mostRecentIndex] &&
        ema20[mostRecentIndex + 1] >= ema50[mostRecentIndex + 1]){
            signals.push({
                type: 'EMA crossover 20/50',
                time: prices[mostRecentIndex].time,
                price: prices[mostRecentIndex].close,
                details: '21 EMA crossed above 9 EMA, sell/short signal'
            }); 
        }
    else {
        signals.push({
            type: 'EMA crossover 20/50',
            time: prices[mostRecentIndex].time,
            price: prices[mostRecentIndex].close,
            details: `${ema9[mostRecentIndex] < ema21[mostRecentIndex]?'downtrend':"uptrend"}`
        }); 
    }
    return signals;
}

export const checkIfPriceNearEma=(prices: any, ema: any)=>{
    let signals = []
    const mostRecentIndex = 0;
        // Check if the price is near the 9 EMA
        const priceToEMA9Ratio = Math.abs(prices[mostRecentIndex].close - ema[mostRecentIndex]) / ema[mostRecentIndex];
        const proximityThreshold = 0.01; // Define a threshold (e.g., 1%) for proximity
    
        if (priceToEMA9Ratio < proximityThreshold) {
            signals.push({
                type: 'Price near 9 EMA',
                time: prices[mostRecentIndex].time,
                price: prices[mostRecentIndex].close,
                details: `Price is within ${proximityThreshold * 100}% of 9 EMA`
            });
        }
        return signals;
}

export const generateSignal = async(pairname: string, duration: '1h'|'4h'|'1d')=>{
    const candles: any = await fetchCandleData(pairname, duration);
    const ema9 = calculateEMA(candles, 9);
    const ema21 = calculateEMA(candles, 21);
    const ema20 = calculateEMA(candles, 20);
    const ema50 = calculateEMA(candles, 50);
    // Generate crossing signals based on the EMAs and candle data
    const signals = generateCrossSignals(candles, ema9, ema21, ema20, ema50);
    // Process or display the signals (you can handle the output as per your requirement)
    return signals;
}

