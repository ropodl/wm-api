import express from "express";
import {
  create,
  all,
  userById,
  update,
} from "../../controller/application/user.js";

const router = express.Router();

router.post("/", create);

router.get("/:id", userById);
router.get("/", all);

router.patch("/:id", update);

export default router;
