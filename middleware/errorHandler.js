import { sendError } from "../utils/error.js";

export function errorHandler(err, req, res, next) {
  console.log("error:", err);
  res.status(500).json({ error: err.message || err });
}

export function handleNotFound(req, res) {
  sendError(res, "Not Found", 404);
}