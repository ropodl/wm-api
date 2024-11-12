import { paginate } from "../../utils/application/paginate.js";
import { getTenantDB } from "../../utils/tenant.js";
import PostSchema from "../../model/application/post.js";
import { imgUrl } from "../../utils/common/generateImgUrl.js";
import { slugify } from "../../utils/common/slugify.js";
import {
  calculateCosineSimilarity,
  createVector,
} from "../../utils/application/similarity.js";
import InterestSchema from "../../model/application/interest.js";
import UserSchema from "../../model/application/user.js";
import { sendError } from "../../utils/error.js";
import jwt from "jsonwebtoken";
// import { faker } from "@faker-js/faker";

export const create = async (req, res) => {
  const { title, excerpt, content, status, tags: i } = req.body;
  const { file } = req;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", PostSchema);

  const image = {
    url: imgUrl(req, res, file),
    name: file.filename,
  };

  const slug = await slugify(title, tenantPost, res);

  
  const tags = i.split(",");
  const post = new tenantPost({
    title,
    slug,
    excerpt,
    content,
    image,
    status,
    tags,
  });
  await post.save();

  res.status(200).json({
    success: true,
    post: { title, slug, excerpt, content, image, status, tags },
  });
};

export const all = async (req, res) => {
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", PostSchema);

  const paginatedPosts = await paginate(
    tenantPost,
    1,
    10,
    {},
    { createdAt: "-1" }
  );

  const posts = await Promise.all(
    paginatedPosts.documents.map(async (post) => {
      const { id, title, excerpt, content, image, slug } = post;
      return {
        id,
        title,
        excerpt,
        content,
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

const cosineSimilarity = (userInterests, postTags) => {
  // Create a set of all unique interest IDs in both arrays
  const allInterests = new Set([...userInterests, ...postTags]);

  // Convert interests and tags into binary vectors
  const userVector = Array.from(allInterests).map(interestId => userInterests.includes(interestId) ? 1 : 0);
  const postVector = Array.from(allInterests).map(interestId => postTags.includes(interestId) ? 1 : 0);

  // Calculate dot product and magnitudes of the vectors
  const dotProduct = userVector.reduce((sum, val, i) => sum + val * postVector[i], 0);
  const userMagnitude = Math.sqrt(userVector.reduce((sum, val) => sum + val * val, 0));
  const postMagnitude = Math.sqrt(postVector.reduce((sum, val) => sum + val * val, 0));

  // Calculate cosine similarity
  return userMagnitude && postMagnitude ? dotProduct / (userMagnitude * postMagnitude) : 0;
};

export const recommended = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;
  const { page = 1, itemsPerPage = 10 } = req.query; // Get page and itemsPerPage from query params

  const tenantdb = await getTenantDB(tenant_id);
  const User = tenantdb.model("user", UserSchema);
  const Post = tenantdb.model("post", PostSchema);
  tenantdb.model("interests", InterestSchema);

  try {
    // Fetch the user and populate their interests
    const user = await User.findById(id).populate("interests");

    if (!user) return res.status(404).json({ error: "User not found" });

    // Get the user's interest IDs
    const userInterestIds = user.interests.map((interest) =>
      interest._id.toString()
    );

    // Fetch posts and populate their tags
    const posts = await Post.find({ status: "Published" }).populate("tags");

    // Calculate similarity for each post and add similarity score
    const similarPosts = posts
      .map((post) => {
        const postTagIds = post.tags.map((tag) => tag._id.toString());
        const similarity = cosineSimilarity(userInterestIds, postTagIds);
        return { post, similarity };
      })
      .filter((item) => item.similarity > 0) // Filter out posts with zero similarity
      .sort((a, b) => b.similarity - a.similarity); // Sort by similarity in descending order

    // Pagination logic
    const totalItems = similarPosts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const offset = (page - 1) * itemsPerPage;

    // Get paginated posts
    const paginatedPosts = similarPosts.slice(offset, offset + itemsPerPage);

    res.json({
      documents: paginatedPosts,
      pagination: {
        totalItems,
        totalPages,
        itemsPerPage,
        currentPage: page,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const postId = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", PostSchema);

  const post = await tenantPost.findById(id);
  if (!post) return sendError(res, "Invalid request, Post not found", 404);

  res.json(post);
};
