import mongoose from "mongoose";

const TenantInfoSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    sub: { type: String, trim: true, required: true }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("tenant", TenantInfoSchema)