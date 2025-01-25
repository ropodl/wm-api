import express from "express";
import { all } from "../../../controller/application/admin/feedback.js";

const router = express.Router();

router.get("/", all);

export default router;
