import express from "express";
import {
  create,
  all,
  addUserInterest,
  getUserInterest,
  getInterestById,
  update,
  remove,
} from "../../controller/application/interest.js";

const router = express.Router();

router.get("/", all);
router.get("/get-user-interest", getUserInterest);
router.get("/:id", getInterestById);

router.post("/", create);

router.patch("/add-user-interest", addUserInterest);
router.patch("/:id", update);

router.delete("/:id", remove);

export default router;
