import { connect } from "../config/db/application.js";
import "dotenv/config"

export async function getTenantDB(tenantId) {
  let db;
  const url = process.env.DB_ADDRESS + tenantId;
  db = db ? db : await connect(url);
  let tenantDb = db.useDb(tenantId, { useCache: true });
  return tenantDb;
}
