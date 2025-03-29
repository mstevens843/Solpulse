/**
 * Trending Crypto API Routes - SolPulse
 * 
 * Handles:
 * - Fetching trending Solana ecosystem coins from CoinGecko.
 * - Fetching top gainers & losers.
 * - Fetching trending Solana NFTs.
 * - Searching for cryptocurrency data.
 * - Fetching market charts for specific coins.
 * - Fetching global cryptocurrency market data.
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * @route   GET /api/trending
 * @desc    Fetch trending coins in the Solana ecosystem
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                category: 'solana-ecosystem',
                order: 'market_cap_desc',
                per_page: 10,
                page: 1,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Solana ecosystem coins:', error.message);
        res.status(500).json({ error: 'Failed to fetch Solana coins.' });
    }
});

/**
 * @route   GET /api/trendingCrypto/top-gainers-losers
 * @desc    Fetch top gainers and losers
 * @access  Public
 */
router.get('/top-gainers-losers', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 100,
                page: 1,
            },
        });

        const sortedCoins = response.data.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        const topGainers = sortedCoins.slice(0, 10);
        const topLosers = sortedCoins.slice(-10);

        res.json({ topGainers, topLosers });
    } catch (error) {
        console.error('Error fetching top gainers and losers:', error.message);
        res.status(500).json({ error: 'Failed to fetch top gainers and losers.' });
    }
});


/**
 * @route   GET /api/trendingCrypto/nfts
 * @desc    Fetch trending Solana NFTs
 * @access  Public
 */


router.get('/nfts', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/nfts/list', {
            params: {
                per_page: 10,  // Fetch top 10 NFTs
                page: 1
            },
            headers: {
                'accept': 'application/json'
            }
        });

        // Process and format NFT data
        const nftData = response.data.slice(0, 10).map(nft => ({
            id: nft.id,
            name: nft.name || "Unknown",
            symbol: nft.symbol || "N/A",
            image: nft.image?.small || "/default-nft.png",
            contract_address: nft.contract_address || "N/A",
            floor_price: nft.floor_price?.usd?.toLocaleString() || "N/A",
            floor_price_native: nft.floor_price?.native_currency || "N/A",
            one_day_sales: nft.one_day_sales || "N/A",
            change_24h: nft.floor_price_in_usd_24h_percentage_change?.toFixed(2) || "N/A",
        }));

        res.json(nftData);
    } catch (error) {
        console.error('Error fetching trending NFTs:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch trending NFTs.', details: error.message });
    }
});



/**
 * @route   GET /api/trendingCrypto/search
 * @desc    Fetch trending search lists
 * @access  Public
 */
router.get('/search', async (req, res) => {
    const query = req.query.query;
    
    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        // Step 1: Search for coins by name
        const searchResponse = await axios.get(`https://api.coingecko.com/api/v3/search?query=${query}`);
        if (searchResponse.data.coins.length === 0) {
            return res.status(404).json({ error: "No coins found." });
        }

        // Get the first result's ID
        const coinId = searchResponse.data.coins[0].id;

        // Step 2: Fetch coin details using the coin ID
        const coinResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);

        res.json({
            id: coinResponse.data.id,
            symbol: coinResponse.data.symbol,
            name: coinResponse.data.name,
            image: coinResponse.data.image.large,
            current_price: coinResponse.data.market_data.current_price.usd,
            market_cap: coinResponse.data.market_data.market_cap.usd,
            price_change_24h: coinResponse.data.market_data.price_change_percentage_24h,
        });
    } catch (error) {
        console.error("Error fetching coin data:", error.message);
        res.status(500).json({ error: "Failed to fetch coin data." });
    }
});


/**
 * @route   GET /api/trendingCrypto/chart/:id
 * @desc    Fetch market chart data for a specific coin
 * @access  Public
 */
router.get('/chart/:id', async (req, res) => {
    console.log("Received request for coin:", req.params.id);  // Debug log

    
    const { id } = req.params;
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: '7',
                interval: 'daily',
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching market chart data:', error.message);
        res.status(500).json({ error: 'Failed to fetch market chart data.' });
    }
});

// Get global cryptocurrency market data
router.get("/global", async (req, res) => {
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/global");
        if (!response.data || !response.data.data) {
            throw new Error("Invalid response from CoinGecko");
        }

        const marketData = response.data.data.market_cap_percentage;

        const formattedData = {
            bitcoin: marketData.btc.toFixed(2),
            ethereum: marketData.eth.toFixed(2),
            others: (100 - marketData.btc - marketData.eth).toFixed(2),
        };

        res.json(formattedData);
    } catch (error) {
        console.error("Error fetching global market data:", error.message);
        res.status(500).json({ error: "Failed to fetch global market data." });
    }
});


module.exports = router;

/**
 * 🚀 Potential Issues & Optimizations
✅ 📌 Implement Caching for API Calls

Problem: CoinGecko API has rate limits, and every request fetches fresh data.
Solution: Use in-memory caching (e.g., node-cache or Redis) to store results for a few minutes.
✅ 🔐 Add API Rate Limiting

Problem: Multiple requests can overwhelm the API and lead to IP bans.
Solution: Use express-rate-limit to limit requests per user.
✅ 📡 Improve Error Handling

Problem: If CoinGecko API changes its response format, errors may go unnoticed.
Solution: Implement structured error responses with specific failure reasons.

 */