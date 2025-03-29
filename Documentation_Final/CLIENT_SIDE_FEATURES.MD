# SolPulse Frontend Features

## Solana Wallet Integration
SolPulse **integrates with Solana wallets** using the **Solana Wallet Adapter**. This allows users to:
- **Connect their Phantom wallet**
- **Fetch wallet balance**
- **Send SOL transactions**
- **Send crypto tips directly to other users**

### Technologies Used
- **Solana Wallet Adapter** for seamless wallet integration.
- **Solana Web3.js** to interact with the blockchain.
- **React Context API** for wallet state management.

### Wallet Functionalities
1️. **Connect Wallet:**  
- Users can connect their Phantom Wallet.
- No wallet details are stored on the backend.

2. **Fetch Wallet Balance:**  
- Uses `solana/web3.js` to retrieve SOL balance.

3️. **Send Transactions:**  
- Users can send SOL using Phantom Wallet.
- Transactions **are signed & sent by the user** (no backend processing).

4️. **Crypto Tips:**  
- Users can tip other users directly from their wallet.

---

## Token Modal (`TokenModal.js`)
- Allows users to **search and select tokens**.
- Uses `fetchTokenInfo()` to retrieve token details dynamically.
- **Supports both wallet tokens and searched tokens**.
- Opens when user taps a coin in the trade page or on their profile wallet.

---

## Transaction History (`CryptoTransaction.js`)
- Fetches **latest transactions** for a wallet.
- Filters **Sent, Received, Tips** transactions.
- Uses **Solana Web3.js** for real-time blockchain data.
- Shows **token name, logo, slot number, explorer link, and fee**.
- Displays **transaction type** (sent/received) with corresponding user avatar.

---

## Trade Page
- Fully functional **on-chain swap system** using Jupiter API.
- Users can:
  - **Select a token to sell**
  - **Choose a token to buy**
  - **View estimated output**
  - **Execute the swap using Phantom**
- Real-time integration with Jupiter’s route info & swap quote.
- Built with full error handling, fallback UI, and network loading states.

---

## Crypto Ticker (`CryptoTicker.js`)
- Displays real-time **Solana ecosystem coins**.
- Pulls data from **CoinGecko API** and caches results.
- Supports:
  - **Sorting by price, market cap, 24h volume**
  - **Search and filter**
  - **View price chart by timeframe (24h, 7d, 30d)**
- Clicking a coin opens a **modal chart with full market data**.

---

## Trending Crypto Page
- Uses CoinGecko API to show:
  - **Top gainers & losers**
  - **Trending NFTs**
  - **Global market dominance chart**
- Filtered to only show **relevant Solana ecosystem assets**.

---

## Explore Page
- Lists **public user accounts and recent activity**.
- Users can **search by username, bio, or wallet address**.
- Clicking a user opens their profile.
- Shows **Follow/Unfollow** button and recent posts.

---

## Search (Global)
- Full-text search bar built into **NavBar**.
- Searches both **users** (by username/email) and **posts** (by content).
- Debounced input and paginated results.
- Uses PostgreSQL full-text search on backend with Redis caching on repeat terms.

---

## Activity Page (`Activity.js`)
SolPulse includes a dynamic **Activity page** for tracking social and crypto-related interactions.

### Tabs (with filters):
1. **Likes** – Displays who liked your post with timestamp and preview.
2. **Reposts** – Shows which users reposted your content.
3. **Comments** – Summarizes comment interactions.
4. **Follows** – Lists users who followed you recently.
5. **Tips** – Shows tips you've received with SOL amount and sender.

### Additional Features:
- Real-time notifications through the **Notification Bell** (🔔 icon).
- Badges show unread notifications count.
- Clicking a tab fetches paginated data via backend `/notifications` API.

---

## Messaging Integration (Inbox Navigation)
- A dedicated **Messaging Inbox** can be accessed from the Activity page or navbar.
- Displays all private conversations, sorted by most recent.
- New messages display notification badges until marked as read.

### Inbox Features:
- Supports **file attachments** (images, text, etc).
- Real-time updates using polling or WebSocket extension.
- User avatars, timestamps, and unread indicators.

---

## Security Notes
- **Wallet interactions** are entirely client-side.
- **Transactions are never signed by SolPulse servers.**
- No wallet private keys or sensitive token info is ever stored or logged.

---


## Messaging
- Encrypted messaging system with:
  - **Message threads**
  - **Read receipts**
  - **Image/file attachment**
  - **Tipping integrated in chat**
- Infinite scroll for older messages.
- Search bar to find users.

---

## Feed
- Infinite scrolling feed of posts.
- Includes:
  - **Likes**
  - **Retweets**
  - **Comment preview**
  - **Lazy loading media**

---

## Profile Page
- Displays:
  - **Bio**
  - **Wallet Address**
  - **Posts, Tips, Followers, Following**
  - **SOL balance + wallet tokens**
- Users can edit their **bio** and **profile picture**.
- Lazy-loads older posts and wallet data.

---

## Error Handling
- Global `ErrorBoundary` for React app.
- Catches failed fetches and renders fallback UI.
- Wallet errors shown as toasts using `react-toastify`.

---

## UI/UX
- Built with **Tailwind CSS**.
- Dark mode enabled.
- Fully mobile responsive.
- Skeleton loading placeholders.
- Modals, dropdowns, and tooltips throughout.

---

**No wallet data is stored on SolPulse servers. All crypto actions are signed by the user client-side.**
