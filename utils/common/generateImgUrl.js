export function imgUrl(req, res, file) {
  console.log(file);
  return `${req.protocol}://${req.headers.host}/${file.path}`;
}
