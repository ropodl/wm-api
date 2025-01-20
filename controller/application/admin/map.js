import mapSchema from "../../../model/application/map.js";
import { slugify } from "../../../utils/common/slugify.js";

export const create = async (req, res) => {
  const { name, iframe, status } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantMap = tenantdb.model("map", mapSchema);

  const slug = await slugify(name, tenantMap, res);

  const map = new tenantMap({
    name,
    status,
    iframe,
    status,
  });

  const { id } = await map.save();

  res.status(200).json({
    id,
  });
};
