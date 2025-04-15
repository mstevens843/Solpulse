
# API_DOCUMENTATION.md — SolPulse REST API (Detailed)

## Overview

The SolPulse API powers a decentralized, Solana-themed crypto social network with:
- User authentication
- Posts and retweets
- Comments
- Direct messaging with tipping
- Notifications
- Full-text search
- Real-time market data
- On-chain trading via Jupiter

### Base URL

`https://solpulse.onrender.com/api`

---

## Jupiter API Trading (trade.js)

### Swap Tokens on Solana
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trade/tokens` | Fetch all Solana tokens from Jupiter |
| GET | `/trade/tradable` | Fetch only tradable tokens |
| GET | `/trade/token/:mintAddress` | Get token metadata by mint address |

### Quote + Execute Swaps
| Function | Description |
|----------|-------------|
| `fetchSwapQuote()` | Get best quote for token swap |
| `fetchTokenPrice(mintAddress)` | Real-time price lookup |
| `fetchTokenDecimals(mintAddress)` | Precision helper |
| `fetchSwapInstructions()` | Builds transaction for swap |
| `executeSwap()` | Signs and submits transaction on-chain |

**Blockchain Details**
- Wallets: Phantom, Solflare via Solana Wallet Adapter
- RPC: Alchemy Solana mainnet
- Uses `Connection.confirmTransaction()` to confirm

---

## CoinGecko Market Data (trendingCrypto.js)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trendingCrypto` | Trending coins in the Solana ecosystem |
| GET | `/trendingCrypto/top-gainers-losers` | Top 10 gainers & losers (24h) |
| GET | `/trendingCrypto/nfts` | Trending Solana NFTs |
| GET | `/trendingCrypto/search?query=` | Search for coin/NFT |
| GET | `/trendingCrypto/chart/:id` | 7-day market chart |
| GET | `/trendingCrypto/global` | BTC/ETH/Other market share |

**Extras:**
- Filters out stablecoins like USDC
- Uses Chart.js in frontend for visualizations
- Debounced search to avoid CoinGecko rate limits

---

## Authentication Routes

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| POST   | `/auth/register`   | Create user + return JWT             |
| POST   | `/auth/login`      | Authenticate + return JWT            |
| POST   | `/auth/logout`     | Revoke JWT (temp memory blocklist)  |
| GET    | `/auth/me`         | Validate + return current user       |
| POST   | `/auth/delete`     | (Testing only) delete test user      |

---

## User Routes

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get profile of logged-in user |
| GET | `/users/:id` | Get public profile & posts |
| PUT | `/users/profile/:id` | Update bio |
| POST | `/users/upload-profile-picture` | Upload image (max 5MB, png/jpg/gif) |

### Follow System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:id/followers` | List of followers |
| GET | `/users/:id/following` | List of following |
| GET | `/users/:id/is-following` | Check follow status |
| POST | `/users/:id/follow` | Follow a user |
| DELETE | `/users/:id/unfollow` | Unfollow a user |
| GET | `/users/followers/notifications` | Recent followers (paginated) |

---

## Post Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | Paginated posts |
| GET | `/posts/:id` | Get post w/ comments |
| POST | `/posts` | Create post (text + image + cryptoTag) |
| DELETE | `/posts/:id` | Delete your own post |

### Likes & Retweets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts/:id/like-status` | Check if post is liked |
| POST | `/posts/:id/like` | Like/unlike |
| GET | `/posts/:id/retweet-status` | Check retweet status |
| POST | `/posts/:id/retweet` | Retweet |
| DELETE | `/posts/:id/retweet` | Un-retweet |
| GET | `/posts/likes` | See who liked your posts |
| GET | `/posts/retweets` | Who retweeted your posts |
| GET | `/posts/likes/batch` | All liked post IDs |
| GET | `/posts/retweets/batch` | All retweeted post IDs |
| GET | `/posts/:id/profile-feed` | All posts & retweets by user |

---

## Comment Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/comments` | Comments for post |
| GET | `/comments/count` | Total for post |
| GET | `/comments/detailed` | Comments on your own posts |
| POST | `/comments` | Create comment |
| DELETE | `/comments/:id` | Delete your comment |

---

## Messaging Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages` | All conversations (paginated) |
| GET | `/messages/recent` | 5 most recent |
| GET | `/messages/detailed` | With sender info |
| GET | `/messages/search-users` | Search users to message |
| PATCH | `/messages/:id/read` | Mark as read |
| POST | `/messages` | Send message (text, image, tip) |

---

## Notification Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | All notifications (paginated) |
| GET | `/notifications/full` | With comment/message content |
| GET | `/notifications/tips` | Only tip notifications |
| PUT | `/notifications/:id/read` | Mark 1 notification read |
| PUT | `/notifications/mark-all-read` | Mark all read |
| POST | `/notifications/mark-all-read` | Alt: mark all read |
| POST | `/notifications` | Create new (internal trigger) |

### Supported Notification Types
- `like`
- `comment`
- `follow`
- `message`
- `transaction`
- `retweet`

---

## Search Route

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?query=solana` | Full-text search (users + posts) |

- Uses PostgreSQL `to_tsvector` + `plainto_tsquery`
- Cached for 60s with NodeCache
- Rate limited to 100/15min per IP

---

## File Upload Rules

- All uploads: `multipart/form-data`
- Profile pics max size: 5MB
- Stored in `/uploads/` directory

---

## Authentication Notes

- All protected routes require:
  `Authorization: Bearer <JWT>`
- JWT expires in 2 hours
- `/logout` revokes via memory store (no refresh tokens yet)

---

## Testing Notes

- `/auth/delete`: enabled only in test environments
- Used to create/delete test accounts during integration tests

---

## Pagination

- All list endpoints support:
  - `page`: default 1
  - `limit`: default 10 or 20 depending on route

---

## Rate Limiting

| Route | Limit |
|-------|-------|
| `/auth/login` | 5 requests / 5 min |
| `/search` | 100 requests / 15 min |

---

## Contact

For issues or API onboarding:
**Mathew Stevens**  
`mathewstevens7457@gmail.com`
