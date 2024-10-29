import UserSchema from "../../model/system/lord.js";
import { sendError } from "../../utils/error.js";
import jwt from "jsonwebtoken";

export async function create (req, res){
    const { name, email, password } = req.body;

    const oldUser = await UserSchema.findOne({ email });
    if (oldUser) return sendError(res, "User with email address already exists.", 404);

    const user = new UserSchema({ name, email, password });
    const { id } = await user.save();
  
    res.status(200).json({
      success: true,
      user: {
        id,
        name,
        email
      },
    });
  };

export async function login(req, res) {
    const { email, password } = req.body;

    const user = await UserSchema.findOne({ email });
    if (!user) return sendError(res, "Email/Password do not match");
  
    const matched = await user.comparePassword(password);
    if (!matched) return sendError(res, "Email/Password do not match");
  
    const { id, name } = user;
  
    const token = jwt.sign(
      { userId: user._id },
      process.env.APP_SECRET
    );
  
    res.json({
    //   success: true,
      token,
    //   user: {
    //     id,
    //     name,
    //     email
    //   },
    });
}

