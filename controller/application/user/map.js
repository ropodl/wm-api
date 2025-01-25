import mapSchema from "../../../model/application/map.js";
import { getTenantDB } from "../../../utils/tenant.js";

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
    return res.status(500).json({ error });
  }
};
