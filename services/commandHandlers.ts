import { Context } from "grammy";
import { keyPairsMapping } from "../utils/constants";
import { checkIfPriceNearEma, generateSignal, getTrendStatus } from "./signals";
const subscribed: string[] = [];
const fallbackKeyPairs = [
  'BTCUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'ETHUSDT',
];
export const renderSignal = async (pairName: string, signals: any, ctx: any, duration: string)=>{
  for (const signal of await signals) {
    await ctx.reply(
      `<b>Signal for ${pairName} - ${duration} </b>\nType: ${signal.type}\nTime: ${signal.time}\nPrice: ${signal.price}\nDetails: ${signal.details}`,
      { parse_mode: "HTML" }
    );
  }
}

const subscribe = async (pairName: string, ctx: Context) => {
  
  const signalOneHr = await generateSignal(pairName, '1h');
  const signalFourHr = await generateSignal(pairName, '4h');
  const signalDaily =await generateSignal(pairName, '1d');

  setInterval(async () => {
    const signalOneHr = await generateSignal(pairName, '1h');
    renderSignal(pairName, signalOneHr, ctx, '1h');
  }, 60 * 60 * 1000);

  setInterval(async () => {
    const signalFourHr = await generateSignal(pairName, '4h');
    renderSignal(pairName, signalFourHr, ctx, '4h');
  }, 4 * 60 * 60 * 1000);

  setInterval(async () => {
    const signalDaily =await generateSignal(pairName, '1d');
    renderSignal(pairName, signalDaily, ctx, '1d');
  }, 24 * 60 * 60 * 1000);
};

export const onSubscribe = (ctx: any)=>{
    const keyName = ctx.match;
    const pairName = (keyPairsMapping as any)[keyName];
    if(pairName)
      return subscribeToCrytoPrice(ctx, pairName, keyName);
    [
      'BTCUSDT', 
      'SOLUSDT',
      'BNBUSDT',
      'ETHUSDT'
    ].map((pair)=>{
      subscribeToCrytoPrice(ctx, (keyPairsMapping as any)[pair],pair )
    })
}

const subscribeToCrytoPrice = (ctx: any, pairName: string, keyName: string)=>{
  if(pairName && !subscribed.includes(pairName)){
    subscribed.push((keyPairsMapping as any)[keyName])
    subscribe(pairName, ctx);
    ctx.reply(`${keyName} subscribed successfully`);
  }
  else if(subscribed.includes(pairName)){
    ctx.reply(`${keyName} already susbcribed`);
  }
  else 
   ctx.reply(`No keypair matched`);
}

export const hourStatus = async (ctx: any)=>{
  const keyName = ctx.match;
  const pariName = (keyPairsMapping as any)[keyName];
  const duration = '1h';
  if (!pariName) {
    return fallbackKeyPairs.forEach((fallbackPair) => {
      getStatus(ctx,  fallbackPair, '1h');
    });
  }
await  getStatus(ctx, keyName, duration);
}

export const fourHourStatus = async (ctx: any) => {
  const keyName = ctx.match;
  const pairName = keyPairsMapping[keyName];

  // If pairName is not found in keyPairsMapping, use fallback key pairs
  if (!pairName) {
    fallbackKeyPairs.forEach((fallbackPair: string) => {
      getStatus(ctx,  fallbackPair, '4h');
    });
    return;
  }

  // If pairName is found, proceed with getting the status
  await getStatus(ctx, keyName, '4h');
};

// Function to get the daily status
export const dayStatus = async (ctx: any) => {
  const keyName = ctx.match;
  const pairName = keyPairsMapping[keyName];

  // If pairName is not found in keyPairsMapping, use fallback key pairs
  if (!pairName) {
    fallbackKeyPairs.forEach((fallbackPair) => {
      getStatus(ctx,  fallbackPair, '1d');
    });
    return;
  }

  // If pairName is found, proceed with getting the status
  await getStatus(ctx, keyName, '1d');
};

export const getStatus = async (ctx: any, keyName: string, duration: '1h'|'4h'|'1d')=>{
  const pariName = (keyPairsMapping as any)[keyName];
  const signal = await  getTrendStatus(pariName, duration);
  renderSignal(pariName, signal,ctx,duration );
}

