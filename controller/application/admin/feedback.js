import { paginate } from "../../../utils/application/paginate.js";
import { getTenantDB } from "../../../utils/tenant.js";
import feedbackSchema from "../../../model/application/feedback.js";

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
