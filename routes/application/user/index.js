import express from "express";
import post from "./post.js";
import feedback from "./feedback.js";
import map from "./map.js";
import thread from "./thread.js";

const router = express.Router();

router.use("/post", post);

router.use("/feedback", feedback);

router.use("/map", map);

router.use("/thread", thread);

export default router;
