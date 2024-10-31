import { Router } from "express";
import { create, login, me } from "../../controller/system/auth.js";

const router = Router();

router.get("/me", me);

router.post("/create", create);
router.post("/login", login);


export default router;
