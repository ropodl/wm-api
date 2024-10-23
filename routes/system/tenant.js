import { Router } from "express";
import TenantSchema from "../../model/system/tenant.js";
import { getTenantDB } from "../../utils/tenant.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { createConfig } from "../../utils/config.js";

const router = Router();

router.get("/tenant", async (req, res) => {
  const tenants = await TenantSchema.find({});
  res.json(tenants);
});

router.post("/tenant", async (req, res) => {
  const { name, sub, email } = req.body;
  const tenant = new TenantSchema({ name: `tenant_${name}`, sub });
  const { id, name: dbName } = await tenant.save();
  console.log(tenant, " this is a tenant test");

  const userSchema = mongoose.Schema({
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    password: { type: String, required: true },
  });

  userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  const tenantdb = await getTenantDB(dbName);
  const tenantUser = tenantdb.model("users", userSchema);

  const user = new tenantUser({
    name,
    email,
    password: "admin123",
  });

  await user.save();
  console.log(req);

  // listen 80 default_server;
  // listen [::]:80 default_server;
  const config = `server {

        # root /var/www/html;

        # Add index.php to the list if you are using PHP
        # index index.html index.htm index.nginx-debian.html;

        server_name ${sub};

        location / {
          # First attempt to serve request as file, then
          # as directory, then fall back to displaying a 404.
          try_files $uri $uri/ =404;
          proxy_set_header tenant_id ${dbName};
	        proxy_pass http://localhost:3000/;
        	proxy_http_version 1.1;
	        proxy_set_header Upgrade $http_upgrade;
        	proxy_set_header Connection 'upgrade';
	        proxy_set_header Host $host;
        	proxy_cache_bypass $http_upgrade;
        }
}`;

  createConfig(id, config);

  res.json({
    name,
    sub,
    user,
  });
});

export default router;
