export function sendError(res, error, status = 401) {
    res.status(status).json({ error });
  }
  