import express from "express";
import {
  create,
  all,
  update,
} from "../../../controller/application/admin/moderation.js";

const router = express.Router();

router.get("/", all);

router.post("/", create);

router.patch("/", update);

export default router;
