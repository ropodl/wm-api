import threadSchema from "../../model/application/thread.js";
import commentSchema from "../../model/application/comment.js";
import { paginate } from "../../utils/application/paginate.js";
import { sendError } from "../../utils/error.js";
import { getTenantDB } from "../../utils/tenant.js";
import UserSchema from "../../model/application/user.js";
import forumSchema from "../../model/application/forum.js";
import moderationSchema from "../../model/application/moderation.js";

export const createThread = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;
  const { title, content } = req.body;
  const { user_id } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantThread = tenantdb.model("threads", threadSchema);

  const thread = new tenantThread({
    forum: id,
    title,
    content,
    author: user_id,
    upvote: { count: 0, by: [] },
    downvote: { count: 0, by: [] },
  });

  const { id: tid } = await thread.save();

  res.status(200).json({
    id: tid,
  });
};

export const getThread = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  tenantdb.model("user", UserSchema);
  tenantdb.model("forum", forumSchema);
  const tenantThread = tenantdb.model("threads", threadSchema);

  const paginatedThreads = await paginate(
    tenantThread,
    1,
    10,
    { forum: id },
    { createAt: "-1" }
  );

  const threads = await Promise.all(
    paginatedThreads.documents.map(async (thread) => {
      const populatedThread = await tenantThread
        .findById(thread._id)
        .populate("author", "name email image")
        .populate("forum");
      const { id, title, content, author, createdAt, upvote, downvote } =
        populatedThread;
      return {
        id,
        title,
        content,
        author,
        createdAt,
        upvote: upvote.count,
        downvote: downvote.count,
      };
    })
  );

  res.json({
    threads,
    pagination: paginatedThreads.pagination,
  });
};

export const getThreadById = async (req, res) => {
  console.log("why");
  const { tenant_id } = req.headers;
  const { tid } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantThread = tenantdb.model("threads", threadSchema);
  tenantdb.model("user", UserSchema);

  const thread = await tenantThread.findById({ _id: tid }).populate("author");
  if (!thread) return sendError(res, "Invalid request, Thread not found", 404);

  res.json(thread);
};

export const getThreadComment = async (req, res) => {
  const { tenant_id } = req.headers;
  const { page, itemsPerPage, sortBy } = req.query;
  const { tid } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  tenantdb.model("user", UserSchema);
  tenantdb.model("thread", threadSchema);
  const tenantComment = tenantdb.model("comments", commentSchema);

  const paginatedComments = await paginate(
    tenantComment,
    page,
    itemsPerPage,
    { thread: tid },
    { createdAt: "-1" }
  );

  const comments = await Promise.all(
    paginatedComments.documents.map(async (comment) => {
      console.log(comment);
      const populatedComment = await tenantComment
        .findById(comment._id)
        .populate("author", "name email image")
        .populate("thread");
      const { id, content, author, thread, sentiment, isSpam, updatedAt } =
        populatedComment;
      return {
        id,
        content,
        author,
        thread,
        sentiment,
        isSpam,
        updatedAt,
      };
    })
  );

  res.json({
    comments,
    pagination: paginatedComments.pagination,
  });
};

class NaiveBayes {
  constructor() {
    this.labelCounts = {};
    this.wordCounts = {};
    this.totalDocuments = 0;
  }

  train(text, label) {
    // Increment label count
    this.labelCounts[label] = (this.labelCounts[label] || 0) + 1;
    this.totalDocuments++;

    // Tokenize text
    const words = this.tokenize(text);

    // Count words per label
    this.wordCounts[label] = this.wordCounts[label] || {};
    words.forEach((word) => {
      this.wordCounts[label][word] = (this.wordCounts[label][word] || 0) + 1;
    });
  }

  classify(text) {
    const words = this.tokenize(text);
    const scores = {};

    for (const label in this.labelCounts) {
      let score = Math.log(this.labelCounts[label] / this.totalDocuments);

      words.forEach((word) => {
        const wordCount = this.wordCounts[label]?.[word] || 0;
        const totalWords = Object.values(this.wordCounts[label] || {}).reduce(
          (a, b) => a + b,
          0
        );
        const wordProbability = (wordCount + 1) / (totalWords + 1);
        score += Math.log(wordProbability);
      });

      scores[label] = score;
    }

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 0);
  }
}
export const createThreadComment = async (req, res) => {
  const { content } = req.body;
  const { tenant_id } = req.headers;
  const { author_id } = req.query;
  const { tid } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantComment = tenantdb.model("comments", commentSchema);
  const tenantModeration = tenantdb.model("moderation", moderationSchema);

  const moderation = await tenantModeration.findOne();
  const trainingData = [
    ...moderation.positive,
    ...moderation.negative,
    ...moderation.spam,
  ];

  const classifier = new NaiveBayes();

  trainingData.forEach(({ text, label }) => classifier.train(text, label));

  const label = classifier.classify(content);

  const isSpam = label === "spam";
  const sentiment = label || "neutral";

  const comment = new tenantComment({
    content,
    isSpam,
    sentiment,
    thread: tid,
    author: author_id,
    upvote: { count: 0, by: [] },
    downvote: { count: 0, by: [] },
  });

  await comment.save();

  res.status(201).json({ message: "Comment added successfully" });
};
