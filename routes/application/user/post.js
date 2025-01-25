import express from "express";
import { latest } from "../../../controller/application/user/post.js";

const router = express.Router();

router.get("/", latest);

export default router;
