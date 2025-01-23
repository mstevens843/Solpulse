// solana.js handles blockchain-related interactions.

// What It Does:
// Core Functionality:
// Connects to the Solana blockchain using the @solana/web3.js library.
// Provides functions to interact with the blockchain, such as:
// getWalletBalance: Fetches the balance of a given wallet in SOL.
// lamportsToSol: Converts the smallest Solana unit (lamports) into SOL.
// Ensures the connection is reusable and efficient.
// Why We Need It:
// Blockchain Integration:
// Essential for enabling Solana blockchain features in your app (e.g., displaying wallet balances, tracking transactions).
// Reusability:
// Centralizes Solana-related logic, making it easier to maintain and reuse in multiple parts of your app.
// Error Handling:
// Handles errors gracefully (e.g., invalid wallet addresses), providing a better user experience.
// What Would Happen Without It:
// Redundant Code:
// You would need to repeat the blockchain interaction logic across multiple files, increasing the risk of bugs and inconsistencies.
// No Blockchain Features:
// Your app wouldn’t be able to display wallet balances or interact with Solana-based functionality.

const solanaWeb3 = require('@solana/web3.js');

// Create a reusable connection to the Solana cluster
const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl(process.env.SOLANA_CLUSTER || 'mainnet-beta'),
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
  getWalletBalance,
  lamportsToSol, // Exported for potential reuse
};




// Why These Changes?
// Dynamic Cluster Configuration:

// Allows the utility to work across different environments (e.g., development on devnet, testing on testnet, production on mainnet-beta).
// Avoids hardcoding the cluster.
// Enhanced Error Handling:

// Clearly identifies issues such as invalid wallet addresses or connection errors.
// Makes debugging easier for developers and provides more meaningful feedback.
// Reusable Connection Object:

// Establishing a connection is relatively expensive. By reusing the connection object, we reduce overhead and improve performance.
// Utility Function for Conversion:

// Simplifies and standardizes lamports-to-SOL conversion for any future calculations involving Solana.

// Improvements to utils.js
// The file looks good, but a few improvements can be made for better error handling, flexibility, and code readability:

// Environment Variable Defaults: Make sure the SOLANA_CLUSTER environment variable has a default value or an explicit fallback.
// Enhance Error Logging: More detailed error logs, especially when dealing with network requests like fetching balances, can be helpful for debugging.
// Extendable Functionality: You could extend the functionality to fetch other data like transaction history or recent activity if necessary.


// Improvements Explained:
// Default for SOLANA_CLUSTER: The process.env.SOLANA_CLUSTER is given a fallback value of 'mainnet-beta' if not defined.
// Enhanced Error Handling: Added more specific error handling for missing wallet addresses, and better logging in case of failures.
// General Error Handling: The error messages are more descriptive for the end user and will help in debugging.


// Suggested Improvements to db.js:
// Error Handling:

// Instead of logging errors directly to the console, you could propagate the error so that the application can handle it appropriately, especially in environments 
// like production.
// Connection Pooling and SSL:

// You've already included connection pooling and SSL options for production, which is good. No changes are needed unless you want to fine-tune those
// settings for specific environments.
// Avoiding direct console.log in production:

// Consider removing console.log in production to avoid exposing sensitive information. You could use a logging library like winston or pino for better log management.