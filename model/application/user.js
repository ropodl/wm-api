import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("user",UserSchema);
