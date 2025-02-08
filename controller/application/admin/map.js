import { isValidObjectId } from "mongoose";
import mapSchema from "../../../model/application/map.js";
import { paginate } from "../../../utils/application/paginate.js";
import { sendError } from "../../../utils/error.js";
import { getTenantDB } from "../../../utils/tenant.js";

// Extract Latitude & Longitude from iframe URL
const extractLatLong = (iframeUrl) => {
  const latMatch = iframeUrl.match(/!3d([-.\d]+)/);
  const longMatch = iframeUrl.match(/!2d([-.\d]+)/);
  return latMatch && longMatch
    ? { latitude: parseFloat(latMatch[1]), longitude: parseFloat(longMatch[1]) }
    : null;
};

// Create Recycling Center
export const create = async (req, res) => {
  try {
    const { name, iframe, status } = req.body;
    const { tenant_id } = req.headers;

    const tenantdb = await getTenantDB(tenant_id);
    const tenantMap = tenantdb.model("map", mapSchema);
    const { latitude, longitude } = extractLatLong(iframe);

    const map = new tenantMap({ name, iframe, latitude, longitude, status });
    const { id } = await map.save();

    res
      .status(201)
      .json({ id, message: "Recycling Center created successfully" });
  } catch (error) {
    console.error(error);
    sendError(res, "Error creating Recycling Center", 500);
  }
};

// Get All Centers with Pagination
export const all = async (req, res) => {
  try {
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
    const maps = paginatedMaps.documents.map(
      ({ id, name, iframe, status }) => ({
        id,
        name,
        iframe,
        status,
      })
    );

    res.json({ maps, pagination: paginatedMaps.pagination });
  } catch (error) {
    console.error(error);
    sendError(res, "Error fetching Recycling Centers", 500);
  }
};

// Get Single Center by ID
export const id = async (req, res) => {
  try {
    const { tenant_id } = req.headers;
    const { id } = req.params;

    if (!isValidObjectId(id))
      return sendError(res, "Invalid Recycling Center ID", 400);

    const tenantdb = await getTenantDB(tenant_id);
    const tenantMap = tenantdb.model("map", mapSchema);
    const map = await tenantMap.findById(id).lean();

    if (!map) return sendError(res, "Recycling Center not found", 404);

    res.json(map);
  } catch (error) {
    console.error(error);
    sendError(res, "Error retrieving Recycling Center", 500);
  }
};

// Update Center
export const update = async (req, res) => {
  try {
    const { name, iframe, status } = req.body;
    const { id } = req.params;
    const { tenant_id } = req.headers;

    if (!isValidObjectId(id))
      return sendError(res, "Invalid Recycling Center ID", 400);

    const tenantdb = await getTenantDB(tenant_id);
    const tenantMap = tenantdb.model("map", mapSchema);
    const map = await tenantMap.findById(id);

    if (!map) return sendError(res, "Recycling Center not found", 404);

    map.name = name;
    map.iframe = iframe;
    map.status = status;

    await map.save();
    res.json({ message: "Recycling Center updated successfully" });
  } catch (error) {
    console.error(error);
    sendError(res, "Error updating Recycling Center", 500);
  }
};

// Delete Center
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant_id } = req.headers;

    if (!isValidObjectId(id))
      return sendError(res, "Invalid Recycling Center ID", 400);

    const tenantdb = await getTenantDB(tenant_id);
    const tenantMap = tenantdb.model("map", mapSchema);

    const map = await tenantMap.findByIdAndDelete(id);
    if (!map) return sendError(res, "Recycling Center not found", 404);

    res.json({ message: "Recycling Center removed successfully" });
  } catch (error) {
    console.error(error);
    sendError(res, "Error deleting Recycling Center", 500);
  }
};
