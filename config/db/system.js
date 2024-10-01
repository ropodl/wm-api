import mongoose from "mongoose";
import "dotenv/config";

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
};

mongoose
  .connect(process.env.DB_ADDRESS+"system")
  .then(() => {
    console.log("DB is connected");
  })
  .catch((err) => {
    console.log("DB connection is failed", err);
  });