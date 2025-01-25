import express from "express";
import {
  latest,
  slug,
  recommendation,
} from "../../../controller/application/user/post.js";

const router = express.Router();

router.get("/", latest);
router.get("/recommendation", recommendation);
router.get("/:slug", slug);

export default router;
