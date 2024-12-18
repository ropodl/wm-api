const trainingData = [
  { text: "Buy cheap products now!", label: "spam" },
  { text: "Limited time offer, act fast!", label: "spam" },
  { text: "Earn money online easily", label: "spam" },
  { text: "Visit our website for amazing deals", label: "spam" },
  { text: "Get rich quickly, no effort required", label: "spam" },
  { text: "Special offer for limited time", label: "spam" },
  { text: "Congratulations! You've won a prize", label: "spam" },
  { text: "Win a free iPhone by clicking here", label: "spam" },
  { text: "Discount sale on electronics, up to 70% off", label: "spam" },
  { text: "Make money fast with no investment", label: "spam" },
  { text: "Free vacation, no strings attached!", label: "spam" },
  { text: "Check out the best discounts for shopping", label: "spam" },
  { text: "Get free gift cards, sign up now!", label: "spam" },
  { text: "Your account is compromised, click here to fix it", label: "spam" },
  { text: "Claim your free prize", label: "spam" },
  { text: "Earn passive income from home", label: "spam" },
  { text: "Make $1000 a day, guaranteed!", label: "spam" },
  { text: "Exclusive deal for members only", label: "spam" },
  { text: "You won a free gift, click to claim", label: "spam" },
  { text: "Click here to get free software", label: "spam" },

  // Non-Spam (Legitimate content)
  { text: "Learn about sustainable waste recycling", label: "non-spam" },
  { text: "How to recycle plastic efficiently", label: "non-spam" },
  { text: "Join us for a webinar on climate change", label: "non-spam" },
  {
    text: "Check out our new blog post about urban gardening",
    label: "non-spam",
  },
  { text: "Why recycling is important for our planet", label: "non-spam" },
  { text: "Tips for reducing plastic waste", label: "non-spam" },
  { text: "Save energy with these simple tips", label: "non-spam" },
  { text: "Discuss sustainable living practices", label: "non-spam" },
  {
    text: "Join our community to learn more about zero waste",
    label: "non-spam",
  },
  { text: "Waste management strategies for large cities", label: "non-spam" },
  { text: "Effective ways to reduce carbon footprint", label: "non-spam" },
  { text: "How to upcycle furniture", label: "non-spam" },
  { text: "Understanding the impact of fast fashion", label: "non-spam" },
  { text: "Exploring alternative energy sources for homes", label: "non-spam" },
  { text: "Sustainable gardening: Grow your own food", label: "non-spam" },
  { text: "How to choose eco-friendly products", label: "non-spam" },
  { text: "New study on the impact of plastic pollution", label: "non-spam" },
  { text: "How to start a community clean-up event", label: "non-spam" },
  { text: "Educational resources on environmental science", label: "non-spam" },
  {
    text: "What is climate change and how does it affect us?",
    label: "non-spam",
  },
  { text: "A beginner’s guide to composting at home", label: "non-spam" },

  // Additional Spam Examples
  { text: "Buy one, get one free! Hurry, limited time only!", label: "spam" },
  { text: "Unclaimed prize money waiting for you!", label: "spam" },
  { text: "Get your dream job now, no experience required", label: "spam" },
  { text: "Your subscription to premium content is waiting", label: "spam" },
  { text: "Instant loan approval, apply now!", label: "spam" },
  { text: "Free consultation for financial advice", label: "spam" },
  { text: "Unlock hidden cash, click here", label: "spam" },
  {
    text: "Get a free Amazon gift card with no purchase necessary",
    label: "spam",
  },
  {
    text: "Limited spots available for a free course, sign up today",
    label: "spam",
  },
  { text: "Earn $100 per day doing nothing", label: "spam" },

  // Additional Non-Spam Examples
  { text: "Top 10 ways to reduce food waste", label: "non-spam" },
  { text: "How to make your own compost bin", label: "non-spam" },
  { text: "The importance of renewable energy sources", label: "non-spam" },
  { text: "What you need to know about urban recycling", label: "non-spam" },
  {
    text: "How to create a sustainable garden in your backyard",
    label: "non-spam",
  },
  {
    text: "Why reducing waste is key to a sustainable future",
    label: "non-spam",
  },
  { text: "How to get involved in environmental advocacy", label: "non-spam" },
  {
    text: "Simple ways to make your home more energy efficient",
    label: "non-spam",
  },
  { text: "The benefits of eating locally sourced food", label: "non-spam" },
  { text: "How to turn old clothes into upcycled fashion", label: "non-spam" },
  { text: "Best practices for reducing water waste", label: "non-spam" },
  {
    text: "Everything you need to know about biodegradable plastics",
    label: "non-spam",
  },
  { text: "How to build a rainwater harvesting system", label: "non-spam" },
  {
    text: "The future of electric cars and renewable energy",
    label: "non-spam",
  },
  { text: "Sustainable fashion brands you should know", label: "non-spam" },
  {
    text: "Understanding the circular economy and how it helps the planet",
    label: "non-spam",
  },
  { text: "How to dispose of electronic waste responsibly", label: "non-spam" },
  {
    text: "Step-by-step guide to starting a community garden",
    label: "non-spam",
  },
  {
    text: "How to make your own eco-friendly cleaning products",
    label: "non-spam",
  },

  // Additional Spam Examples
  { text: "Get your dream car now, no down payment!", label: "spam" },
  {
    text: "Sign up for free and get instant access to exclusive content",
    label: "spam",
  },
  { text: "Click here to download free software", label: "spam" },
  {
    text: "The best investment opportunity in 2024, don’t miss out!",
    label: "spam",
  },
  { text: "Buy your favorite gadgets at the lowest prices", label: "spam" },
  { text: "Get your free laptop today, no purchase necessary", label: "spam" },
  { text: "Make money from home, it’s easy!", label: "spam" },
  {
    text: "Congratulations, you’ve been selected to win a prize!",
    label: "spam",
  },
  { text: "Limited stock on hot items, shop now!", label: "spam" },
  { text: "Get paid to take surveys online", label: "spam" },

  // Additional Non-Spam Examples
  { text: "A guide to understanding climate change policy", label: "non-spam" },
  { text: "The basics of water conservation", label: "non-spam" },
  { text: "How to plan an eco-friendly road trip", label: "non-spam" },
  { text: "Tips for reducing paper waste at work", label: "non-spam" },
  {
    text: "Green tech innovations that are changing the world",
    label: "non-spam",
  },
  {
    text: "How to reduce your carbon footprint while traveling",
    label: "non-spam",
  },
  {
    text: "The future of solar energy and how to invest in it",
    label: "non-spam",
  },
  { text: "Reducing food waste in your daily routine", label: "non-spam" },
  {
    text: "How to help fight deforestation in your community",
    label: "non-spam",
  },
  {
    text: "A beginner’s guide to eco-friendly DIY projects",
    label: "non-spam",
  },
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
