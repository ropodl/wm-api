import mongoose from "mongoose";

const PostSchema = mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true },
    excerpt: { type: String, trim: true },
    content: { type: String, trim: true, required: true },
    featuredImage: { type: Object, url: String, name: String },
    status: { type: String, required: true, enum: ["Draft", "Published"] },
    keywords: [
      { type: mongoose.Schema.Types.ObjectId, ref: "interests"},
    ],
  },
  {
    name: "post",
    timestamps: true,
  }
);

export default PostSchema;
