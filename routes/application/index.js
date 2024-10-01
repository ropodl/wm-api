import express from "express";
import UserSchema from "../../model/application/user.js";
import { dbHandler } from "../../middleware/system/dbHandler.js";

const router = express.Router();

router.get("/user", dbHandler, async (req, res) => {
  const users = await UserSchema.find({});

  res.json(users);
});

router.post("/user", dbHandler, async (req, res) => {
  const user = new UserSchema({ name: "test" });
  await user.save();

  res.json(user);
});

export default router;
