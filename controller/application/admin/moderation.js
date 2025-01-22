import moderationSchema from "../../../model/application/moderation.js";
import { sendError } from "../../../utils/error.js";
import { getTenantDB } from "../../../utils/tenant.js";

export const all = async (req, res) => {
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantModeration = tenantdb.model("moderation", moderationSchema);

  const moderation = await tenantModeration.findOne({});
  if (!moderation) return sendError(res, "No data available", 400);

  res.json({
    id: moderation.id,
    positive: moderation.positive.map((item) => item.text),
    negative: moderation.negative.map((item) => item.text),
    spam: moderation.spam.map((item) => item.text),
  });
};

export const create = async (req, res) => {
  const { positive, negative, spam } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantModeration = tenantdb.model("moderation", moderationSchema);

  const mod = convertToSchemaFormat({
    positive,
    negative,
    spam,
  });

  const moderation = new tenantModeration(mod);

  await moderation.save();

  res.status(200).json({
    message: "Moderation updated successfully",
  });
};

export const update = async (req, res) => {
  const { positive, negative, spam } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantModeration = tenantdb.model("moderation", moderationSchema);

  const moderation = await tenantModeration.findOne();
  if (!moderation) return sendError(res, "Moderation not available", 400);

  const mod = convertToSchemaFormat({
    positive,
    negative,
    spam,
  });

  moderation.positive = mod.positive;
  moderation.negative = mod.negative;
  moderation.spam = mod.spam;

  await moderation.save();

  res.status(200).json({
    message: "Moderation updated successfully",
  });
};

function convertToSchemaFormat(input) {
  const output = {};
  for (const key in input) {
    if (input.hasOwnProperty(key)) {
      const values = input[key].map((item) => ({
        text: item.trim(),
        label: key,
      }));
      output[key] = values;
    }
  }
  return output;
}
