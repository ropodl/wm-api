import mongoose from "mongoose";

const feedbackSchema = mongoose.Schema({
  title: { type: String, trim: true, required: true },
  suggestions: { type: String, trim: true, required: true },
  ratings: {
    type: Object,
    ui: Number,
    navigation: Number,
    performance: Number,
    content: Number,
  },
});

export default feedbackSchema;
