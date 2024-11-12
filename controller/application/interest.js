import { getTenantDB } from "../../utils/tenant.js";
import InterestSchema from "../../model/application/interest.js";
import { paginate } from "../../utils/application/paginate.js";
import { sendError } from "../../utils/error.js";
import { slugify } from "../../utils/common/slugify.js";
import interest from "../../migration/interest.js";

export async function all(req, res) {
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantInterest = tenantdb.model("interest", InterestSchema);

  const paginatedInterests = await paginate(tenantInterest, 1, 10, {}, {});

  const interests = await Promise.all(
    paginatedInterests.documents.map(async (interest) => {
      const { id, title, slug } = interest;
      return { id, title, slug };
    })
  );

  res.json({
    interests,
    pagination: paginatedInterests.pagination,
  });
}

export async function create(req, res) {
  const { title, description, status } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantInterest = tenantdb.model("interest", InterestSchema);

  const slug = await slugify(title, tenantInterest, res);

  const interest = new tenantInterest({ title, slug, description, status });
  await interest.save();

  res.status(200).json({
    success: true,
    interest: {
      title,
      slug,
      description
    },
  });
}