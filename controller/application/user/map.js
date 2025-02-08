import mapSchema from "../../../model/application/map.js";
import { getTenantDB } from "../../../utils/tenant.js";
import { sendError } from "../../../utils/error.js";

// Function to calculate Haversine distance (in km)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const search = async (req, res) => {
  try {
    const { query = "", lat, long, page = 1, itemsPerPage = 10 } = req.query;
    const { tenant_id } = req.headers;

    // Validate input
    if (!tenant_id) return sendError(res, "Tenant ID is required", 400);
    if (!lat || !long)
      return sendError(res, "User location (lat, long) is required", 400);

    const userLat = parseFloat(lat);
    const userLong = parseFloat(long);

    if (isNaN(userLat) || isNaN(userLong))
      return sendError(res, "Invalid latitude or longitude", 400);

    // Get tenant database
    const tenantdb = await getTenantDB(tenant_id);
    const tenantMap = tenantdb.model("map", mapSchema);

    // Build search query
    const searchCriteria = { status: "Published" };
    if (query) searchCriteria.name = new RegExp(query, "i");

    // Fetch centers
    const centers = await tenantMap.find(searchCriteria).lean();

    if (!centers.length)
      return res.json({ message: "No recycling centers found." });

    // Calculate distance and sort by nearest
    const centersWithDistance = centers
      .map((center) => ({
        ...center,
        distance: haversineDistance(
          userLat,
          userLong,
          center.latitude,
          center.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    // Paginate results
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedCenters = centersWithDistance.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return res.json({
      nearestCenter: centersWithDistance[0] || null,
      relatedCenters: paginatedCenters,
      pagination: {
        page: Number(page),
        itemsPerPage: Number(itemsPerPage),
        totalItems: centersWithDistance.length,
        totalPages: Math.ceil(centersWithDistance.length / itemsPerPage),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return sendError(res, "Internal server error", 500);
  }
};
