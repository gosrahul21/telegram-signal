import "dotenv/config";
import express from "express";
// import connectToDb from './models/connection';
import { initializeBot } from "./bot/bot";
import axios from "axios";
import connectToDatabase from "./models/connection";


const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});

function init() {
  connectToDatabase();
  initializeBot();
}

init();

// own service call to make backend alive for render

setInterval(async () => {
  try {
    await axios.get("https://telegram-signal-suva.onrender.com/");
  } catch (error) {
    console.log("error on making self request", error);
  }
}, 1000 * 60 * 10);
