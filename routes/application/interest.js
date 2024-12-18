import express from "express";
import {
  create,
  all,
  addUserInterest,
} from "../../controller/application/interest.js";

const router = express.Router();

router.get("/", all);

router.post("/", create);
router.patch("/add-user-interest", addUserInterest);

export default router;
