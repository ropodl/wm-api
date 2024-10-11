import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
import all_routes from "express-list-endpoints";
import "express-async-errors";

import { errorHandler, handleNotFound } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import "dotenv/config";

const app = express();

app.use("/uploads/", express.static("uploads"));
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(helmet());
app.use(compression({ level: 9 }));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Sample route
app.get("/rrr", (req, res) => {
  const largeResponse = "Hello World!".repeat(1000); // Example of a large response
  res.send(largeResponse);
});
app.use("/api/v1", routes);
app.get("/get-all-routes", (req, res) => {
  console.log(all_routes(app));
  res.json("Open console to see all routes");
});

// default catch all handler
app.use("/*", handleNotFound);
app.use(errorHandler);
// Host app
if (process.env.APP_PORT) {
  app.listen(process.env.APP_PORT, (error) => {
    if (error) console.log(error);
    console.log(`localhost:${process.env.APP_PORT}`);
  });
}

export default app;
