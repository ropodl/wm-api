import express from "express";
import { search } from "../../../controller/application/user/map.js";

const router = express.Router();

router.get("/search", search);

export default router;
