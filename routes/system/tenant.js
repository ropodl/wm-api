import { Router } from "express";
import TenantSchema from "../../model/system/tenant.js";
import { getTenantDB } from "../../utils/tenant.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const router = Router();

router.get("/tenant", async (req, res) => {
  const tenants = await TenantSchema.find({});
  res.json(tenants);
});

router.post("/tenant", async (req, res) => {
  const { name, sub, email } = req.body;
  const tenant = new TenantSchema({ name: `tenant_${name}`, sub });
  const { id, name:dbName } = await tenant.save();

  const userSchema = mongoose.Schema({
    name: { type: String, trim: true, required:true },
    email: { type:String, trim: true, required: true },
    password: { type: String, required: true }
  });

  userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      this.password = bcrypt.hash(this.password, 10);
    }
    next();
  });

  const tenantdb = await getTenantDB(dbName);
  const tenantUser = tenantdb.model("users", userSchema)

  const user = new tenantUser({
    name, email, password:"admin123"
  })

  await user.save()

  res.json({
    name,
    sub,
    user
  });
});

export default router;
