import mongoose from "mongoose";

const forumSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: Object, url: String, name: String },
    status: { type: String, required: true, enum: ["Draft", "Published"] },
    threads: {
      type: Array,
      required: false,
    },
  },
  {
    name: "forum",
    timestamps: true,
  }
);

export default forumSchema;
