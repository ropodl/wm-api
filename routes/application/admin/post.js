import express from "express";
import {
  all,
  create,
  postId,
  update,
  remove,
} from "../../../controller/application/post.js";
import { uploadImage } from "../../../middleware/application/multer.js";

const router = express.Router();

router.post("/", uploadImage.single("image"), create);
router.patch("/:id", uploadImage.single("image"), update);

router.get("/latest", all);
// router.get("/recommended/:id", recommended);
router.get("/:id", postId);

router.delete("/:id", remove);

export default router;
