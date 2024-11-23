import threadSchema from "../../model/application/thread.js";
import commentSchema from "../../model/application/comment.js";
import { paginate } from "../../utils/application/paginate.js";
import { sendError } from "../../utils/error.js";
import { getTenantDB } from "../../utils/tenant.js";
import UserSchema from "../../model/application/user.js";

export const createThread = async (req, res) => {
  const { tenant_id } = req.headers;
  const { id } = req.params;
  const { title, content, author } = req.body;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantThread = tenantdb.model("threads", threadSchema);

  const thread = new tenantThread({
    forum: id,
    title,
    content,
    author,
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
  const tenantThread = tenantdb.model("threads", threadSchema);

  const paginatedThreads = await paginate(
    tenantThread,
    1,
    10,
    {},
    { createAt: "-1" }
  );

  const threads = await Promise.all(
    paginatedThreads.documents.map(async (thread) => {
      const { id, title, content, author } = thread;
      return {
        id,
        title,
        content,
        author,
      };
    })
  );

  res.json({
    threads,
    pagination: paginatedThreads.pagination,
  });
};

export const getThreadById = async (req, res) => {
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
  const tenantComment = tenantdb.model("comments", commentSchema);
  tenantdb.model("users", UserSchema);

  const paginatedComments = await paginate(
    tenantComment,
    1,
    10,
    {},
    { createdAt: "-1" }
  );

  const comments = await Promise.all(
    paginatedComments.documents.map(async (comment) => {
      console.log(comment);
      const populatedComment = await tenantComment
        .findById(comment._id)
        .populate("author", "name email image");
      const { id, content, author, thread } = populatedComment;
      return {
        id,
        content,
        author,
        thread,
      };
    })
  );

  res.json({
    comments,
    pagination: paginatedComments.pagination,
  });
};
