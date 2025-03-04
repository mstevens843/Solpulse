# SolPulse API Documentation

## Overview
The SolPulse API provides **secure and efficient endpoints** to support user authentication, social interactions, messaging, notifications, and cryptocurrency-related functionalities. This documentation covers all available endpoints, including user profile management, posts, crypto trading, and wallet integration.

### Base URL

*(Replace with your actual deployed API URL)*

---

## Jupiter API Trading (trade.js)
Handles **crypto trading** and **Solana token data** using **Jupiter API**.

### **Fetch Token Data**
| Method | Endpoint        | Description |
|--------|--------------|-------------|
| GET    | `/trade/tokens` | Fetch all tokens on Solana (Jupiter API) |
| GET    | `/trade/tradable` | Fetch tradable tokens from Jupiter |
| GET    | `/trade/token/:mintAddress` | Fetch details of a specific token |

### **Fetch Swap Quote**
| Method | Function        | Description |
|--------|--------------|-------------|
| `fetchSwapQuote()` | Fetches a swap quote based on selected tokens and amount |
| `fetchTokenPrice(mintAddress)` | Fetches real-time price for a specific token |
| `fetchTokenDecimals(mintAddress)` | Fetches token decimals for precision calculations |

### **Swap Execution**
| Method | Function        | Description |
|--------|--------------|-------------|
| `fetchSwapInstructions()` | Fetches swap instructions from Jupiter |
| `executeSwap()` | Executes a **Solana-based token swap** using Jupiter API |

### 📌 **Swap Process in SolPulse**
1. **Fetch Token List** - Fetches all available tokens on **Solana**.
2. **Select Tokens** - Users choose the token to **sell** and **buy**.
3. **Fetch Swap Quote** - The **Jupiter API** returns the estimated amount for the swap.
4. **Sign Transaction** - The user signs the **Solana transaction** via their wallet.
5. **Execute Swap** - The **Jupiter API** processes the trade.
6. **Confirm Transaction** - The swap is confirmed on **Solana Explorer**.

### **Wallet & Blockchain Integration**
| Feature | Description |
|---------|-------------|
| **Solana Wallet Adapter** | Users can connect wallets like **Phantom** or **Solflare** |
| **Alchemy RPC URL** | Uses `https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF` for blockchain interactions |
| **Transaction Confirmation** | Uses `Connection.confirmTransaction()` to validate the swap |

### 📌 **External API Used**
- **Jupiter API** - Provides real-time **Solana trading** and **token data**.

---

## CoinGecko Market Data (trendingCrypto.js)
Fetches real-time **Solana ecosystem crypto data** using **CoinGecko API**.

### **Fetch Market Data**
| Method | Endpoint              | Description |
|--------|----------------------|-------------|
| GET    | `/trendingCrypto` | Fetch trending cryptocurrencies in the Solana ecosystem |
| GET    | `/trendingCrypto/top-gainers-losers` | Fetch top 10 gainers and losers in the market |
| GET    | `/trendingCrypto/nfts` | Fetch trending Solana NFTs |
| GET    | `/trendingCrypto/search?query=<coin>` | Search for specific crypto details |
| GET    | `/trendingCrypto/chart/:id` | Fetch market chart data for a specific coin |
| GET    | `/trendingCrypto/global` | Fetch global cryptocurrency market data |

### **Trending Coins**
- **Fetches** real-time **Solana ecosystem trending cryptocurrencies** from **CoinGecko**.
- **Updates** every **few minutes** for market changes.
- **Filters out stablecoins like USDC** for relevant market tracking.

### **Gainers & Losers**
- **Fetches top 10 gainers & losers** over the last **24 hours**.
- **Reverse-sorted** for **top performing and worst performing assets**.

### **NFT Market Data**
| Method | Endpoint              | Description |
|--------|----------------------|-------------|
| GET    | `/trendingCrypto/nfts` | Fetch trending **Solana NFTs** |
| GET    | `/trendingCrypto/search?query=<NFT>` | Search for specific NFT collections |

- **Top 10 NFTs by floor price movement**.
- **Includes image, contract address, floor price, and sales volume**.

### **Market Chart Data**
- **Fetches 7-day price chart for any token**.
- **Displayed using Chart.js** in the front-end.

### **Global Cryptocurrency Market Share**
- **Doughnut chart** visualizing:
  - **Bitcoin dominance**.
  - **Ethereum dominance**.
  - **Other cryptocurrencies combined**.

### **Search Functionality**
| Method | Endpoint                | Description |
|--------|------------------------|-------------|
| GET    | `/trendingCrypto/search?query=<search-term>` | Search for a coin or NFT |
| GET    | `/trendingCrypto/search/:id` | Fetch details of a specific coin |

- **Uses CoinGecko API to find crypto assets.**
- **Returns real-time market cap, price, and trading volume.**
- **Search debounced to avoid excessive API calls.**

### **External API Used**
- **CoinGecko API** - Provides real-time crypto market data, trending assets, and NFT information.

---

## Deployment & Testing
- **Base URL:** _[Add your API URL]_  
- **Authentication:** JWT-based authentication required for most routes.  
- **API Keys:** API integrations use **CoinGecko, Jupiter, and DexScreener**.  

**For additional API details, refer to the backend code documentation.**

---

## Need Help?
For any questions or API access, contact **[Your Name or Email]**.

---

### Notes:
- **Integrated the full CoinGecko API market tracking.**
- **Documented NFT data, market dominance, and search.**
- **Added trending gainers, losers, and top 10 cryptocurrencies.**
- **Updated real-time price chart logic with Chart.js.**
- **Let me know if any additional refinements are needed! 🚀**
