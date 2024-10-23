import express from "express";
import user from "./user.js";
import post from "./post.js"
import interest from "./interest.js"

const router = express.Router();

router.use("/user", user);

router.use("/post", post);

router.use("/interest", interest);

export default router;
