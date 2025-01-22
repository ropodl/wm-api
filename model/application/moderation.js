import mongoose from "mongoose";

const moderationSchema = mongoose.Schema(
  {
    positive: {
      type: Object,
      text: String,
      label: String,
    },
    negative: { type: Object, text: String, label: String },
    spam: { type: Object, text: String, label: String },
  },
  {
    name: "moderation",
    timestamps: true,
  }
);

export default moderationSchema;
