import { Router } from "express";
import TenantSchema from "../../model/system/tenant.js";

const router = Router();

router.get("/tenant", async (req, res) => {
  const tenants = await TenantSchema.find({});
  res.json(tenants);
});

router.post("/tenant", async (req, res) => {
  const { name, sub } = req.body;
  const tenant = new TenantSchema({ name, sub });
  const { id } = await tenant.save();

  console.log(id);

  res.json({
    name,
    sub,
  });
});

export default router;
