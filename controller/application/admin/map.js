import { isValidObjectId } from "mongoose";
import mapSchema from "../../../model/application/map.js";
import { paginate } from "../../../utils/application/paginate.js";
import { slugify } from "../../../utils/common/slugify.js";
import { sendError } from "../../../utils/error.js";
import { getTenantDB } from "../../../utils/tenant.js";

export const create = async (req, res) => {
  const { name, iframe, status } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantMap = tenantdb.model("map", mapSchema);

  const slug = await slugify(name, tenantMap, res);

  const map = new tenantMap({
    name,
    slug,
    iframe,
    status,
  });

  const { id } = await map.save();

  res.status(200).json({
    id,
  });
};

export const all = async (req, res) => {
  const { tenant_id } = req.headers;
  const { page, itemsPerPage, sortBy } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantMap = tenantdb.model("map", mapSchema);

  const paginatedMaps = await paginate(
    tenantMap,
    page,
    itemsPerPage,
    {},
    sortBy
  );

  const maps = await Promise.all(
    paginatedMaps.documents.map(async (map) => {
      const { id, name, slug, iframe, status } = await map;
      return {
        id,
        name,
        slug,
        iframe,
        status,
      };
    })
  );

  res.json({
    maps,
    pagination: paginatedMaps.pagination,
  });
};

export const id = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantMap = tenantdb.model("map", mapSchema);

  const map = await tenantMap.findById(id);
  if (!map)
    return sendError(res, "Invalid request, Recycling Center not found", 404);

  res.json(map);
};

export const update = async (req, res) => {
  const { name, iframe, status } = req.body;
  const { id } = req.params;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantMap = tenantdb.model("map", mapSchema);

  if (!isValidObjectId(id))
    return sendError(res, "Recycling Center ID not valid", 404);

  const map = await tenantMap.findById(id);
  if (!map) return sendError(res, "Reycling Center not found", 404);

  map.name = name;
  map.iframe = iframe;
  map.status = status;

  await map.save();

  res.status(200).json({
    message: "Recycling Center Updated successfully",
  });
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantMap = tenantdb.model("map", mapSchema);

  if (!isValidObjectId(id))
    return sendError(res, "Recycling Center ID not valid", 404);

  const map = await tenantMap.findById(id);
  if (!map) return sendError(res, "Recycling Center not found", 404);

  await tenantMap.findByIdAndDelete(id);

  res.status(200).json({
    message: "Recycling Center removed successfully",
  });
};
