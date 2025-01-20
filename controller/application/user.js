import { isValidObjectId } from "mongoose";
import UserSchema from "../../model/application/user.js";
import { paginate } from "../../utils/application/paginate.js";
import { sendError } from "../../utils/error.js";
import { getTenantDB } from "../../utils/tenant.js";

export const create = async (req, res) => {
  const { name, email, password, role, interests, phone_number, user_name } =
    req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("users", UserSchema);

  UserSchema.pre("save", function (next) {
    if (this.isModified("password")) {
      this.password = bcrypt.hash(this.password, 14);
    }
    next();
  });

  UserSchema.methods.comparePassword = async function (password) {
    const result = await bcrypt.compare(password, this.password);
    return result;
  };

  const oldUser = await tenantUser.findOne({ email });
  if (oldUser)
    return sendError(res, "User with given email already exists.", 400);

  const user = new tenantUser({
    name,
    email,
    password,
    role,
    interests,
    user_name,
    phone_number,
  });
  await user.save();

  res.status(200).json({
    user,
  });
};

export async function all(req, res) {
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", UserSchema);

  const paginatedUsers = await paginate(tenantUser, 1, 10, {}, {});

  const users = await Promise.all(
    paginatedUsers.documents.map(async (user) => {
      const { id, name, email, role } = user;
      return {
        id,
        name,
        email,
        role,
      };
    })
  );

  res.json({ users, pagination: paginatedUsers.pagination });
}

export const userById = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", UserSchema);

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

  console.log(id);

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", UserSchema);

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
  });
};
