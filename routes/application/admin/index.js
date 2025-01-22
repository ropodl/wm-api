import express from "express";
import dashboard from "./dashboard.js";
import moderation from "./moderation.js";

const router = express.Router();

router.use("/dashboard", dashboard);
router.use("/moderation", moderation);

export default router;
