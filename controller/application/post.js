import { paginate } from "../../utils/application/paginate.js";
import { getTenantDB } from "../../utils/tenant.js";
import postSchema from "../../model/application/post.js";
import { imgUrl } from "../../utils/common/generateImgUrl.js";
import { slugify } from "../../utils/common/slugify.js";
import InterestSchema from "../../model/application/interest.js";
import UserSchema from "../../model/application/user.js";
import { sendError } from "../../utils/error.js";
import interestSchema from "../../model/application/interest.js";
import { isValidObjectId } from "mongoose";

export const create = async (req, res) => {
  const { title, excerpt, content, status, tags: i } = req.body;
  const { file } = req;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", postSchema);

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
  const { id } = await post.save();

  res.status(200).json({
    id,
  });
};

export const all = async (req, res) => {
  const { tenant_id } = req.headers;
  const { page, itemsPerPage, sortBy } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", postSchema);

  const paginatedPosts = await paginate(
    tenantPost,
    page,
    itemsPerPage,
    {},
    sortBy
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

const cosineSimilarity = (userInterests, postTags) => {
  // Create a set of all unique interest IDs in both arrays
  const allInterests = new Set([...userInterests, ...postTags]);

  // Convert interests and tags into binary vectors
  const userVector = Array.from(allInterests).map((interestId) =>
    userInterests.includes(interestId) ? 1 : 0
  );
  const postVector = Array.from(allInterests).map((interestId) =>
    postTags.includes(interestId) ? 1 : 0
  );

  // Calculate dot product and magnitudes of the vectors
  const dotProduct = userVector.reduce(
    (sum, val, i) => sum + val * postVector[i],
    0
  );
  const userMagnitude = Math.sqrt(
    userVector.reduce((sum, val) => sum + val * val, 0)
  );
  const postMagnitude = Math.sqrt(
    postVector.reduce((sum, val) => sum + val * val, 0)
  );

  // Calculate cosine similarity
  return userMagnitude && postMagnitude
    ? dotProduct / (userMagnitude * postMagnitude)
    : 0;
};

export const recommended = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;
  // Get page and itemsPerPage from query params
  const { page = 1, itemsPerPage = 10 } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const User = tenantdb.model("user", UserSchema);
  const Post = tenantdb.model("post", postSchema);
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
    res.status(500).json({ error: "Server error" });
  }
};

export const postId = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;
  const { populate } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", postSchema);
  tenantdb.model("interests", interestSchema);

  let post;
  if (!populate) post = await tenantPost.findById(id);
  else post = await tenantPost.findById(id).populate("tags");
  if (!post) return sendError(res, "Invalid request, Post not found", 404);

  res.json(post);
};

export const update = async (req, res) => {
  const { title, excerpt, content, status, tags: i } = req.body;
  const { file } = req;
  const { id } = req.params;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", postSchema);

  if (!isValidObjectId(id)) return sendError(res, "Post ID not valid", 404);

  const post = await tenantPost.findById(id);
  if (!post) return sendError(res, "Post not found", 404);

  if (title !== post.title) post.slug = await slugify(title, tenantPost, res);
  post.title = title;
  post.content = content;
  post.excerpt = excerpt;
  post.status = status;
  post.tags = i.split(",");

  if (file)
    post.image = {
      url: imgUrl(req, res, file),
      name: file.filename,
    };

  await post.save();

  res.status(200).json({
    message: "Post updated successfully",
  });
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", postSchema);

  if (!isValidObjectId(id)) return sendError(res, "Post ID not valid", 404);

  const post = await tenantPost.findById(id);
  if (!post) return sendError(res, "Post not found", 404);

  await tenantPost.findByIdAndDelete(id);

  res.status(200).json({
    message: "Post removed successfully",
  });
};
