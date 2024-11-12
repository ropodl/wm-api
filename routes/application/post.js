import express from "express";
import { all, create, postId, recommended } from "../../controller/application/post.js";
import { uploadImage } from "../../middleware/application/multer.js"

const router = express.Router();

router.get("/latest", all);
router.get("/recommended/:id", recommended)
router.get("/:id", postId)

router.post("/", uploadImage.single("image"), create);

export default router;