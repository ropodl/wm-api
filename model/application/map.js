import mongoose from "mongoose";

const mapSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    iframe: { type: String, trim: true, required: true },
    status: { type: String, required: true, enum: ["Draft", "Published"] },
  },
  {
    name: "map",
    timestamps: true,
  }
);

export default mapSchema;
