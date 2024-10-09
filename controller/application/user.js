import UserSchema from "../../model/application/user.js";
import { paginate } from "../../utils/application/paginate.js";
import { sendError } from "../../utils/error.js";
import { getTenantDB } from "../../utils/tenant.js";

export async function create(req,res) {
    const { name, email, password, role } = req.body;
    const { tenant_id } = req.headers;

    const tenantdb = await getTenantDB(tenant_id);
    const tenantUser = tenantdb.model("user", UserSchema);

    const oldUser = await tenantUser.findOne({email});
    if(oldUser) return sendError(res, "User with given email already exists.", 400);

    const user = new tenantUser({ name, email, password, role });
    await user.save();

    res.status(200).json({
        success: true,
        user
    })
}

export async function all(req,res){
    const { tenant_id } = req.headers;

    const tenantdb = await getTenantDB(tenant_id);
    const tenantUser = tenantdb.model("user", UserSchema);

    const paginatedUsers = await paginate(tenantUser,1,10,{},{});

    const users = await Promise.all(
        paginatedUsers.documents.map(async (user) => {
          const { id, name, email, role } = user;
          return {
            id,
            name,
            email,
            role
          };
        })
      );

    res.json({users,pagination: paginatedUsers.pagination})
}