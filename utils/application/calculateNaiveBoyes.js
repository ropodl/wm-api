const trainingData = [
  { text: "Buy cheap products now!", label: "spam" },
  { text: "Limited time offer!", label: "spam" },
  { text: "Discuss recycling tips", label: "non-spam" },
  { text: "Learn more about waste management", label: "non-spam" },
];

const wordCounts = { spam: {}, nonSpam: {} };
const categoryCounts = { spam: 0, nonSpam: 0 };

// Populate word counts and category counts
trainingData.forEach(({ text, label }) => {
  const words = tokenize(text);
  categoryCounts[label] += 1;

  words.forEach((word) => {
    if (!wordCounts[label][word]) wordCounts[label][word] = 0;
    wordCounts[label][word] += 1;
  });
});

// Calculate probabilities
export const calculateProbability = (text, category) => {
  const words = tokenize(text);
  const totalWordsInCategory = Object.values(wordCounts[category]).reduce(
    (a, b) => a + b,
    0
  );
  const vocabularySize = new Set([
    ...Object.keys(wordCounts.spam),
    ...Object.keys(wordCounts.nonSpam),
  ]).size;

  // Calculate category probability
  const categoryProbability =
    categoryCounts[category] / (categoryCounts.spam + categoryCounts.nonSpam);

  // Calculate word probabilities using Laplace smoothing
  const wordProbability = words.reduce((prob, word) => {
    const wordCount = wordCounts[category][word] || 0;
    const smoothedProbability =
      (wordCount + 1) / (totalWordsInCategory + vocabularySize);
    return prob * smoothedProbability;
  }, 1);

  return categoryProbability * wordProbability;
};

// Classify text as spam or non-spam
export const classifyText = (text) => {
  const spamProbability = calculateProbability(text, "spam");
  const nonSpamProbability = calculateProbability(text, "nonSpam");

  return spamProbability > nonSpamProbability ? "spam" : "non-spam";
};

// Reddit's ranking formula
export const calculateRedditScore = (upvotes, downvotes, createdAt) => {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = new Date(createdAt).getTime() / 1000;
  const hotScore = sign * order + seconds / 45000;
  return hotScore;
};
