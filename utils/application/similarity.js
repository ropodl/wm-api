export const calculateCosineSimilarity = (vectorA, vectorB) => {
  const dotProduct = vectorA.reduce((sum, value, idx) => sum + value * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, value) => sum + value ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, value) => sum + value ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB);
};

export const createVector = (text, vocabulary) => {
  const vector = new Array(vocabulary.length).fill(0);
  const words = text.split(" ");
  words.forEach((word) => {
    const idx = vocabulary.indexOf(word);
    if (idx >= 0) {
      vector[idx]++;
    }
  });
  return vector;
};