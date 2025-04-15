
export function categorizePost(text) {
  const lowerText = text.toLowerCase();

  // Specific first
  if (/meme|lmao|funny|shitpost|wagmi|ngmi|trench|cringe|cook|send|normie|cope/.test(lowerText)) return "Meme";
  if (/magiceden|tensor|nft|mint|floor|wao|monke|madlad|fock|retardio|degod|smb|solcasino|listed|clayno|whitelist|wl/.test(lowerText)) return "NFT";
  if (/dao|proposal|governance|community|discord|vote|snapshot/.test(lowerText)) return "DAO";
  if (/rug|rekt|hack|ngmi|drain|drama|exploit/.test(lowerText)) return "On-chain Drama";

  // Less specific last
  if (/\$[a-z]+|staking|airdrop|bitcoin|decentralized|jupiter|pumpfun|dex|swap|bonk|solana|pyth|tx/.test(lowerText)) return "Crypto";

  return "General";
}

  /**
 *  Next steps:
 * - Hook this into an AI/NLP service (like OpenAI or HuggingFace) for smarter categorization.
 *   We can send the post body and receive an intent/tag prediction (e.g., "Meme", "News", "Shill").
 * - Consider caching results per post or storing categories in the DB for quick filtering.
 * - Later: Allow users to tag posts and train a model on real usage data.
 */

  /**
   *  1. Automated Category Tags (Stored in DB)
 Why This Helps:
No need to recalculate category every time the feed loads

You can query posts by category directly from the DB

Supports filtering, analytics, and trending topics

How It Works:
When a user creates a post, you run your categorizePost() function server-side

You store the resulting category (e.g. "Meme", "NFT") in a new field:
Post.category

When querying posts, you can now:
Post.findAll({ where: { category: 'Meme' } });
 Pros:
Fast, lightweight filtering

Avoids doing regex/text analysis on every frontend render

Lets you show category badges, analytics, etc.

Future Upgrade:
Once you have enough data, retrain your categorizePost() based on real community behavior or feedback





 2. AI/NLP-Powered Categorization (OpenAI / HuggingFace)
 Why This Helps:
AI can understand context, tone, and intent, not just keywords

Enables smarter tagging like:

"Shitpost" vs "Alpha Leak" vs "Support Question"

"Pump Announcement" vs "FUD"

Adapts over time with zero extra rules

 Step-by-Step: How to Use OpenAI in Your App
 1. Sign Up for OpenAI Developer Access
Go to https://platform.openai.com/signup

Create an account (free if you haven’t before)

 2. Set Up Billing
You’ll need to enter payment info to use the API beyond free credits

You’re billed per token (pieces of words)

gpt-3.5-turbo: ~$0.0015 per 1K tokens (dirt cheap)

A typical post categorization call = ~100 tokens = ~$0.00015

 Example:

10,000 posts = ~$1.50

100,000 posts = ~$15.00

You control cost with rate limiting or batching.


   */