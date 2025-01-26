import { isValidObjectId } from "mongoose";
import userSchema from "../../../model/application/user.js";
import { sendError } from "../../../utils/error.js";
import { getTenantDB } from "../../../utils/tenant.js";
import { imgUrl } from "../../../utils/common/generateImgUrl.js";
import bcrypt from "bcrypt";

export const dashboard = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", userSchema);

  const { name, email, interests, image, user_name, phone_number } =
    await tenantUser.findById(id);

  res.json({
    name,
    email,
    interests,
    image,
    user_name,
    phone_number,
  });
};

export const id = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", userSchema);

  const { name, email, interests, image, user_name, phone_number } =
    await tenantUser.findById(id);

  res.json({
    name,
    email,
    interests,
    image,
    user_name,
    phone_number,
  });
};

export const update = async (req, res) => {
  const { name, email, phone_number, user_name } = req.body;
  const { tenant_id } = req.headers;
  const { id } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", userSchema);

  if (!isValidObjectId(id)) return sendError(res, "User ID not valid", 404);

  const user = await tenantUser.findById(id);
  if (!user) return sendError(res, "User not found", 404);

  user.name = name;
  user.email = email;
  user.phone_number = phone_number;
  user.user_name = user_name;

  await user.save();

  res.status(200).json({
    message: "User profile updated successfully",
    name,
    email,
    phone_number,
    user_name,
  });
};

export const picture = async (req, res) => {
  console.log(req, "this is a test");
  const {
    file,
    user: { id },
  } = req;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", userSchema);
  console.log(id);

  if (!isValidObjectId(id)) return sendError(res, "User ID not valid", 404);

  const user = await tenantUser.findById({ _id: id });
  if (!user) return sendError(res, "User not found", 404);

  if (file)
    user.image = {
      url: imgUrl(req, res, file),
      name: file.filename,
    };

  const { image } = await user.save();

  res.status(200).json({
    message: "Profile Picture updated successfully",
    image,
  });
};

export const password = async (req, res) => {
  const {
    user: { id },
  } = req;
  const { tenant_id } = req.headers;
  const { current, newer } = req.body;

  try {
    // Get the tenant database
    const tenantdb = await getTenantDB(tenant_id);
    const tenantUser = tenantdb.model("user", userSchema);

    // Validate user ID
    if (!isValidObjectId(id)) return sendError(res, "User ID not valid", 404);

    // Find the user by ID
    const user = await tenantUser.findById(id);
    if (!user) return sendError(res, "User not found", 404);

    // Compare current password
    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) return sendError(res, "Current password is incorrect", 400);

    // Update with a new hashed password
    user.password = newer; // If a pre-save hook exists, this is enough
    await user.save(); // Pre-save hook will hash the password here

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in password update:", error);
    sendError(res, "Something went wrong", 500);
  }
};
