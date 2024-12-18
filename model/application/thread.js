import mongoose from "mongoose";

const threadSchema = mongoose.Schema(
  {
    forum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "forum",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    name: "thread",
    timestamps: true,
  }
);

export default threadSchema;
