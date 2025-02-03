import interestSchema from "../../../model/application/interest.js";
import postSchema from "../../../model/application/post.js";
import userSchema from "../../../model/application/user.js";
import { paginate } from "../../../utils/application/paginate.js";
import { sendError } from "../../../utils/error.js";
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

export const recommendation = async (req, res) => {
  const { tenant_id } = req.headers;
  const { page = 1, itemsPerPage = 10 } = req.query;
  const { user } = req;

  if (!user) return res.status(404).json({ error: "User not found" });

  const tenantdb = await getTenantDB(tenant_id);
  //   const User = tenantdb.model("user", userSchema);
  const Post = tenantdb.model("post", postSchema);
  tenantdb.model("interests", interestSchema);

  try {
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
        //console.log(similarity);
        return {
          title: post.title,
          image: post.image,
          slug: post.slug,
          similarity,
        };
      })
      // Filter out posts with zero similarity
      .filter((item) => item.similarity > 0)
      // Sort by similarity in descending order
      .sort((a, b) => b.similarity - a.similarity);

    // Pagination logic
    const totalItems = similarPosts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const offset = (page - 1) * itemsPerPage;

    // Get paginated posts
    const paginatedPosts = similarPosts.slice(offset, offset + itemsPerPage);

    res.json({
      documents: paginatedPosts,
      pagination: {
        totalItems: parseInt(totalItems),
        totalPages: parseInt(totalPages),
        itemsPerPage: parseInt(itemsPerPage),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
