import { isValidObjectId } from "mongoose";
import forumSchema from "../../model/application/forum.js";
import { paginate } from "../../utils/application/paginate.js";
import { imgUrl } from "../../utils/common/generateImgUrl.js";
import { sendError } from "../../utils/error.js";
import { getTenantDB } from "../../utils/tenant.js";

export const create = async (req, res) => {
  const { name, description, status } = req.body;
  const { file } = req;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantForum = tenantdb.model("forums", forumSchema);

  const image = {
    url: imgUrl(req, res, file),
    name: file.filename,
  };

  const forum = new tenantForum({
    name,
    description,
    image,
    status,
  });

  const { id } = await forum.save();

  res.status(200).json({
    id,
  });
};

export const getForumById = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantForum = tenantdb.model("forums", forumSchema);

  const forum = await tenantForum.findById(id);
  if (!forum) return sendError(res, "Invalid request, Forum not found", 404);

  res.json(forum);
};

export const update = async (req, res) => {
  const { name, description, status } = req.body;
  const { id } = req.params;
  const { file } = req;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantForum = tenantdb.model("forums", forumSchema);

  if (!isValidObjectId(id)) return sendError(res, "Forum ID not valid", 404);

  const forum = await tenantForum.findById(id);
  if (!forum) return sendError(res, "Forum not found", 404);

  forum.name = name;
  forum.description = description;
  forum.status = status;

  if (file)
    forum.image = {
      url: imgUrl(req, res, file),
      name: file.filename,
    };

  await forum.save();

  res.status(200).json({
    message: "Forum updated successfully",
  });
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantForum = tenantdb.model("forums", forumSchema);

  if (!isValidObjectId(id)) return sendError(res, "Forum ID not valid", 404);

  const forum = await tenantForum.findById(id);
  if (!forum) return sendError(res, "Forum not found", 404);

  await tenantForum.findByIdAndDelete(id);

  res.status(200).json({ message: "Forum removed successfully" });
};

export const all = async (req, res) => {
  const { tenant_id } = req.headers;
  const { page, itemsPerPage, sortBy } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantForum = tenantdb.model("forums", forumSchema);

  const paginatedForums = await paginate(
    tenantForum,
    page,
    itemsPerPage,
    {},
    sortBy
  );

  const forums = await Promise.all(
    paginatedForums.documents.map(async (forum) => {
      const { id, name, desciption, image, status } = forum;
      return {
        id,
        name,
        desciption,
        image,
        status,
      };
    })
  );

  res.status(200).json({
    forums,
    pagination: paginatedForums.pagination,
  });
};
