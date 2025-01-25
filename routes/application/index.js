import express from "express";
import user from "./user/index.js";
import interest from "./interest.js";
import auth from "./auth.js";
import forum from "./forum.js";
import admin from "./admin/index.js";
import { isAdmin, isAuth } from "../../middleware/application/user.js";

const router = express.Router();

router.use("/admin", isAuth, isAdmin, admin);

router.use("/user", isAuth, user);

router.use("/auth", auth);

router.use("/interest", isAuth, interest);

router.use("/forums", isAuth, forum);

export default router;
