import jwt from "jsonwebtoken";

export const isUser = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader) return sendError(res, "Invalid token");

  const token = authHeader.split("Bearer ")[1];
  if (!token) return sendError(res, "Invalid Token");

  try {
    const decode = jwt.verify(token, process.env.app_jwt_secret);
    const { userId } = decode;
    const user = await userSchema.findById(userId);
    if (!user) return sendError(res, "Invalid Token, User not found", 404);

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Token Expired" });
  }
};
