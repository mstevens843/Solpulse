function categorizePost(text) {
    const lowerText = text.toLowerCase();
  
    if (/meme|lmao|funny|shitpost|wagmi|ngmi|trench|cringe|cook|send|normie|cope/.test(lowerText)) return "Meme";
    if (/magiceden|tensor|nft|mint|floor|wao|monke|madlad|fock|retardio|degod|smb|solcasino|listed|clayno|whitelist|wl/.test(lowerText)) return "NFT";
    if (/\$[a-z]+|staking|airdrop|bitcoin|decentralized|jupiter|pumpfun|dex|swap|bonk|solana|pyth|tx/.test(lowerText)) return "Crypto";
    if (/dao|proposal|governance|community|discord|vote|snapshot/.test(lowerText)) return "DAO";
    if (/rug|rekt|hack|drain|drained|drama|exploit/.test(lowerText)) return "On-chain Drama";
  
    return "General";
  }
  
  module.exports = { categorizePost };
  


/**
 * Plan to support multiple categories per post in the future
 * function categorizePostMulti(text) {
  const lowerText = text.toLowerCase();
  const categories = [];

  if (/rug|rekt|hack|drain|drained|drama|exploit/.test(lowerText)) categories.push("On-chain Drama");
  if (/dao|proposal|governance|community|discord|vote|snapshot/.test(lowerText)) categories.push("DAO");
  if (/magiceden|tensor|nft|mint|floor|wao|monke|madlad|fock|retardio|degod|smb|solcasino|listed|clayno|whitelist|wl/.test(lowerText)) categories.push("NFT");
  if (/\$[a-z]+|staking|airdrop|bitcoin|decentralized|jupiter|pumpfun|dex|swap|bonk|solana|pyth|tx/.test(lowerText)) categories.push("Crypto");
  if (/meme|lmao|funny|shitpost|wagmi|ngmi|trench|cringe|cook|send|normie|cope/.test(lowerText)) categories.push("Meme");

  return categories.length ? categories : ["General"];
}
 */