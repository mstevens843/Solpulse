/**
 * Jupiter API Routes - SolPulse
 * 
 * Handles:
 * - Fetching the complete token list from Jupiter API.
 * - Fetching tradable tokens.
 * - Fetching details for a specific token by its mint address.
 * - Implements caching to reduce API load and improve performance.
 */


const express = require('express');
const router = express.Router();
const axios = require('axios');

const SOLANA_TOKEN_LIST_URL = "https://api.jup.ag/tokens/v1/all";
const TRADABLE_TOKENS_URL = "https://api.jup.ag/tokens/v1/mints/tradable";

// Caching for 10 minutes to avoid excessive requests
let tokenCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes





router.get('/tokens', async (req, res) => {
    try {
        if (tokenCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
            return res.json(tokenCache);
        }

        console.log("Fetching fresh token list from Jupiter API...");
        const response = await axios.get(SOLANA_TOKEN_LIST_URL);

        if (!Array.isArray(response.data)) {
            throw new Error("Unexpected response format from Jupiter API");
        }

        tokenCache = response.data;
        cacheTimestamp = Date.now();

        res.json(tokenCache);
    } catch (error) {
        console.error("Failed to fetch token list:", error.message); // improved error handling. 
        res.status(500).json({
            error: "Failed to fetch token list",
            details: error.message,
        });
    }
});






/**
 * @route   GET /api/jupiter/tradable
 * @desc    Fetch tradable tokens from Jupiter API
 * @access  Public
 */
router.get('/tradable', async (req, res) => {
    try {
        console.log("Fetching tradable tokens from Jupiter API...");
        const response = await axios.get(TRADABLE_TOKENS_URL);

        if (!Array.isArray(response.data)) {
            throw new Error("Unexpected response format from Jupiter API");
        }

        res.json(response.data);
    } catch (error) {
        console.error("Failed to fetch tradable tokens:", error.message); // improvced errror handling 
        res.status(500).json({
            error: "Failed to fetch tradable tokens",
            details: error.message,
        });
    }
});





/**
 * @route   GET /api/jupiter/token/:mintAddress
 * @desc    Fetch details for a specific token using its mint address
 * @access  Public
 */
router.get('/token/:mintAddress', async (req, res) => {
    try {
        const { mintAddress } = req.params;
        console.log(`Fetching token info for: ${mintAddress}`);

        const response = await axios.get(`https://api.jup.ag/tokens/v1/token/${mintAddress}`, {
            headers: { "Accept": "application/json" }
        });

        if (!response.data || typeof response.data !== "object") {
            console.log("Token not found or unexpected format from Jupiter API");
            return res.status(404).json({ error: "Token not found or malformed data from Jupiter" });
        }

        console.log("Token info received:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching token info:", error.message);
        res.status(500).json({
            error: "Failed to fetch token info", // improved error handling.
            details: error.message,
        });
    }
});

module.exports = router;


/**
 * 🚀 Potential Issues & Optimizations
✅ 📌 Improve Cache Implementation

Problem: The current cache stores the entire token list in memory. - skipped 
Solution: Consider using Redis for more scalable caching, especially if multiple API instances are used.
✅ 🔐 API Rate Limiting

Problem: This API could be spammed with requests.
Solution: Add rate limiting middleware (e.g., express-rate-limit) to prevent abuse.
✅ 📡 Improve Error Handling

Problem: If Jupiter API changes its endpoint format, responses might break.
Solution: Wrap API responses in a try-catch and handle unexpected formats.

 */