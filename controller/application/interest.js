import { getTenantDB } from "../../utils/tenant.js";
import InterestSchema from "../../model/application/interest.js";
import { paginate } from "../../utils/application/paginate.js";
import { slugify } from "../../utils/common/slugify.js";
import UserSchema from "../../model/application/user.js";
import { sendError } from "../../utils/error.js";
import interestSchema from "../../model/application/interest.js";
import { isValidObjectId } from "mongoose";
import postSchema from "../../model/application/post.js";

export const all = async (req, res) => {
  const { tenant_id } = req.headers;
  const { page, itemsPerPage, sortBy } = req.query;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantInterest = tenantdb.model("interest", InterestSchema);

  const paginatedInterests = await paginate(
    tenantInterest,
    page,
    itemsPerPage,
    {},
    sortBy
  );

  const interests = await Promise.all(
    paginatedInterests.documents.map(async (interest) => {
      const { id, title, slug, status } = interest;
      return { id, title, slug, status };
    })
  );

  res.json({
    interests,
    pagination: paginatedInterests.pagination,
  });
};

export const getInterestById = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantInterest = tenantdb.model("interests", interestSchema);

  const interest = await tenantInterest.findById(id);
  if (!interest)
    return sendError(res, "Invalid request, Interest not found", 404);

  res.json(interest);
};

export const create = async (req, res) => {
  const { title, description, status } = req.body;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantInterest = tenantdb.model("interest", InterestSchema);

  const slug = await slugify(title, tenantInterest, res);

  const interest = new tenantInterest({ title, slug, description, status });
  const { id } = await interest.save();

  res.status(200).json({
    success: true,
    id,
  });
};

export const update = async (req, res) => {
  const { title, description, status } = req.body;
  const { id } = req.params;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantInterest = tenantdb.model("interest", InterestSchema);

  if (!isValidObjectId(id)) return sendError(res, "Post ID not valid", 404);

  const interest = await tenantInterest.findById(id);
  if (!interest) return sendError(res, "Interest not found", 404);

  if (title !== interest.title)
    interest.slug = await slugify(title, tenantInterest, res);
  interest.title = title;
  interest.description = description;
  interest.status = status;

  await interest.save();

  res.status(200).json({
    message: "Interest updated successfully",
  });
};

export const addUserInterest = async (req, res) => {
  const { user_id, interest_id } = req.query;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", UserSchema);

  const user = await tenantUser.findOne({ _id: user_id });
  // const interests = user.interests;
  console.log(user);
  // if (interests.includes(interest_id))
  //   return sendError(res, "Interests already existes", 400);

  user.interests.push(interest_id);
  await user.save();

  res.json({
    message: "Interest added successfully",
    interests: user.interests,
  });
};

export const getUserInterest = async () => {
  const { user_id } = req.query;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantUser = tenantdb.model("user", UserSchema);

  const user = await tenantUser.findOne({ _id: user_id });
  const interests = user.interests;
  res.json({ interests });
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.headers;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantInterest = tenantdb.model("interest", interestSchema);
  const tenantPost = tenantdb.model("post", postSchema);

  if (!isValidObjectId(id)) return sendError(res, "Interest ID not valid", 404);

  const interest = await tenantInterest.findById(id);
  if (!interest) return sendError(res, "Interest not found", 404);

  const relatedPosts = await tenantPost.find({ tags: id });
  if (relatedPosts.length > 0)
    return sendError(
      res,
      "Interest is currently used in one or more posts",
      400
    );

  await tenantInterest.findByIdAndDelete(id);

  res.status(200).json({
    message: "Interest removed successfully",
  });
};
