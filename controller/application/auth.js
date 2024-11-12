import UserSchema from "../../model/application/user.js";
import { sendError } from "../../utils/error.js";
import { getTenantDB } from "../../utils/tenant.js";
import jwt from "jsonwebtoken";
import "dotenv";

export const login = async (req, res) => {
    const { email, password } = req.body;
    const { tenant_id } = req.headers;
    
    const tenantdb = await getTenantDB(tenant_id);
    const tenantUser = tenantdb.model("user", UserSchema);
    
    const user = await tenantUser.findOne({ email });
    if (!user) return sendError(res, "Email/Password do not match");
    
    const matched = await user.comparePassword(password);
    if (!matched) return sendError(res, "Email/Password do not match");
  
    const token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);
  
    res.json({
      token,
    });
  };

  export const me = async (req, res) => {
    const { authorization, tenant_id } = req.headers;
    if (!authorization) return sendError(res, "Invalid token");

    const tenantdb = await getTenantDB(tenant_id);
    const tenantUser = tenantdb.model("user", UserSchema);
  
    const token = authorization.split("Bearer ")[1];
    if (!token) return sendError(res, "Invalid Token");
  
    const { userId } = jwt.verify(token, process.env.APP_SECRET,{
        expiresIn: "1d"
    });
    const user = await tenantUser.findById(userId);
    if (!user) return sendError(res, "Invalid Token, User not found", 404);
  
    const { name, email, image, interests, role } = user;
  
    res.json({
      name,
      email,
      image,
      interests,
      role
    });
  };
  