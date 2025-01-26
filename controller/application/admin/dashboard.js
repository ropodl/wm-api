import forumSchema from "../../../model/application/forum.js";
import interestSchema from "../../../model/application/interest.js";
import postSchema from "../../../model/application/post.js";
import threadSchema from "../../../model/application/thread.js";
import { paginate } from "../../../utils/application/paginate.js";
import { getTenantDB } from "../../../utils/tenant.js";

export const all = async (req, res) => {
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", postSchema);
  const tenantInterest = tenantdb.model("interest", interestSchema);
  const tenantForum = tenantdb.model("forum", forumSchema);
  const tenantThread = tenantdb.model("thread", threadSchema);

  const total_interest = await tenantInterest.countDocuments({});
  const total_post = await tenantPost.countDocuments({});
  const total_forum = await tenantForum.countDocuments({});
  const total_thread = await tenantThread.countDocuments({});

  const latest_posts = await paginate(
    tenantPost,
    1,
    5,
    {},
    { createdAt: "-1" }
  );

  const latest_interest = await paginate(
    tenantInterest,
    1,
    5,
    {},
    { createdAt: "-1" }
  );

  res.status(200).json({
    stats_bar: {
      total_post,
      total_interest,
      total_forum,
      total_thread,
    },
    latest_posts,
    latest_interest,
  });
};
