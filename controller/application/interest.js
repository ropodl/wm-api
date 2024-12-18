import { getTenantDB } from "../../utils/tenant.js";
import InterestSchema from "../../model/application/interest.js";
import { paginate } from "../../utils/application/paginate.js";
import { sendError } from "../../utils/error.js";
import { slugify } from "../../utils/common/slugify.js";
import UserSchema from "../../model/application/user.js";
import { isValidObjectId } from "mongoose";

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

export const create = async (req, res) => {
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
      description,
    },
  });
};

export const addUserInterest = async (req, res) => {
  const { user_id, interest_id } = req.query;
  const { tenant_id } = req.headers;
  console.log(user_id, interest_id, "test");

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", UserSchema);

  // const tenantInterest = tenantdb.model("interest", InterestSchema);

  const user = await tenantUser.findOne({ _id: user_id });
  // const interest = await tenantInterest.findOne({ _id: interest_id });

  user.interests.push(interest_id);

  await user.save();

  res.json({ message: "Interest added successfully" });
};
