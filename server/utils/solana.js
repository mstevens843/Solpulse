
/**
 * Solana Utility for Solpuls. 
 * 
 * - Establishes a connection to the Solana blockchain. 
 * - Provides functions to fetch wallet balances and convert lamports to SOL
 * - Ensures robust handling and debugging. 
 */

const solanaWeb3 = require('@solana/web3.js');
require("dotenv").config(); // Ensure environment variables are loaded

// ✅ Allow commitment level to be configurable
const commitmentLevel = process.env.SOLANA_COMMITMENT || 'confirmed';

// Create a reusable connection to the Solana cluster
// Establishes a connection to the Solana cluster. 
// Uses the commitment level for balance queries. 
const connection = new solanaWeb3.Connection(
  process.env.SOLANA_RPC_ENDPOINT || solanaWeb3.clusterApiUrl("mainnet-beta"),
  commitmentLevel // ✅ Dynamic commitment level
);

// ✅ Validate input before converting lamports
// Utility function to convert lamports to SOL
// 1 SOL = 1,000,000,000 lamports. 
const lamportsToSol = (lamports) => {
  if (typeof lamports !== "number" || isNaN(lamports)) {
    throw new Error("Invalid lamports value");
  }
  return lamports / solanaWeb3.LAMPORTS_PER_SOL;
};

// ✅ Add retry logic for better resilience
// Attempt to fetch balance with retry attempts
const getBalanceWithRetry = async (publicKey, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await connection.getBalance(publicKey);
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(`Retrying balance fetch (${attempt}/${retries})...`);
      await new Promise((res) => setTimeout(res, 1000)); // Wait before retrying
    }
  }
};

/**
 * Get the balance of a Solana wallet.
 * 
 * - Validates input address before querying. 
 * - Converts the balance from lamports to SOL.
 * - Implements error handling for invalid inputs or network issues. 
 * @param {string} walletAddress - The public key address of the wallet.
 * @returns {Promise<number>} - The wallet balance in SOL.
 */
const getWalletBalance = async (walletAddress) => {
  try {
    // Validate the wallet address
    if (!walletAddress || typeof walletAddress !== 'string' || walletAddress.length === 0) {
      throw new Error('Wallet address is required');
    }

    // Log the wallet address for debugging
    console.log(`Validating wallet address: ${walletAddress}`);

    let publicKey;
    try {
      // ✅ Catch invalid public keys gracefully
      publicKey = new solanaWeb3.PublicKey(walletAddress);
    } catch (error) {
      throw new Error("Invalid Solana wallet address");
    }

    console.log(`PublicKey object created: ${publicKey.toBase58()}`);

    // ✅ Use retry-enabled balance fetch
    const balance = await getBalanceWithRetry(publicKey);

    // Convert lamports to SOL and return the balance
    return lamportsToSol(balance);
  } catch (error) {
    console.error('Error fetching wallet balance:', error.message);
    throw new Error('Failed to fetch wallet balance. Please check the input and try again later.');
  }
};

module.exports = {
  connection, // Export the connection for use elsewhere
  getWalletBalance,
  lamportsToSol,
};


/**
 * 🔍 Potential Issues & Optimizations
1️⃣ Hardcoded Commitment Level ("confirmed")
Issue: The connection uses "confirmed" as the commitment level, which may not be the most reliable for real-time balance checks.
✅ Fix: Allow the commitment level to be configurable via environment variables:
const commitmentLevel = process.env.SOLANA_COMMITMENT || "confirmed";
const connection = new solanaWeb3.Connection(
  process.env.SOLANA_RPC_ENDPOINT || solanaWeb3.clusterApiUrl("mainnet-beta"),
  commitmentLevel
);


2️⃣ Lack of Rate Limiting or RPC Fallbacks
Issue: If the RPC provider rate limits requests, getBalance() could fail.
✅ Fix: Implement retry logic or switch to a fallback RPC provider if the request fails:
const getBalanceWithRetry = async (publicKey, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await connection.getBalance(publicKey);
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(`Retrying balance fetch (${attempt}/${retries})...`);
      await new Promise((res) => setTimeout(res, 1000)); // Wait before retrying
    }
  }
};


3️⃣ Lack of Input Validation for lamportsToSol()
Issue: If a non-numeric value is passed, it could result in unexpected behavior.
✅ Fix: Ensure the input is a valid number before performing the division:
const lamportsToSol = (lamports) => {
  if (typeof lamports !== "number" || isNaN(lamports)) {
    throw new Error("Invalid lamports value");
  }
  return lamports / solanaWeb3.LAMPORTS_PER_SOL;
};


4️⃣ Missing Error Handling for Invalid Public Keys
Issue: If an invalid public key is passed, new solanaWeb3.PublicKey(walletAddress) will throw an error, but it won’t be caught properly.
✅ Fix: Catch the error and return a more user-friendly message:
try {
  const publicKey = new solanaWeb3.PublicKey(walletAddress);
} catch (error) {
  throw new Error("Invalid Solana wallet address");
}
✅ Next Steps
📌 Review solanaUtils.js changes and let me know if these optimizations make sense.
📌 Next file to review: rateLimiter.js, since it plays a key role in API security.

Let’s keep refining this! 🚀
 */