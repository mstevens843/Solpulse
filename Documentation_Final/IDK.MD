# 🌐 SolPulse Frontend Features

SolPulse delivers a seamless Solana-based social media experience by combining crypto-native tools with real-time interaction, wallet connectivity, and decentralized value exchange. This document summarizes all major frontend pages, components, and utilities in the project.

---

## 🏠 Home Page (`Home.js`)
- Displays the user's main feed using the `Feed` component.
- Integrates `CryptoTicker` for real-time Solana ecosystem prices.
- Uses `Explore` in the sidebar for discovery.
- Implements lazy loading with suspense.
- Includes a skeleton loader for perceived performance.

---

## 🔔 Activity Page (`ActivityPage.js`)
- Tabbed interface for:
  - Messages
  - Notifications
- Remembers selected tab using `localStorage`.
- Smooth fade-in transitions on view switch.

---

## 🧾 Notifications System (`NotificationsList.js`)
- Displays grouped notification types:
  - Likes, Retweets, Comments, Follows, Messages, Tips
- Supports:
  - Sorting by Newest, Oldest, Unread
  - Bulk mark as read
  - Per-notification read toggle
  - Paginated loading
- Optimizations:
  - Duplicate filtering
  - Fade-out animation on dismiss

---

## 💬 Messaging System
**Components**:
- `MessagesInbox.js`
- `MessageModal.js`
- `MessageButton.js`

### Features:
- Inbox with pagination and reply modal.
- Real-time search for recipients with autocomplete.
- File attachments via `FormData` (images, videos).
- Emoji picker (`emoji-mart`).
- Read receipts.
- Toast feedback for success/errors.

---

## 🪙 Wallet Integration
**Libraries**:
- `@solana/web3.js`
- `@solana/wallet-adapter`

### Features:
- Connect Phantom/Solflare wallet.
- Fetch on-chain balance.
- Handle token transfers (SOL, USDC placeholder).
- Wallet address used only client-side.

---

## 📝 Post System

### `Post.js`
- Displays post content, likes, retweets, comments.
- Real-time updates via WebSocket.
- Optimistic UI updates.
- Handles retweets and parent post fallbacks.
- Comment loading on demand.

### `PostModal.js`
- Expanded view of posts.
- Reuses `LikeButton`, `CommentSection`, `RetweetButton`.
- Streams comment updates in real time.

### `PostComposer.js`
- Create new post with:
  - Text input (280 char limit)
  - Media upload (drag & drop)
  - Error handling with `toast`
- File type and size validation.

### `CommentSection.js`
- Real-time comments with emoji picker.
- Supports modal and inline display.
- Tracks remaining characters.
- Accessible ARIA attributes.

---

## 🧪 Feed System

### `Feed.js`
- Infinite scroll with `IntersectionObserver`.
- Deduplicates posts globally by ID.
- Integrates `FeedFilter`, `PostComposer`.
- Scroll-to-top on post submission.

### `FeedFilter.js`
- Dropdown to filter:
  - Posts
  - Crypto Transactions
  - Media

---

## 🔎 Search System

### `SearchResults.js`
- Debounced query updates.
- Supports filters (Users / Posts).
- Server-side pagination.
- `Load More` button.

### `SearchBar.js`
- Autocomplete suggestions.
- Filter selector.
- Validation for empty queries.
- Clear/reset button.

---

## 👤 Profile System

### `Profile.js`
- Lazy loads posts and profile info.
- Editable profile picture and bio.
- Retry handling and error states.
- Modal for tipping (via `CryptoTip`).

### `UserCard.js`
- Displays mini profile card:
  - Profile image (with fallback)
  - Follower/following counts
  - Tip button
  - Message button
- Modal overlays for followers/following/message/tip.

### `FollowersFollowing.js`
- Reusable component for both followers and following.
- Cached per-user-type.
- Loading skeleton and retry support.

### `FollowButton.js`
- Toggle follow/unfollow.
- Optimistic updates with rollback on failure.
- ARIA support for accessibility.

