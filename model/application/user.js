import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    password: { type: String, required: true },
    phone_number: { type: Number, required: true },
    user_name: { type: String, trim:true, required: true },
    role: {
      type: String,
      required: false,
      enum: ["admin", "editor", "user"],
      default: "user",
    },
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: "interests", required: false }],
    image: { type: Object, url: String, name: String },
  },
  {
    name: "user",
    timestamps: true,
  },
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

export default UserSchema;
