import express from "express";
import { create, all } from "../../controller/application/forum.js";
import {
  createThread,
  getThread,
  getThreadById,
  getThreadComment,
} from "../../controller/application/thread.js";

const router = express.Router();
// forums
router.post("/create", create);
// threads
router.post("/:id/threads", createThread);

router.get("/", all);
router.get("/:id/threads", getThread);
router.get("/threads/:tid", getThreadById);
router.get("/threads/:tid/comments", getThreadComment);

export default router;
