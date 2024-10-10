import { paginate } from "../../utils/application/paginate.js";
import { getTenantDB } from "../../utils/tenant.js";
import PostSchema from "../../model/application/post.js";
import { imgUrl } from "../../utils/common/generateImgUrl.js";
import { slugify } from "../../utils/common/slugify.js";

export async function create(req, res) {
  const { title, excerpt, content, status } = req.body;
  const { file } = req;

  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", PostSchema);

  const featuredImage = {
    url: imgUrl(req, res, file),
    name: file.filename,
  };

  const slug = await slugify(title, tenantPost);

  const post = new tenantPost({
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    status,
  });
  await post.save();

  res.status(200).json({
    success: true,
    post: { title, slug, excerpt, content, featuredImage, status },
  });
}

export async function all(req, res) {
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", PostSchema);

  const paginatedPosts = await paginate(tenantPost, 1, 10, {}, {});

  const posts = await Promise.all(
    paginatedPosts.documents.map(async (post) => {
      const { id, title, excerpt, content, featuredImage } = post;
      return {
        id,
        title,
        excerpt,
        content,
        featuredImage,
      };
    })
  );

  res.json({
    posts,
    pagination: paginatedPosts.pagination,
  });
}
