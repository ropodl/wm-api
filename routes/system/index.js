import { Router } from "express";
// import { connect } from "../../config/db/connect.js";
import auth from "./auth.js"
import tenant from "./tenant.js"
import "../../config/db/system.js"

const router = Router();

router.use("/auth", auth);
router.use("/", tenant);

export default router;
