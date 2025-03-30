// components/TrendingTopics.js
import { categorizePost } from "@/utils/categorizePost";

const TrendingTopics = ({ posts }) => {
  const categoryMap = {
    Meme: {},
    NFT: {},
    Crypto: {},
    DAO: {},
    "On-chain Drama": {},
  };

  const validPosts = posts.filter((post) => {
    const isValid = post && typeof post.text === "string";
    if (!isValid) console.warn("❗️Skipping post missing text:", post);
    return isValid;
  });

  validPosts.forEach((post) => {
    const text = post.text;
    const category = categorizePost(text);
    const words = text.split(/\s+/);

    words.forEach((word) => {
      if (!categoryMap[category][word]) {
        categoryMap[category][word] = 1;
      } else {
        categoryMap[category][word]++;
      }
    });
  });

  return (
    <div className="keyword-stats">
      {Object.entries(categoryMap).map(([category, words]) => {
        const topWords = Object.entries(words)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        return (
          <div key={category} className="mb-4">
            <h3 className="font-semibold text-yellow-400">{category}</h3>
            <ul className="text-sm text-gray-300">
              {topWords.map(([word, count]) => (
                <li key={word}>• {word} ({count})</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default TrendingTopics;
