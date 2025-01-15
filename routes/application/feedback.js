import express from "express";
import { all, create } from "../../controller/application/feedback.js";

const router = express.Router();

router.post("/create", create);

router.get("/", all);

export default router;
