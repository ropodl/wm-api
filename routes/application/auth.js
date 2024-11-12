import { Router } from "express";
import { login, me } from "../../controller/application/auth.js";

const router = Router();

router.get("/me", me);

router.post("/login", login);

export default router;
