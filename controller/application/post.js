import { paginate } from "../../utils/application/paginate.js";
import { getTenantDB } from "../../utils/tenant.js";
import PostSchema from "../../model/application/post.js";
import { imgUrl } from "../../utils/common/generateImgUrl.js";
import { slugify } from "../../utils/common/slugify.js";
import {
  calculateCosineSimilarity,
  createVector,
} from "../../utils/application/similarity.js";
import UserSchema from "../../model/application/user.js";

export async function create(req, res) {
  const { title, excerpt, content, status, interests: i } = req.body;
  const { file } = req;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", PostSchema);

  const featuredImage = {
    url: imgUrl(req, res, file),
    name: file.filename,
  };

  const slug = await slugify(title, tenantPost, res);

  const interests = i.split(",");
  console.log(interests);
  const post = new tenantPost({
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    status,
    interests
  });
  await post.save();

  res.status(200).json({
    success: true,
    post: { title, slug, excerpt, content, featuredImage, status, interests },
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

export async function getRecommendedPosts(req, res) {
  const { tenant_id, user_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("users", UserSchema);
  const tenantPost = tenantdb.model("post", PostSchema);

  const user = await tenantUser.find({user_id});
  console.log(user,"user");
  const posts = await tenantPost
    .find({ status: "Published" })
    .populate("interests");

  if (user.interests.length === 0) {
    return res.json(posts.map((post) => ({ post, similarity: 0 })));
  }

  const vocabulary = [
    ...new Set([...posts.flatMap((post) => post.keywords), ...user.interests]),
  ];

  const userVector = createVector(user.interests.join(" "), vocabulary);
  const recommendations = posts.map((post) => {
    const postVector = createVector(post.keywords.join(" "), vocabulary);
    const similarity = calculateCosineSimilarity(userVector, postVector);
    return { post, similarity };
  });

  recommendations.sort((a, b) => b.similarity - a.similarity);

  res.json(recommendations);
}
