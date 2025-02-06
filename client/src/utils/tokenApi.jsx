import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF";
const SOLANA_TOKEN_LIST_URL = "https://api.jup.ag/tokens/v1/all";

let lastFetched = 0; // ✅ Throttling timestamp

// ✅ Apply Throttling Inside fetchWalletTokens
const fetchWalletTokens = async (walletPublicKey, setWalletTokens, walletTokensFetched, setWalletTokensFetched) => {
    const now = Date.now();
    if (now - lastFetched < 3000) {  // ✅ Throttle requests to every 3 seconds
        console.log("⚠️ Fetching too frequently. Skipping this request.");
        return;
    }
    lastFetched = now;

    if (!walletPublicKey) {
        console.warn("⚠️ No wallet public key found.");
        return;
    }

    if (walletTokensFetched) {  // ✅ Prevent duplicate fetches
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
        console.log("✅ Wallet tokens updated:", tokens);
    } catch (error) {
        console.error("❌ Failed to fetch wallet tokens:", error);
    }
};

const fetchTokenInfo = async (mintAddress) => {
    try {
        console.log(`🔍 Fetching token with mint address: ${mintAddress}`);
        const response = await fetch(`http://localhost:5001/api/jupiter/token/${mintAddress}`);
        if (!response.ok) throw new Error("Token not found");

        const tokenInfo = await response.json();
        console.log("✅ Token Info:", tokenInfo);
        return tokenInfo;
    } catch (error) {
        console.error("❌ Failed to fetch token info:", error);
        return null;
    }
};

const fetchTokenInfoByMint = async (mintAddress) => {
    try {
        console.log(`🔍 Searching for token with mint address: ${mintAddress}`);

        const response = await fetch(`http://localhost:5001/jupiter/token/${mintAddress}`);
        if (!response.ok) throw new Error("Token not found");

        const tokenInfo = await response.json();
        console.log("✅ Token Info:", tokenInfo);
        return tokenInfo;
    } catch (error) {
        console.error("❌ Failed to fetch token info:", error);
        return null;
    }
};

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
        console.error("❌ Error fetching token price:", error);
        return null;
    }
};

const fetchTokenDecimals = async (mintAddress) => {
    try {
        console.log(`Fetching decimals for: ${mintAddress}`);
        const response = await fetch(`https://api.jup.ag/tokens/v1/token/${mintAddress}`, {
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) throw new Error(`Token ${mintAddress} not found on Jupiter`);

        const data = await response.json();
        const decimals = data?.decimals ?? 6;
        console.log(`✅ Decimals for ${mintAddress}: ${decimals}`);
        return decimals;
    } catch (error) {
        console.error("❌ Error fetching token decimals:", error);
        return 6;
    }
};

export { fetchWalletTokens, fetchTokenInfo, fetchTokenInfoByMint, fetchTokenPrice, fetchTokenDecimals };
