import express from "express";
import user from "./user/index.js";
import post from "./post.js";
import interest from "./interest.js";
import auth from "./auth.js";
import forum from "./forum.js";
import feedback from "./feedback.js";
import admin from "./admin/index.js";
import map from "./admin/map.js";

const router = express.Router();

router.use("/admin", admin);

router.use("/user", user);

router.use("/auth", auth);

router.use("/post", post);

router.use("/interest", interest);

router.use("/forums", forum);

router.use("/map", map);

router.use("/feedback", feedback);

export default router;
