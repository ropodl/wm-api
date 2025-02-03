import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    thread: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "thread",
      required: true,
    },
    content: { type: String, required: true },
    upvote: {
      count: { type: Number, default: 0 },
      by: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          default: [],
        },
      ],
    },
    downvote: {
      count: { type: Number, default: 0 },
      by: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          default: [],
        },
      ],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    isSpam: { type: Boolean, default: false },
    sentiment: {
      type: String,
      required: false,
      enum: ["positive", "negative", "neutral", "spam"],
      default: "neutral",
    },
  },
  {
    timestamps: true,
  }
);

export default commentSchema;
