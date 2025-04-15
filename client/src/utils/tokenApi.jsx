/**
 * tokenApi.js
 *
 * This file is responsible for handling interactions with Solana's blockchain
 * and the Jupiter API to fetch wallet token balances, token metadata, prices, and decimals.
 *
 * **Key Features:**
 * - Retrieves tokens held by a Solana wallet.
 * - Fetches token metadata from Jupiter API.
 * - Retrieves real-time token prices.
 * - Fetches token decimal precision.
 * - Implements request throttling to prevent excessive API calls.
 */

import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF";
const SOLANA_TOKEN_LIST_URL = "https://api.jup.ag/tokens/v1/all";

let lastFetched = 0; // Throttling timestamp

/**
 * Fetches all SPL tokens held by a given Solana wallet.
 * - Uses Alchemy's RPC URL for high reliability.
 * - Throttles requests to prevent excessive calls.
 * - Retrieves token mint addresses and balances.
 */const fetchWalletTokens = async (walletPublicKey, setWalletTokens, walletTokensFetched, setWalletTokensFetched) => {
    const now = Date.now();
    if (now - lastFetched < 3000) {  // Throttle requests to every 3 seconds
        console.log("⚠️ Fetching too frequently. Skipping this request.");
        return;
    }
    lastFetched = now;

    if (!walletPublicKey) {
        console.warn("⚠️ No wallet public key found.");
        return;
    }

    if (walletTokensFetched) {  // Prevent duplicate fetches
        console.log("⚠️ Wallet tokens already fetched.");
        return;
    }

    const connection = new Connection(SOLANA_RPC_URL);

    try {
        console.log("🔄 Fetching wallet tokens...");
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            new PublicKey(walletPublicKey),
            { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
        );

        const tokens = tokenAccounts.value.map((account) => {
            const info = account.account.data.parsed.info;
            return {
                mint: info.mint,
                amount: info.tokenAmount.uiAmount,
                name: info.mint, // Placeholder name
                symbol: info.mint.slice(0, 6), // Placeholder symbol
            };
        });

        setWalletTokens(tokens);
        setWalletTokensFetched(true);
        console.log(" Wallet tokens updated:", tokens);
    } catch (error) {
        console.error(" Failed to fetch wallet tokens:", error);
    }
};



/**
 * Fetches token metadata (name, symbol, logo) using Jupiter API.
 * - Requires a valid token mint address.
 * - Returns `null` if the token is not found.
 */
const fetchTokenInfo = async (mintAddress) => {
    try {
        console.log(` Fetching token with mint address: ${mintAddress}`);
        const response = await fetch(`http://localhost:5001/api/jupiter/token/${mintAddress}`);
        if (!response.ok) throw new Error("Token not found");

        const tokenInfo = await response.json();
        console.log(" Token Info:", tokenInfo);
        return tokenInfo;
    } catch (error) {
        console.error(" Failed to fetch token info:", error);
        return null;
    }
};



/**
 * Fetches token metadata from a secondary API route.
 * - Similar to `fetchTokenInfo` but uses a different endpoint.
 */
const fetchTokenInfoByMint = async (mintAddress) => {
    try {
        console.log(` Searching for token with mint address: ${mintAddress}`);

        const response = await fetch(`http://localhost:5001/jupiter/token/${mintAddress}`);
        if (!response.ok) throw new Error("Token not found");

        const tokenInfo = await response.json();
        console.log(" Token Info:", tokenInfo);
        return tokenInfo;
    } catch (error) {
        console.error(" Failed to fetch token info:", error);
        return null;
    }
};



/**
 * Fetches the real-time price of a token from Jupiter API.
 * - Accepts a token mint address as input.
 * - Returns `null` if the token price is not available.
 */
const fetchTokenPrice = async (mintAddress) => {
    try {
        console.log(`Fetching price for: ${mintAddress}`);
        const response = await fetch(`https://api.jup.ag/price/v2?ids=${mintAddress}`, {
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) throw new Error(`Token ${mintAddress} not found on Jupiter`);

        const data = await response.json();
        return data?.data?.[mintAddress]?.price || null;
    } catch (error) {
        console.error(" Error fetching token price:", error);
        return null;
    }
};



/**
 * Fetches the decimal precision of a token from Jupiter API.
 * - Some tokens have different decimal values, affecting UI token balances.
 * - Defaults to `6` if not found.
 */
const fetchTokenDecimals = async (mintAddress) => {
    try {
        console.log(`Fetching decimals for: ${mintAddress}`);
        const response = await fetch(`https://api.jup.ag/tokens/v1/token/${mintAddress}`, {
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) throw new Error(`Token ${mintAddress} not found on Jupiter`);

        const data = await response.json();
        const decimals = data?.decimals ?? 6;
        console.log(` Decimals for ${mintAddress}: ${decimals}`);
        return decimals;
    } catch (error) {
        console.error(" Error fetching token decimals:", error);
        return 6;
    }
};

export { fetchWalletTokens, fetchTokenInfo, fetchTokenInfoByMint, fetchTokenPrice, fetchTokenDecimals };


/**
 * 🔹 **Potential Improvements:**
 * 1. **Performance Optimization**:
 *    - Implement caching for token metadata to reduce redundant API calls.
 *    - Use a token metadata list to prefill common tokens instead of always fetching.
 *
 * 2. **Error Handling Enhancements**:
 *    - Implement retry logic for failed API requests.
 *    - Improve error messaging to differentiate network errors from invalid token errors.
 *
 * 3. **Expanded Data**:
 *    - Fetch additional token details like circulating supply, total supply, and liquidity.
 *    - Support more Solana SPL tokens by integrating a broader token list.
 *
 * 4. **User Experience Enhancements**:
 *    - Show loading indicators while fetching token information.
 *    - Provide a fallback token logo if the main logo fails to load.
 */
