import express from "express";
import { latest, slug } from "../../../controller/application/user/post.js";

const router = express.Router();

router.get("/", latest);
router.get("/:slug", slug);

export default router;
