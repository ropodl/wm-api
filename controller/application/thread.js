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
  });

  const { id: tid } = await thread.save();

  res.status(200).json({
    id: tid,
  });
};

export const getThread = async (req, res) => {
  console.log("this is a test");

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
      const { id, title, content, author, createdAt } = populatedThread;
      return {
        id,
        title,
        content,
        author,
        createdAt,
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
  const { id, tid } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantThread = tenantdb.model("threads", threadSchema);

  const thread = await tenantThread.findById({ _id: tid });
  if (!thread) return sendError(res, "Invalid request, Thread not found", 404);

  res.json(thread);
};

export const getThreadComment = async (req, res) => {
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  tenantdb.model("user", UserSchema);
  tenantdb.model("thread", threadSchema);
  const tenantComment = tenantdb.model("comments", commentSchema);

  const paginatedComments = await paginate(
    tenantComment,
    1,
    10,
    {},
    { createdAt: "-1" }
  );

  // Naive Bayes implementation for Sentiment and Spam classification
  const naiveBayesClassifier = {
    // Extended word lists for sentiment analysis
    positiveWords: [
      "good",
      "great",
      "awesome",
      "fantastic",
      "excellent",
      "wonderful",
      "amazing",
      "positive",
      "incredible",
      "outstanding",
      "superb",
      "perfect",
      "delightful",
      "beautiful",
      "joyful",
      "happy",
      "pleasant",
      "impressive",
      "satisfying",
      "inspiring",
      "uplifting",
      "friendly",
      "enthusiastic",
      "grateful",
      "exhilarating",
      "affectionate",
      "affordable",
      "rewarding",
      "pleasing",
      "motivating",
      "enjoyable",
      "thrilling",
      "brilliant",
      "successful",
      "accomplished",
    ],
    negativeWords: [
      "bad",
      "terrible",
      "awful",
      "poor",
      "horrible",
      "disastrous",
      "dismal",
      "unpleasant",
      "negative",
      "disappointing",
      "frustrating",
      "unfortunate",
      "miserable",
      "depressing",
      "pathetic",
      "vile",
      "disgusting",
      "unhappy",
      "boring",
      "annoying",
      "irritating",
      "angry",
      "hateful",
      "unbearable",
      "painful",
      "displeasing",
      "degrading",
      "shameful",
      "disturbing",
      "embarrassing",
      "tragic",
      "sorrowful",
      "horrific",
      "useless",
      "dreadful",
      "incompetent",
      "unfortunate",
      "detestable",
      "cruel",
    ],
    spamWords: [
      "buy",
      "free",
      "win",
      "limited time",
      "offer",
      "money",
      "guaranteed",
      "prize",
      "click",
      "fast",
      "make",
      "click here",
      "exclusive",
      "cash",
      "instant",
      "investment",
      "loan",
      "apply",
      "earn",
      "free gift",
      "sign up",
      "unclaimed",
      "get paid",
      "easy money",
      "no risk",
      "hurry",
      "special offer",
      "today only",
      "apply now",
      "get yours",
      "no purchase necessary",
      "get started",
    ],
    classifySentiment: function (text) {
      let positiveCount = 0;
      let negativeCount = 0;

      // Tokenizing and counting words in the text
      const words = text.split(/\s+/).map((word) => word.toLowerCase());

      words.forEach((word) => {
        if (this.positiveWords.includes(word)) positiveCount++;
        if (this.negativeWords.includes(word)) negativeCount++;
      });

      // Sentiment classification based on word counts
      if (positiveCount > negativeCount) return "positive";
      else if (negativeCount > positiveCount) return "negative";
      return "neutral"; // If both counts are equal
    },

    classifySpam: function (text) {
      let spamCount = 0;
      const words = text.split(/\s+/).map((word) => word.toLowerCase());

      words.forEach((word) => {
        if (this.spamWords.includes(word)) spamCount++;
      });

      return spamCount > 3 ? "spam" : "non-spam";
    },
  };

  const comments = await Promise.all(
    paginatedComments.documents.map(async (comment) => {
      console.log(comment);
      const populatedComment = await tenantComment
        .findById(comment._id)
        .populate("author", "name email image")
        .populate("thread");
      console.log(populatedComment, "this is taken");
      const { id, content, author, thread } = populatedComment;

      // Classify the content of the comment
      const sentiment = naiveBayesClassifier.classifySentiment(content);
      const spamClassification = naiveBayesClassifier.classifySpam(content);

      return {
        id,
        content,
        author,
        thread,
        sentiment,
        spamClassification,
      };
    })
  );

  res.json({
    comments,
    pagination: paginatedComments.pagination,
  });
};

export const createThreadComment = async (req, res) => {
  const { content } = req.body;
  const { tenant_id } = req.headers;
  const { author_id } = req.query;
  const { tid } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantComment = tenantdb.model("comments", commentSchema);

  const label = classifier.classify(content);
  const isSpam = label === "spam";
  const sentiment = isSpam ? "neutral" : label;

  const comment = new tenantComment({
    content,
    isSpam,
    sentiment,
    thread: tid,
    author: author_id,
  });

  await comment.save();

  res.status(201).json({ message: "Comment added" });
};
// ---------------------------------------------------
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
        const wordProbability = (wordCount + 1) / (totalWords + 1); // Add-one smoothing
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
const trainingData = [
  { text: "Buy now!", label: "spam" },
  { text: "Limited offer!", label: "spam" },
  { text: "Great product", label: "positive" },
  { text: "Terrible experience", label: "negative" },
  { text: "Okay service", label: "neutral" },
];

export const commentAdd = async (req, res) => {
  // try {
  const { content } = req.body;
  const { tenant_id } = req.headers;
  const { author_id, tid } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantComment = tenantdb.model("comments", commentSchema);
  const tenantForumMod = tenantdb.model("moderation", moderationSchema);

  const classifier = new NaiveBayes();
  trainingData.forEach(({ text, label }) => classifier.train(text, label));

  const label = classifier.classify(content);
  const isSpam = label === "spam";
  const sentiment = isSpam ? "neutral" : label;
  console.log(isSpam, sentiment, "asd");

  const comment = new tenantComment({
    content,
    isSpam,
    sentiment,
    thread: tid,
    author: author_id,
  });

  await comment.save();

  res.status(201).json({ message: "Comment added" });
};
