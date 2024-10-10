import express from "express";
import { all, create } from "../../controller/application/post.js";
import { uploadImage } from "../../middleware/application/multer.js"

const router = express.Router();

router.get("/", all);

router.post("/", uploadImage.single("file"), create);

export default router;