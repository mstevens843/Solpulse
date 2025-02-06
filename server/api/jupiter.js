// ✅ Why Use the Backend Instead of Fetching Directly in React?
// Avoid CORS Issues Automatically

// If your backend makes the request server-side, CORS is not an issue because servers aren’t bound by CORS restrictions like browsers are.
// The frontend can request data from your own backend instead of calling the Jupiter API directly.
// Reduce Load & Optimize Requests

// Your backend can cache token data to reduce repeated API calls.
// This is especially useful if Jupiter API has rate limits or large responses.
// Security & API Key Management

// If you ever need an API key in the future, the backend can store it in environment variables (.env file).
// Safer than exposing API keys in the frontend.
// Better Error Handling & Logging

// The backend can retry failed requests and log them properly.
// Can implement fallbacks (e.g., use cached data if the API fails).

const express = require('express');
const router = express.Router();
const axios = require('axios');

const SOLANA_TOKEN_LIST_URL = "https://api.jup.ag/tokens/v1/all";
const TRADABLE_TOKENS_URL = "https://api.jup.ag/tokens/v1/mints/tradable";

// Caching for 10 minutes to avoid excessive requests
let tokenCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// ✅ Fetch Token List
router.get('/tokens', async (req, res) => {
    try {
        // Use cache if still valid
        if (tokenCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
            return res.json(tokenCache);
        }

        console.log("🔄 Fetching fresh token list from Jupiter API...");
        const response = await axios.get(SOLANA_TOKEN_LIST_URL);
        
        tokenCache = response.data; // Store in cache
        cacheTimestamp = Date.now(); // Update cache timestamp

        res.json(tokenCache);
    } catch (error) {
        console.error("❌ Failed to fetch token list:", error);
        res.status(500).json({ error: "Failed to fetch token list" });
    }
});

// ✅ Fetch Tradable Tokens
router.get('/tradable', async (req, res) => {
    try {
        console.log("🔄 Fetching tradable tokens from Jupiter API...");
        const response = await axios.get(TRADABLE_TOKENS_URL);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Failed to fetch tradable tokens:", error);
        res.status(500).json({ error: "Failed to fetch tradable tokens" });
    }
});


router.get('/token/:mintAddress', async (req, res) => {
    try {
        const { mintAddress } = req.params;
        console.log(`🔍 Fetching token info for: ${mintAddress}`);

        const response = await axios.get(`https://api.jup.ag/tokens/v1/token/${mintAddress}`, {
            headers: { "Accept": "application/json" }
        });

        if (!response.data) {
            console.log("❌ Token not found on Jupiter API");
            return res.status(404).json({ msg: "Token not found on Jupiter" });
        }

        console.log("✅ Token info received:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error fetching token info:", error);
        res.status(500).json({ error: "Failed to fetch token info" });
    }
});





// router.get('/jupiter/search', async (req, res) => {
//     try {
//         const { query } = req.query;
//         if (!query) return res.status(400).json({ error: "Missing query parameter" });

//         console.log(`🔍 Searching for tokens: ${query}`);
//         const response = await axios.get(`https://api.jup.ag/tokens/v1/all`);

//         // Filter tokens based on query (symbol or name)
//         const tokens = response.data.filter(token =>
//             token.symbol.toLowerCase().includes(query.toLowerCase()) ||
//             (token.name && token.name.toLowerCase().includes(query.toLowerCase()))
//         );

//         if (tokens.length === 0) return res.status(404).json({ msg: "No tokens found" });

//         res.json(tokens);
//     } catch (error) {
//         console.error("❌ Error fetching tokens:", error);
//         res.status(500).json({ error: "Failed to fetch tokens" });
//     }
// });

module.exports = router;
