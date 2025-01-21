import express from "express";
import {
  create,
  all,
  id,
  remove,
  search,
} from "../../../controller/application/admin/map.js";

const router = express.Router();

router.post("/", create);

router.get("/", all);
router.get("/:id", id);
router.get("/search", search);

router.delete("/:id", remove);

export default router;
