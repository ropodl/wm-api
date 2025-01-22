import { getTenantDB } from "../../../utils/tenant.js";

export const all = async (req, res) => {
  const { tenant_id } = req.headers;
  // const {  } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantInterest = tenantdb.model("interest", interestSchema);
  const tenantForum = tenantdb.model("forum", forumSchema);
  const tenantThread = tenantdb.model("thread", threadSchema);

  res.status(200).json({
    status_bar: {
      total_interest,
      total_thread_created,
      total_thread_comment,
    },
  });
};
