import express from "express";
import dashboard from "./dashboard.js";
import moderation from "./moderation.js";
import post from "./post.js";
import feedback from "./feedback.js";
import map from "./map.js";

const router = express.Router();

router.use("/dashboard", dashboard);

router.use("/moderation", moderation);

router.use("/post", post);

router.use("/feedback", feedback);

router.use("/map", map);

export default router;
