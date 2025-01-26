import express from "express";
import { login, me } from "../../controller/application/auth.js";
import { isAuth } from "../../middleware/application/user.js";

const router = express.Router();

router.get("/me", isAuth, me);

router.post("/login", login);

export default router;
