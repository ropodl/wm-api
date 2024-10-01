import { connect } from "../../config/db/application.js";
export async function dbHandler(req, res) {
  const { tenant_id } = req.headers;
  // console.log(tenant_id);
  // await connect(tenant_id)
  // console.log(tenant_id)
  const dbName = `tenant-${tenant_id}`;
    db = db ? db : await connect(url)
    let tenantDb = db.useDb(dbName, { useCache: true });
    return tenantDb;
}
