import { connect } from "../../config/db/application.js";
import "dotenv/config";
export async function dbHandler(req, res) {
  let db;
  const { tenant_id } = req.headers;
  const url = process.env.DB_ADDRESS + tenant_id;
  console.log(tenant_id, "this is it");
  // await connect(tenant_id)
  // console.log(tenant_id)
  const dbName = `tenant-${tenant_id}`;
  db = db ? db : await connect(url);
  let tenantDb = await db.useDb(dbName, { useCache: true });
  return tenantDb;
}
