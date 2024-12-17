import express from "express";
import {
  create,
  all,
  getForumById,
  update,
} from "../../controller/application/forum.js";
import {
  createThread,
  getThread,
  getThreadById,
  getThreadComment,
} from "../../controller/application/thread.js";
import { uploadImage } from "../../middleware/application/multer.js";

const router = express.Router();
// forums
router.post("/create", uploadImage.single("image"), create);
router.patch("/:id", uploadImage.single("image"), update);
// threads
router.post("/:id/threads", createThread);

router.get("/", all);
router.get("/:id", getForumById);
router.get("/:id/threads", getThread);
router.get("/threads/:tid", getThreadById);
router.get("/threads/:tid/comments", getThreadComment);

export default router;
