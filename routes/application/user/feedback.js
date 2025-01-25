import express from "express";
import { create } from "../../../controller/application/user/feedback.js";

const router = express.Router();

router.post("/create", create);

export default router;
