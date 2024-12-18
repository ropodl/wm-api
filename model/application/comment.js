import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    thread: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "thread",
      required: true,
    },
    content: { type: String, required: true },
    upvote: { type: Number, default: 0 },
    downvote: { type: Number, default: 0 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    isSpam: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default commentSchema;
