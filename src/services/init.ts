import { initializeBot } from "../bot/bot";
import connectToDatabase from "../models/connection";
import axios from "axios";
async function init() {
  try {
    // own service call to make backend alive for render

    setInterval(
      async () => {
        try {
          await axios.get("https://telegram-signal-suva.onrender.com/");
          // console.log(response.data);
        } catch (error) {
          console.log("error on making self request", error);
        }
      },
      1000 * 60 * 10,
    );

    await connectToDatabase();
    initializeBot();
  } catch (error) {
    console.log("error on initializing bot", error);
  }
}

export default init;
