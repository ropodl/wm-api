import UserSchema from "../../model/system/lord.js";
import { sendError } from "../../utils/error.js";
import jwt from "jsonwebtoken";
import "dotenv";

export const create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await UserSchema.findOne({ email });
  if (oldUser)
    return sendError(res, "User with email address already exists.", 404);

  const user = new UserSchema({ name, email, password });
  const { id } = await user.save();

  res.status(200).json({
    success: true,
    user: {
      id,
      name,
      email,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await UserSchema.findOne({ email });
  if (!user) return sendError(res, "Email/Password do not match");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email/Password do not match");

  const token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);

  res.json({
    token,
  });
};

export const me = async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) return sendError(res, "Invalid token");

  const token = authorization.split("Bearer ")[1];
  if (!token) return sendError(res, "Invalid Token");

  const { userId } = jwt.verify(token, process.env.APP_SECRET);
  const user = await UserSchema.findById(userId);
  if (!user) return sendError(res, "Invalid Token, User not found", 404);

  const { name, email, image } = user;

  res.json({
    name,
    email,
    image,
  });
};
