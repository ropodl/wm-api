import threadSchema from "../../../model/application/thread.js";
import { sendError } from "../../../utils/error.js";
import { getTenantDB } from "../../../utils/tenant.js";

export const create = async (req, res) => {
  const { user } = req;
  const { tenant_id } = req.headers;
  const { id } = req.params;
  const { title, content } = req.body;
  const { user_id } = req.query;

  console.log(user);
  const tenantdb = await getTenantDB(tenant_id);
  const tenantThread = tenantdb.model("threads", threadSchema);

  const thread = new tenantThread({
    forum: id,
    title,
    content,
    author: user_id,
  });

  await thread.save();

  res.status(200).json({
    message: "Thread created successfully",
  });
};

export const upvote = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.headers;
  const { user } = req;

  const tenantdb = await getTenantDB(tenant_id);
  const tenantThread = tenantdb.model("thread", threadSchema);

  const thread = await tenantThread.findById(id);

  if (!thread) return sendError(res, "Thread not found", 400);

  const hasUpvoted = thread.upvote.by.some((upvoter) =>
    upvoter.equals(user.id)
  );
  const hasDownvoted = thread.downvote.by.some((downvoter) =>
    downvoter.equals(user.id)
  );

  if (hasUpvoted) {
    thread.upvote.count = Math.max(thread.upvote.count - 1, 0);
    thread.upvote.by = thread.upvote.by.filter(
      (upvoter) => !upvoter.equals(user.id)
    );
  } else {
    thread.upvote.count += 1;
    thread.upvote.by.push(user.id);
    // Remove the user's downvote if it exists
    if (hasDownvoted) {
      thread.downvote.count = Math.max(thread.downvote.count - 1, 0);
      thread.downvote.by = thread.downvote.by.filter(
        (downvoter) => !downvoter.equals(user.id)
      );
    }
  }

  const { downvote, upvote } = await thread.save();

  res.status(200).json({
    message: "Upvoted this thread",
    downvote,
    upvote,
  });
};

export const downvote = async (req, res) => {
  const { id } = req.params; // Thread ID
  const { tenant_id } = req.headers; // Tenant information
  const { user } = req; // Authenticated user object

  const tenantdb = await getTenantDB(tenant_id);
  const tenantThread = tenantdb.model("thread", threadSchema);

  const thread = await tenantThread.findById(id);

  if (!thread) return sendError(res, "Thread not found", 400);

  const hasUpvoted = thread.upvote.by.some((upvoter) =>
    upvoter.equals(user.id)
  );
  const hasDownvoted = thread.downvote.by.some((downvoter) =>
    downvoter.equals(user.id)
  );

  if (hasDownvoted) {
    thread.downvote.count = Math.max(thread.downvote.count - 1, 0);
    thread.downvote.by = thread.downvote.by.filter(
      (downvoter) => !downvoter.equals(user.id)
    );
  } else {
    thread.downvote.count += 1;
    thread.downvote.by.push(user.id);

    if (hasUpvoted) {
      thread.upvote.count = Math.max(thread.upvote.count - 1, 0);
      thread.upvote.by = thread.upvote.by.filter(
        (upvoter) => !upvoter.equals(user.id)
      );
    }
  }

  const { downvote, upvote } = await thread.save();

  res.status(200).json({
    message: "Downvoted this thread",
    downvote,
    upvote,
  });
};
