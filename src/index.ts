import "dotenv/config";
import express from "express";
const app = express();
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});
// import connectToDb from './models/connection';
import { initializeBot } from "./bot/bot";
import axios from "axios";
import connectToDatabase from "./models/connection";
function init() {
  connectToDatabase();
  initializeBot();
}

init();

// own service call to make backend alive for render

setInterval(async () => {
  try {
    const response = await axios.get(
      "https://telegram-signal-suva.onrender.com/"
    );
    // console.log(response.data);
  } catch (error) {
    console.log("error on making self request", error);
  }
}, 1000 * 60 * 10);
