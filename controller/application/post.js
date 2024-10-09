import { paginate } from "../../utils/application/paginate.js";
import { sendError } from "../../utils/error.js";
import { getTenantDB } from "../../utils/tenant.js";
import PostSchema from "../../model/application/post.js";

export async function create(req,res){
    const { title, excerpt, content, status } = req.body;
    const { file } = req;

    const { tenant_id } = req.headers;

    const tenantdb = await getTenantDB(tenant_id);
    const tenantPost = tenantdb.model("post", PostSchema);

    const
}