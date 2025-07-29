import express from 'express';
import 'dotenv/config';
// import connectToDb from './models/connection';
import { initializeBot } from './services/bot';
import { CoindcxService } from './services/coindcxServices/CoindcxService';
function init() {
    // connectToDb();
    initializeBot();
}

const coindcxService = new CoindcxService();

// coindcxService.getOrders({
//     status: "filled",
//     side: "sell",
//     page: "1",
//     size: "1",
//     margin_currency_short_name: [ "USDT"],
// }).then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// });

// coindcxService.getPositions().then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// });


coindcxService.createFuturesOrder({
    side: "sell",
    pair: "B-SOL_USDT",  // Using the correct pair format for Coindcx
    order_type: "stop_market",
    price: 100,
    stop_price:100,
    total_quantity: 1,  // You can adjust this quantity as needed
    leverage: 1,        // Default leverage
    notification: "email_notification",
    time_in_force: "good_till_cancel",
    margin_currency_short_name: "USDT",
    position_margin_type: "isolated"
  }).then((res) => {
    console.log(res);
  }).catch((err) => {
    console.log(err);
  });


// coindcxService.cancelOrder({
//     orderId: '24bbbd8c-4f18-405e-8fca-aee62a1e8df2',
// }).then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// });
