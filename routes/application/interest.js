import express from "express"
import { create, all } from "../../controller/application/interest.js";

const router = express.Router();

router.get("/", all);

router.post("/", create);

export default router;