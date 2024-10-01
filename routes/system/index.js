import { Router } from "express";
// import { connect } from "../../config/db/connect.js";
import tenant from "./tenant.js"
import "../../config/db/system.js"

const router = Router();

router.use("/", tenant);

export default router;
