import express from "express";
import { create, all } from "../../controller/application/user.js";

const router = express.Router();

router.get("/", all);

router.post("/create", create);

export default router;