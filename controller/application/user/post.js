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
      const { id, title, excerpt, content, image, slug, status } = await post;
      return {
        id,
        title,
        excerpt,
        content,
        image,
        slug,
        status,
      };
    })
  );

  res.json({
    posts,
    pagination: paginatedPosts.pagination,
  });
};
