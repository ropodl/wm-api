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

export const getSimilarPosts = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;
  const { page = 1, itemsPerPage = 10 } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantPost = tenantdb.model("post", postSchema);
  tenantdb.model("interests", interestSchema);

  try {
    // Fetch the target post
    const targetPost = await tenantPost.findById(id).populate("tags");
    if (!targetPost) return sendError(res, "Post not found", 404);

    // Fetch all published posts
    const posts = await tenantPost
      .find({ status: "Published" })
      .populate("tags");

    // Prepare the text corpus (all posts content)
    const corpus = posts.map(
      (post) =>
        `${post.title} ${post.excerpt} ${post.content} ${post.tags
          .map((t) => t._id.toString())
          .join(" ")}`
    );

    // Compute TF-IDF for the entire corpus
    const tfidfVectors = computeTFIDF(corpus);

    // Get the index of the target post
    const targetIndex = posts.findIndex((post) => post._id.toString() === id);
    if (targetIndex === -1)
      return sendError(res, "Target post not found in corpus", 404);

    const targetVector = tfidfVectors[targetIndex];

    // Compute similarity for each post
    const similarPosts = posts
      .map((post, index) => {
        if (index === targetIndex) return null; // Skip self
        return {
          title: post.title,
          image: post.image,
          slug: post.slug,
          similarity: cosineSimilarity(targetVector, tfidfVectors[index]),
        };
      })
      .filter(Boolean) // Remove nulls
      .filter((post) => post.similarity > 0) // Remove non-similar posts
      .sort((a, b) => b.similarity - a.similarity)
      .splice(0, 4);

    // Pagination logic
    // const totalItems = similarPosts.length;
    // const totalPages = Math.ceil(totalItems / itemsPerPage);
    // const offset = (page - 1) * itemsPerPage;
    // const paginatedPosts = similarPosts.slice(offset, offset + itemsPerPage);

    res.json({
      posts: similarPosts,
      // pagination: {
      //   totalItems,
      //   totalPages,
      //   itemsPerPage: parseInt(itemsPerPage),
      //   currentPage: parseInt(page),
      // },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Function to compute TF-IDF vectors
const computeTFIDF = (documents) => {
  const wordCounts = documents.map(tokenizeAndVectorize);
  const documentCount = documents.length;

  // Compute DF (Document Frequency)
  const df = {};
  wordCounts.forEach((doc) => {
    Object.keys(doc).forEach((word) => {
      df[word] = (df[word] || 0) + 1;
    });
  });

  // Compute TF-IDF
  return wordCounts.map((doc) => {
    const tfidf = {};
    Object.keys(doc).forEach((word) => {
      const tf = doc[word]; // Term Frequency
      const idf = Math.log(documentCount / (df[word] || 1)); // Inverse Document Frequency
      tfidf[word] = tf * idf;
    });
    return tfidf;
  });
};

// Function to tokenize and count word frequencies
const tokenizeAndVectorize = (text) => {
  const words = text.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
  return words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
};

// Function to compute cosine similarity
const cosineSimilarity = (vectorA, vectorB) => {
  const allWords = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);

  const vecA = Array.from(allWords).map((word) => vectorA[word] || 0);
  const vecB = Array.from(allWords).map((word) => vectorB[word] || 0);

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};
