import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true },
    excerpt: { type: String, trim: true },
    content: { type: String, trim: true, required: true },
    image: { type: Object, url: String, name: String },
    status: { type: String, required: true, enum: ["Draft", "Published"] },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "interests",
        required: true,
      },
    ],
  },
  {
    name: "post",
    timestamps: true,
  }
);

export default postSchema;
