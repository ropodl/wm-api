import mongoose from "mongoose";

const interestSchema = mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true },
    description: { type: String, trim: true },
    status: { type: String, required: true, enum: ["Draft", "Published"] },
  },
  {
    name: "interests",
    timestamps: true,
  }
);

export default interestSchema;
