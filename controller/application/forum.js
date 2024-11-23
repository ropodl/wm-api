import forumSchema from "../../model/application/forum.js";
import { paginate } from "../../utils/application/paginate.js";
import { getTenantDB } from "../../utils/tenant.js";

export const create = async (req, res) => {
  const { name, desciption } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantForum = tenantdb.model("forums", forumSchema);

  const forum = new tenantForum({
    name,
    desciption,
  });

  const { id } = await forum.save();

  res.status(200).json({
    success: true,
    id,
  });
};

export const all = async (req, res) => {
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantForum = tenantdb.model("forums", forumSchema);

  const paginatedForums = await paginate(
    tenantForum,
    1,
    10,
    {},
    { createdAt: "-1" }
  );

  const forums = await Promise.all(
    paginatedForums.documents.map(async (forum) => {
      const { id, name, desciption } = forum;
      return {
        id,
        name,
        desciption,
      };
    })
  );

  res.status(200).json({
    forums,
    pagination: paginatedForums.pagination,
  });
};
