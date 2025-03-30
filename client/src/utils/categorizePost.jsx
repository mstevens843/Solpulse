// utils/categorizePost.js
export function categorizePost(text) {
    const lowerText = text.toLowerCase();
  
    if (/meme|lmao|funny|shitpost|wagmi|ngmi|trench|cringe|cook|send|normie|cope/.test(lowerText)) return "Meme";
    if (/magiceden|tensor|nft|mint|floor|wao|monke|madlad|fock|retardio|degod|smb|solcasino|listed|clayno|whitelist|wl/.test(lowerText)) return "NFT";
    if (/\$[a-z]+|staking|airdrop|bitcoin|decentralized|jupiter|pumpfun|dex|jupiter|swap|bonk|solana|pyth||tx/.test(lowerText)) return "Crypto";
    if (/dao|proposal|governance|community|discord|vote|snapshot/.test(lowerText)) return "DAO";
    if (/rug|rekt|hack|ngmi|drain|drained||drama|exploit/.test(lowerText)) return "On-chain Drama";
  
    return "General";
  }
  

  /**
 * 🧠 Next steps:
 * - Hook this into an AI/NLP service (like OpenAI or HuggingFace) for smarter categorization.
 *   We can send the post body and receive an intent/tag prediction (e.g., "Meme", "News", "Shill").
 * - Consider caching results per post or storing categories in the DB for quick filtering.
 * - Later: Allow users to tag posts and train a model on real usage data.
 */