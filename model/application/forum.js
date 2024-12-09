import mongoose from "mongoose";

const forumSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: Object, url: String, name: String },
  },
  {
    timestamps: true,
  }
);

export default forumSchema;
