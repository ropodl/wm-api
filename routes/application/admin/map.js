import express from "express";
import {
  create,
  all,
  id,
  remove,
  update,
} from "../../../controller/application/admin/map.js";

const router = express.Router();

router.post("/", create);

router.patch("/:id", update);

router.get("/", all);
router.get("/:id", id);

router.delete("/:id", remove);

export default router;
