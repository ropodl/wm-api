import express from "express";
import { create, all } from "../../../controller/application/admin/map.js";

const router = express.Router();

router.post("/", create);

router.get("/", all);

export default router;
