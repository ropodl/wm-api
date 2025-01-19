import { getTenantDB } from "../../utils/tenant.js";
import feedbackSchema from "../../model/application/feedback.js";
import { paginate } from "../../utils/application/paginate.js";

export const create = async (req, res) => {
  const { suggestions, ratings } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantFeedback = tenantdb.model("feedback", feedbackSchema);
  const Counter = tenantdb.model("counter", {
    name: String,
    value: Number,
  });

  let feedbackCounter = await Counter.findOne({ name: "feedbackTitle" });
  if (!feedbackCounter)
    feedbackCounter = new Counter({ name: "feedbackTitle", value: 0 });

  feedbackCounter.value += 1;

  await feedbackCounter.save();

  const feedback = new tenantFeedback({
    title: `Feedback #${feedbackCounter.value}`,
    suggestions,
    ratings,
  });

  await feedback.save();

  res.status(200).json({
    message: "Feedback submitted",
  });
};

export const all = async (req, res) => {
  const { tenant_id } = req.headers;
  const { page, itemsPerPage, sortBy } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantFeedback = tenantdb.model("feedback", feedbackSchema);

  const paginatedFeedback = await paginate(
    tenantFeedback,
    page,
    itemsPerPage,
    {},
    sortBy
  );

  const feedbacks = await Promise.all(
    paginatedFeedback.documents.map(async (feedback) => {
      const { id, title, suggestions, ratings } = await feedback;
      return {
        id,
        title,
        suggestions,
        ratings,
      };
    })
  );

  res.json({
    feedbacks,
    pagination: paginatedFeedback.pagination,
  });
};
