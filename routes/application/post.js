import express from "express";
import { all, create, getRecommendedPosts } from "../../controller/application/post.js";
import { uploadImage } from "../../middleware/application/multer.js"

const router = express.Router();

router.get("/", all);
router.get("/r", getRecommendedPosts)

router.post("/", uploadImage.single("image"), create);

export default router;