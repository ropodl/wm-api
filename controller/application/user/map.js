import mapSchema from "../../../model/application/map.js";
import { getTenantDB } from "../../../utils/tenant.js";

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const search = async (req, res) => {
  try {
    // Extract query parameters & user location
    const { query = "", lat, long } = req.query;
    const { tenant_id } = req.headers;
    const { user } = req;

    // Validate inputs
    if (!tenant_id)
      return res.status(400).json({ error: "Tenant ID is required" });
    if (!user.latitude || !user.longitude)
      return res
        .status(400)
        .json({ error: "User location (lat, long) is required" });

    // Convert lat/long to numbers
    const userLat = parseFloat(lat);
    const userLong = parseFloat(long);

    // Get tenant database
    const tenantdb = await getTenantDB(tenant_id);
    const tenantMap = tenantdb.model("map", mapSchema);

    // Build search criteria
    const searchCriteria = { status: "Published" };
    if (query) searchCriteria.name = new RegExp(query, "i");

    // Fetch recycling centers
    const centers = await tenantMap.find(searchCriteria).lean();

    if (!centers.length)
      return res.json({ message: "No recycling centers found." });

    // Calculate distances & sort by nearest
    const centersWithDistance = centers
      .map((center) => ({
        ...center,
        distance: haversineDistance(userLat, userLong, center.lat, center.long),
      }))
      .sort((a, b) => a.distance - b.distance);

    // Nearest center (first in sorted list)
    const nearestCenter = centersWithDistance[0];

    return res.json({
      nearestCenter,
      relatedCenters: centersWithDistance,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error });
  }
};
