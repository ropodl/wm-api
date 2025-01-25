import { getTenantDB } from "../../../utils/tenant.js";
import feedbackSchema from "../../../model/application/feedback.js";

export const create = async (req, res) => {
  const { suggestions, ratings } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantFeedback = tenantdb.model("feedback", feedbackSchema);
  let feedbackCount = await tenantFeedback.countDocuments();

  feedbackCount += 1;

  const feedback = new tenantFeedback({
    title: `Feedback #${feedbackCount}`,
    suggestions,
    ratings,
  });

  await feedback.save();

  res.status(200).json({
    message: "Thank you for submitting feedback",
  });
};
