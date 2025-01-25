import jwt from "jsonwebtoken";
import userSchema from "../../model/application/user.js";
import { getTenantDB } from "../../utils/tenant.js";
import interestSchema from "../../model/application/interest.js";

export async function isAuth(req, res, next) {
  const authHeader = req.headers?.authorization;
  const { tenant_id } = req.headers;
  if (!authHeader) return sendError(res, "Invalid token");

  const token = authHeader.split("Bearer ")[1];
  if (!token) return sendError(res, "Invalid Token");

  const tenantdb = await getTenantDB(tenant_id);
  tenantdb.model("interests", interestSchema);
  const tenantUser = tenantdb.model("user", userSchema);
  try {
    const decode = jwt.verify(token, process.env.APP_SECRET);
    const { userId } = decode;
    const user = await tenantUser.findById(userId).populate("interests");
    if (!user) return sendError(res, "Invalid Token, User not found", 404);

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Token Expired" });
  }
}

export async function isAdmin(req, res, next) {
  const { user } = req;
  if (user.role !== "admin") return sendError(res, "Unauthorized Access");
  next();
}
