import forumSchema from "../../model/application/forum.js";
import { paginate } from "../../utils/application/paginate.js";
import { imgUrl } from "../../utils/common/generateImgUrl.js";
import { getTenantDB } from "../../utils/tenant.js";

export const create = async (req, res) => {
  const { name, description } = req.body;
  const { file } = req;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantForum = tenantdb.model("forums", forumSchema);

  // console.log(req.file, "this is a test");

  const image = {
    url: imgUrl(req, res, file),
    name: file.filename,
  };

  const forum = new tenantForum({
    name,
    description,
    image,
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
      const { id, name, desciption, image } = forum;
      return {
        id,
        name,
        desciption,
        image,
      };
    })
  );

  res.status(200).json({
    forums,
    pagination: paginatedForums.pagination,
  });
};
