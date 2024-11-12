export const isValidSubdomain = (origin) => {
  console.log(origin,"origin");
  const temp = origin.split(".")[0];
  const sub = temp.split("://")[1];
  if (sub === "lord") return false;
  return sub;
};
