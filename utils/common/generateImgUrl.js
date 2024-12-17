export function imgUrl(req, res, file) {
  return `${req.protocol}://${req.headers.host}/${file.path}`;
}
