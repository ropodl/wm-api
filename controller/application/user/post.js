import interestSchema from "../../../model/application/interest.js";
import postSchema from "../../../model/application/post.js";
import { paginate } from "../../../utils/application/paginate.js";
import { getTenantDB } from "../../../utils/tenant.js";

export const latest = async (req, res) => {
  const { tenant_id } = req.headers;
  const { page, itemsPerPage } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", postSchema);

  const paginatedPosts = await paginate(
    tenantPost,
    page,
    itemsPerPage,
    { status: "Published" },
    { updatedAt: "-1" }
  );

  const posts = await Promise.all(
    paginatedPosts.documents.map(async (post) => {
      const { title, image, slug } = await post;
      return {
        title,
        image,
        slug,
      };
    })
  );

  res.json({
    posts,
    pagination: paginatedPosts.pagination,
  });
};

export const slug = async (req, res) => {
  const { tenant_id } = req.headers;
  const { slug } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", postSchema);
  tenantdb.model("interests", interestSchema);

  const post = await tenantPost.findOne({ slug }).populate("tags");
  if (!post) return sendError(res, "Invalid request, Post not found", 404);

  res.json(post);
};
