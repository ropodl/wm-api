class NaiveBayes {
  constructor() {
    this.labelCounts = {};
    this.wordCounts = {};
    this.totalDocuments = 0;
  }

  train(text, label) {
    // Increment label count
    this.labelCounts[label] = (this.labelCounts[label] || 0) + 1;
    this.totalDocuments++;

    // Tokenize text
    const words = this.tokenize(text);

    // Count words per label
    this.wordCounts[label] = this.wordCounts[label] || {};
    words.forEach((word) => {
      this.wordCounts[label][word] = (this.wordCounts[label][word] || 0) + 1;
    });
  }

  classify(text) {
    const words = this.tokenize(text);
    const scores = {};

    for (const label in this.labelCounts) {
      let score = Math.log(this.labelCounts[label] / this.totalDocuments);

      words.forEach((word) => {
        const wordCount = this.wordCounts[label]?.[word] || 0;
        const totalWords = Object.values(this.wordCounts[label] || {}).reduce(
          (a, b) => a + b,
          0
        );
        const wordProbability = (wordCount + 1) / (totalWords + 1); // Add-one smoothing
        score += Math.log(wordProbability);
      });

      scores[label] = score;
    }

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 0);
  }
}

// Preload training data
const classifier = new NaiveBayes();
const trainingData = [
  { text: "Buy now!", label: "spam" },
  { text: "Limited offer!", label: "spam" },
  { text: "Great product", label: "positive" },
  { text: "Terrible experience", label: "negative" },
  { text: "Okay service", label: "neutral" },
];

trainingData.forEach(({ text, label }) => classifier.train(text, label));

export default classifier;
