import express from "express";
import {
  latest,
  slug,
  getSimilarPosts,
} from "../../../controller/application/user/post.js";

const router = express.Router();

router.get("/", latest);
router.get("/recommendation/:id", getSimilarPosts);
router.get("/:slug", slug);

export default router;
