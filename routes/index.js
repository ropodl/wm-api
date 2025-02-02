import express from "express";
import system from "./system/index.js";
import application from "./application/index.js";
import UserSchema from "../model/system/lord.js";
import tenantUserSchema from "../model/application/user.js";
import { getTenantDB } from "../utils/tenant.js";
import jwt from "jsonwebtoken";
import "dotenv";
import { sendError } from "../utils/error.js";
import { isValidSubdomain } from "../utils/application/subdomain.js";
import { isAuth } from "../middleware/application/user.js";

const router = express.Router();

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const { origin } = req.headers;

  const sub = isValidSubdomain(origin);

  if (sub) {
    const tenant_id = `tenant_${sub}`;
    console.log(tenant_id, "tenant_id");
    const tenantdb = await getTenantDB(tenant_id);
    const tenantUser = tenantdb.model("user", tenantUserSchema);

    const user = await tenantUser.findOne({ email });
    console.log(user);
    if (!user) return sendError(res, "Email/Password do not match");

    const matched = await user.comparePassword(password);
    if (!matched) return sendError(res, "Email/Password do not match");

    const token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);

    return res.json({
      token,
    });
  }
  console.log(email, password);

  const user = await UserSchema.findOne({ email });
  console.log(user);
  if (!user) return sendError(res, "Email/Password do not match");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email/Password do not match");

  const token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);

  res.status(200).json({
    token,
  });
});

router.get("/auth/session", async (req, res) => {
  const { authorization, origin } = req.headers;

  if (!authorization) return sendError(res, "Invalid token");

  const token = authorization.split("Bearer ")[1];
  if (!token) return sendError(res, "Invalid Token");

  const { userId } = jwt.verify(token, process.env.APP_SECRET, {
    expiresIn: "1d",
  });

  if (!origin) return sendError(res, "Invalid Source");

  const sub = isValidSubdomain(origin);

  if (sub) {
    console.log("session");

    const tenant_id = `tenant_${sub}`;

    const tenantdb = await getTenantDB(tenant_id);
    const tenantUser = tenantdb.model("user", tenantUserSchema);

    const user = await tenantUser.findById(userId);
    if (!user) return sendError(res, "Invalid Token, User not found", 404);

    const { id, name, email, image, interests, role } = user;

    return res.json({
      id,
      name,
      email,
      image,
      interests,
      role,
    });
  }

  const user = await UserSchema.findById(userId);
  if (!user) return sendError(res, "Invalid Token, User not found", 404);

  const { name, email, image } = user;

  res.json({
    user: { name, email, image },
    role: "lord",
  });
});

router.post("/auth/signup", async (req, res) => {
  const { name, user_name, email, password, latitude, longitude } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", tenantUserSchema);

  const old = await tenantUser.findOne({ email });
  if (old) return sendError(res, "User with given email already exists");

  const user = new tenantUser({
    name,
    user_name,
    email,
    password,
    latitude,
    longitude,
  });

  await user.save();

  res.status(200).json({
    message: "Registered successfully",
  });
});

router.post("/auth/change-password", isAuth, async (req, res) => {
  const {
    user: { id },
  } = req;
  const { current, newer } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", tenantUserSchema);

  const user = await tenantUser.findById({ _id: id });
  if (!user) return sendError(res, "User not found", 404);

  const isMatch = await user.comparePassword(current);
  if (!isMatch) return sendError(res, "Current password is incorrect", 400);

  user.password = newer;

  await user.save();

  res.status(200).json({
    message: "Password changed successfully",
  });
});

router.use("/system", system);
router.use("/", application);

router.use("/version-check/", (req, res) => {
  res.json({
    version: "1.0.0",
  });
});

export default router;
