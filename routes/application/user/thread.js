import express from "express";
import {
  create,
  downvote,
  upvote,
} from "../../../controller/application/user/thread.js";

const router = express.Router();

router.post("/:id", create);

router.patch("/:id/up", upvote);
router.patch("/:id/down", downvote);

export default router;
