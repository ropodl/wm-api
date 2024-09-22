import mongoose from "mongoose";
import "dotenv/config"

mongoose
  .connect(process.env.DB_ADDRESS,{
      useNewUrlParser: true,
      useUnifiedTopology: true
  })
  .then(() => {
    console.log("DB is connected");
  })
  .catch((err) => {
    console.log("DB connection is failed", err);
  });