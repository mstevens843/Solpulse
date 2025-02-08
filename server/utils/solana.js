const solanaWeb3 = require('@solana/web3.js');
require("dotenv").config(); // Ensure environment variables are loaded

// Create a reusable connection to the Solana cluster
const connection = new solanaWeb3.Connection(
  process.env.SOLANA_RPC_ENDPOINT || solanaWeb3.clusterApiUrl("mainnet-beta"),
  'confirmed'
);

// Utility function to convert lamports to SOL
const lamportsToSol = (lamports) => lamports / solanaWeb3.LAMPORTS_PER_SOL;

/**
 * Get the balance of a Solana wallet.
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

    // Create a PublicKey object from the wallet address to check if it's valid
    const publicKey = new solanaWeb3.PublicKey(walletAddress);
    console.log(`PublicKey object created: ${publicKey.toBase58()}`);

    // Fetch the wallet's balance in lamports (smallest unit of SOL)
    const balance = await connection.getBalance(publicKey);

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