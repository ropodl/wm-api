import express from "express";
import { create } from "../../controller/application/feedback.js";

const router = express.Router();

router.post("/create", create);

export default router;
