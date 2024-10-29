import { Router } from "express";
import { create, login } from "../../controller/system/auth.js";

const router = Router();

router.post("/create", create);
router.post("/login", login);

export default router;
