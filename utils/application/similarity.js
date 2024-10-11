export function calculateCosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (magnitude1 * magnitude2);
}

export function createVector(text, vocabulary) {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  return vocabulary.map((term) => words.filter((word) => word === term).length);
}
