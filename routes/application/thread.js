import express from "express";
import { create, all } from "../../controller/application/forum.js";

const router = express.Router();

router.post("/forums", create);
router.get("/forums", all);

