import { Router } from "express";
// import { connect } from "../../config/db/connect.js";
import auth from "./auth.js";
import tenant from "./tenant.js";
import "../../config/db/system.js";
import TenantSchema from "../../model/system/tenant.js";
import LordSchema from "../../model/system/lord.js";

const router = Router();

router.get("/dashboard", async (req, res) => {
  const tenant = await TenantSchema.find({});
  const lord = await LordSchema.find({});
  console.log(tenant);
  res.json({
    tenant: {
      total: tenant.length,
    },
    users: {
      total: lord.length,
    },
  });
});
router.use("/auth", auth);
router.use("/tenant", tenant);

export default router;
