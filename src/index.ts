import "dotenv/config";
import express from "express";
import init from "./services/init";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});

init();


