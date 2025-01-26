import jwt from "jsonwebtoken";
import userSchema from "../../model/application/user.js";
import { getTenantDB } from "../../utils/tenant.js";
import interestSchema from "../../model/application/interest.js";
import { sendError } from "../../utils/error.js";

export const isAuth = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  const { tenant_id } = req.headers;
  if (!authHeader) return sendError(res, "Invalid token", 404);

  const token = authHeader.split("Bearer ")[1];
  if (!token) return sendError(res, "Invalid Token", 404);

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
};

export const isAdmin = (req, res, next) => {
  const { user } = req;
  console.log(user);
  if (user.role !== "admin") return sendError(res, "Unauthorized Access");
  next();
};
