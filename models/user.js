import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    role: {
      type: String,
      required: true,
      enum: ["SuperAdmin", "Admin", "Editor", "User"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ name: "user" });

export default mongoose.model("User", userSchema);
