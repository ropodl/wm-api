import express from "express";
import user from "./user.js";
import post from "./post.js";
import interest from "./interest.js";
import auth from "./auth.js";
import forum from "./forum.js";

const router = express.Router();

router.use("/user", user);

router.use("/auth", auth);

router.use("/post", post);

router.use("/interest", interest);

router.use("/forums", forum);

export default router;
