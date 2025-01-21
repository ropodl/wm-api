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

export const search = async (req, res) => {
  try {
    // Extract query parameters
    const { query = "" } = req.query;
    const { tenant_id } = req.headers;

    // Validate tenant_id
    if (!tenant_id) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }

    // Get tenant database
    const tenantdb = await getTenantDB(tenant_id);
    const tenantMap = tenantdb.model("map", mapSchema);

    // Build search criteria
    const searchCriteria = {
      status: "Published",
    };

    // Only add name search if query is provided
    if (query) {
      searchCriteria.name = new RegExp(query, "i");
    }

    // Perform the search with proper error handling
    const centers = await tenantMap
      .find(searchCriteria)
      .select("name slug iframe")
      .lean()
      .exec();

    return res.json(centers);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      error: "Error searching centers",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
