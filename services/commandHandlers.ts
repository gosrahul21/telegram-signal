import { Context } from "grammy";
import { keyPairsMapping } from "../utils/constants";
import { checkIfPriceNearEma, generateSignal } from "./signals";
const subscribed: string[] = [];

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
  renderSignal(pairName, signalOneHr, ctx, '1h');


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

export const onSubscribe =  (ctx: any)=>{
    const keyName = ctx.match;
    const pariName = (keyPairsMapping as any)[keyName]
    if(pariName && !subscribed.includes(pariName)){
      subscribed.push((keyPairsMapping as any)[keyName])
      subscribe(pariName, ctx);
      ctx.reply(`${keyName} subscribed successfully`);
    }
    else if(subscribed.includes(pariName)){
      ctx.reply(`${keyName} already susbcribed`);
    }
    else 
     ctx.reply(`No keypair matched`);
  }


// export const listenAveragePrice = ()=>{
//   checkIfPriceNearEma
// }


