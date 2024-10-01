import mongoose from "mongoose";
import "dotenv/config";

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
};

export async function connect(id) {
  let url = process.env.DB_ADDRESS + id;
  return new Promise(async (resolve) => {
    const connection = await mongoose
      .createConnection(url, mongoOptions)
      .asPromise();
    resolve(connection);
  });
}
