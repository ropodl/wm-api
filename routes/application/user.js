import express from "express";
import { create, all, userById } from "../../controller/application/user.js";

const router = express.Router();

router.post("/", create);

router.get("/:id", userById);
router.get("/", all);

export default router;