---

## ⚙️ Settings Page (`Settings.js`)
- Update user preferences:
  - Email, Privacy, Wallet Address, Theme, Notifications
- Optional password change field.
- Deletes account with confirmation modal.
- Saves non-sensitive data to `localStorage`.

---

## 👥 Auth Pages

### `Login.js`
- Email/password login.
- Remember Me + token persistence.
- Toast-based feedback.
- Redirects if already authenticated.

### `Signup.js`
- Form validation (client + server).
- Password visibility toggle.
- Validates wallet address.
- Feedback on all failure types.

---

## 📈 Crypto Components

### `CryptoTicker.js`
- Displays top Solana coins.
- Filters out stablecoins.
- Allows sort by price, market cap, percent change.
- Modal chart per coin (via `CryptoChartModal.js`).
- Fetches every 60s with retry.

### `CryptoChartModal.js`
- Renders Chart.js line graph for selected coin.
- Timeframe selector (1D, 7D, 30D, 90D).
- Accessible modal behavior.

### `CryptoTip.js`
- Send SOL tips using Phantom wallet.
- Notifies backend after confirmation.
- Validates amount + connection.
- SOL supported now, USDC placeholder.

### `CryptoTransaction.js`
- Displays transaction with:
  - Type, amount, USD value
  - Explorer link, fee, from/to, slot
- Expandable detail view.

### `CryptoWallet.js`
- Pulls latest 5 transactions.
- Filters (Sent, Received, Tips).
- LocalStorage cache for performance.
- USD conversion from CoinGecko.
- Sort order (latest/oldest).

### `TokenModal.js`
- Modal to select tokens.
- Live search via token API.
- Displays name, symbol, price, logo, change%.
- Handles broken images and errors.
- Caches searched tokens.

---

## 📦 Media Handling

### `MediaUpload.js`
- Accepts images/videos.
- Validates type/size.
- Displays file name.
- Progress bar indicator.

---

## 🔍 Explore Page (`Explore.js`)
- Shows trending posts.
- Infinite scroll for hot content.
- Filter by 24h/week/month.
- Post search bar.

---

## 💱 Trade Page (`Trade.js`)
- Jupiter API integration for token swaps.
- On-demand token selection via `TokenModal`.
- Quote fetching and transaction execution.
- Retry logic + debounce for quote fetches.
- Friendly error mapping.

---

## 📈 Trending Page (`TrendingCrypto.js`)
- Real-time charts for:
  - Top coins
  - Gainers/Losers
  - NFT activity
  - Global market dominance
- Search, refresh, and toast feedback.
- Uses fallback images for failed logos.

---

## ✅ Utilities

| Utility | Purpose |
|--------|---------|
| `fetchWithBackoff()` | Retry API requests with exponential backoff. |
| `FallbackImage.jsx` | Replaces broken image links across the app. |
| `debounce` (lodash) | Used in Ticker, Search, Wallet, Trade, etc. |
| `toast` (react-toastify) | Unified success/error feedback. |
| `localStorage` | Used for caching user settings, wallet data. |

---

## 🔒 Authentication

- JWT token stored in `localStorage`.
- `/auth/me` hit on refresh to restore session.
- Protects private routes.
- Logout clears storage and context.

---

## ✅ Additional Features

- Lazy loading via `loading="lazy"` for images.
- Accessibility labels across form inputs and buttons.
- Skeleton loaders for slow-loading data.
- ARIA attributes for all interactive controls.
- Auto-dismiss toasts after success/error.

---

Let me know if you want a **backend README** to pair with this, or an **index table of contents** at the top.
✅ Next Steps (Optional):
Add top-level table of contents with anchors ([🏠 Home Page](#🏠-home-page-homejs))

Break this README into per-feature files for massive projects

Link this README from your main README.md under “Frontend Features”

Would you like this exact output as a downloadable .md file in your repo structure once the file tool is back? Or want a version for Notion or Google Docs too?