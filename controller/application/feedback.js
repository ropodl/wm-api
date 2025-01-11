import { getTenantDB } from "../../utils/tenant.js";
import feedbackSchema from "../../model/application/feedback.js";

export const create = async (req, res) => {
  const { title, suggestions, ratings } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantFeedback = tenantdb.model("feedback", feedbackSchema);

  const feedback = new tenantFeedback({
    title,
    suggestions,
    ratings,
  });

  await feedback.save();

  res.status(200).json({
    message: "Feedback submitted",
  });
};
