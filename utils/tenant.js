import { connect } from "../config/db/application.js";

export async function getTenantDB(tenantId) {
  let db;
  const dbName = `tenant-${tenantId}`;
  db = db ? db : await connect(dbName);
  let tenantDb = db.useDb(dbName, { useCache: true });
  return tenantDb;
}
