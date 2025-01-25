import express from "express";
import {
  latest,
  slug,
  recommendation,
} from "../../../controller/application/user/post.js";
import { isAuth } from "../../../middleware/application/user.js";

const router = express.Router();

router.get("/", isAuth, latest);
router.get("/recommendation", isAuth, recommendation);
router.get("/:slug", slug);

export default router;
