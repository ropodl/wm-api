import express from "express";
import {
  create,
  all,
  addUserInterest,
  getUserInterest,
} from "../../controller/application/interest.js";

const router = express.Router();

router.get("/", all);
router.get("/get-user-interest", getUserInterest);

router.post("/", create);
router.patch("/add-user-interest", addUserInterest);

export default router;
