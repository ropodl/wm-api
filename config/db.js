import mongoose from "mongoose";
import "dotenv/config"

console.log(process.env.DB_ADDRESS,'adsadasd');

mongoose
  .connect(process.env.DB_ADDRESS)
  .then(() => {
    console.log("DB is connected");
  })
  .catch((err) => {
    console.log("DB connection is failed", err);
  });